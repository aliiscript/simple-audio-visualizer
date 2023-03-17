import * as React from "react";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { extend, useFrame, MaterialNode } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { ShaderMaterial } from "three";
import * as THREE from "three";
import song from "../../../audio/icoHeal08.mp3";

type WaveMaterialImpl = {} & JSX.IntrinsicElements["shaderMaterial"];

declare global {
    namespace JSX {
        interface IntrinsicElements {
            waveMaterial: WaveMaterialImpl;
        }
    }
}

export const WaveMaterial = shaderMaterial(
    { uTime: 0 },
    // vertex shader
    /*glsl*/ `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
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

function Wave() {
    const [source, setSource] = useState<
        MediaElementAudioSourceNode | undefined
    >(); // specify the type of the state variable
    const [panValue, setPanValue] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const pannerRef = useRef<StereoPannerNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    const dataArr = useRef<any>(null);

    const waveMaterial = useRef<ShaderMaterial>(null);
    const waveMaterial2 = useRef<ShaderMaterial>(null);

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

    // audio useEffect
    // useEffect in Nextjs is client side
    useEffect(() => {
        audioRef.current = new Audio(song);

        audioCtxRef.current = new AudioContext();

        const track = audioCtxRef.current.createMediaElementSource(
            audioRef.current as HTMLMediaElement // explicitly cast audioRef.current to HTMLMediaElement to avoid type errors
        );

        const analyser = audioCtxRef.current.createAnalyser();

        const volume = audioCtxRef.current.createGain();
        volume.gain.value = 1.0;

        const pannerOptions = { pan: 0.0 };
        pannerRef.current = new StereoPannerNode(
            audioCtxRef.current,
            pannerOptions
        );
        const panner = pannerRef.current;

        // this is a chain so: track -> volume -> panner -> destination(speakers)
        track.connect(volume);
        volume.connect(panner);
        panner.connect(analyser);
        analyser.connect(audioCtxRef.current.destination);

        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        dataArr.current = new Uint8Array(bufferLength);

        //source.connect(audioCtxRef.current.destination);
        setSource(track);
    }, []);

    useFrame((state) => {
        if (waveMaterial.current) {
            // added ignore since Shadermaterial does not have uTime value
            // @ts-ignore
            waveMaterial.current.uTime += state.clock.getElapsedTime();
        }
        if (waveMaterial2.current) {
            // added ignore since Shadermaterial does not have uTime value
            // @ts-ignore
            waveMaterial2.current.uTime += state.clock.getElapsedTime();
        }

        if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArr.current);
            console.log("data after getting frequency data:");
            console.log(dataArr);
        }
    });

    let tubularSegments = 20;
    let radius = 0.1;
    let radialSegments = 5;
    let closed = false;

    return (
        <>
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
            <mesh position={[0, -2, 0]}>
                <planeBufferGeometry args={[1, 1, 1, 1]} />
                <waveMaterial key={WaveMaterial.key} ref={waveMaterial2} />
            </mesh>
        </>
    );
}

export default Wave;
