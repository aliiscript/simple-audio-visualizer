import * as React from "react";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { suspend } from "suspend-react";
import { shaderMaterial } from "@react-three/drei";
import { ShaderMaterial } from "three";
import { InstancedMesh } from "three";

type WaveMaterialImpl = {} & JSX.IntrinsicElements["shaderMaterial"];

declare global {
    namespace JSX {
        interface IntrinsicElements {
            waveMaterial: WaveMaterialImpl;
        }
    }
}

export const WaveMaterial = shaderMaterial(
    { uTime: 0, frequencyData: 0 },
    // vertex shader
    /*glsl*/ `
      uniform float uTime;
      uniform float frequencyData;
      varying vec2 vUv;
      void main() {
        vec3 pos = position;
        float frequency = frequencyData;
        pos.y += frequency;
        vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
        // change modelPosition.y with audio frequencies maybe/data
        //modelPosition.y += sin(modelPosition.x * 5.);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectionPosition = projectionMatrix * viewPosition;
        gl_Position = projectionPosition;
        // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
      }
    `,
    // fragment shader
    /*glsl*/ `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(vUv, 0.0, 1.0);
      }
    `
);

extend({ WaveMaterial });

function Visualizer({
    url,
    y = 2500,
    space = 1.25,
    width = 0.01,
    height = 0.05,
    obj = new THREE.Object3D(),
    ...props
}: any) {
    // Create a curve based on the points
    const [path, setCurve] = React.useState(() => {
        // Create an empty array to stores the points
        let points = [];
        // i can be thought of as a shaping functon
        // to process it better mentally
        // this loop makes the curve smaller or shorter along x-axis
        for (let i = 0; i < 5; i += 1) {
            points.push(new THREE.Vector3(i, 0, 0));
        }
        console.log("The path:");
        console.table(points);
        return new THREE.CatmullRomCurve3(points);
    });

    const ref = useRef<InstancedMesh | null>(null);
    const waveMaterial = useRef<ShaderMaterial>(null);
    const analyserRef = useRef<AnalyserNode>();

    // suspend-react is the library that r3f uses internally for useLoader. It caches promises and
    // integrates them with React suspense. You can use it as-is with or without r3f.
    const { gain, context, analyser, update, data } = suspend(
        () => createAudio(url),
        [url]
    );
    useEffect(() => {
        analyserRef.current = analyser;
        // Connect the gain node, which plays the audio
        gain.connect(context.destination);
        // Disconnect it on unmount
        return () => gain.disconnect();
    }, [gain, context, analyser]);

    useEffect(() => {
        console.log(ref.current);
    });

    useFrame((state) => {
        if (analyserRef.current) {
            // added ignore since Shadermaterial does not have uTime value
            // @ts-ignore
            waveMaterial.current.uTime += state.clock.getElapsedTime();
            analyserRef.current.getByteFrequencyData(data);
            // @ts-ignore
            waveMaterial.current.frequencyData = data;
            //console.log(data)
        }

        let avg = update();
        // Distribute the instanced planes according to the frequency daza
        for (let i = 0; i < data.length; i++) {
            obj.position.set(
                i * width * space - (data.length * width * space) / 2,
                data[i] / y,
                0
            );
            obj.updateMatrix();
            if (ref.current) {
                ref.current.setMatrixAt(i, obj.matrix);
            }
        }

        // Set the hue according to the frequency average
        if (ref.current) {
            // @ts-ignore
            // ref.current.material.color.setHSL(avg / 50, 0.75, 0.75);
            // console.log(avg)
            ref.current.instanceMatrix.needsUpdate = true;
        }
    });

    let tubularSegments = 20;
    let radius = 0.1;
    let radialSegments = 5;
    let closed = false;

    return (
        <>
            <instancedMesh
                castShadow
                ref={ref}
                args={[null, null, data.length]}
                {...props}
            >
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial />
                {/* <waveMaterial key={WaveMaterial.key} ref={waveMaterial} /> */}
            </instancedMesh>
            <mesh>
                <tubeBufferGeometry
                    args={[
                        path,
                        tubularSegments,
                        radius,
                        radialSegments,
                        closed,
                    ]}
                />
                <waveMaterial key={WaveMaterial.key} ref={waveMaterial} />
            </mesh>
        </>
    );
}

async function createAudio(url: any) {
    // using the web audio api
    // Step 1: creating audioContext
    const context = new window.AudioContext();

    // Step 2: Fetch audio data and create a buffer source
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const source = context.createBufferSource();

    // Step 3: decode the audio into the buffer source node
    source.buffer = await new Promise((res) =>
        context.decodeAudioData(buffer, res)
    );
    source.loop = true;

    // This is why it doesn't run in Safari 🍏🐛. Start has to be called in an onClick event
    // which makes it too awkward for a little demo since you need to load the async data first
    source.start(0);
    // Create gain node and an analyser
    const gain = context.createGain();

    // Remove to get volume back
    gain.gain.setValueAtTime(0, context.currentTime);

    // Step 4: create analyzer node to see the data using real time frequency data
    const analyser = context.createAnalyser();
    analyser.fftSize = 64;

    source.connect(analyser);
    analyser.connect(gain);

    // Step 6: The data array receive the audio frequencies
    const data: any = new Uint8Array(analyser.frequencyBinCount);

    return {
        context,
        analyser,
        source,
        gain,
        data,
        // This function gets called every frame per audio source
        update: () => {
            analyser.getByteFrequencyData(data);
            // Calculate a frequency average
            return (data.avg = data.reduce(
                (prev: any, cur: any) => prev + cur / data.length,
                0
            ));
        },
    };
}

function normalize(min: number, max: number) {
    var delta = max - min;
    return function (val: number) {
        return (val - min) / delta;
    };
}

export default Visualizer;
