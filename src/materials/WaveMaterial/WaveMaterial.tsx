import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { ShaderMaterial } from "three";
import { suspend } from "suspend-react";
import { vertex, fragment } from "./shaders";

type WaveMaterialImpl = JSX.IntrinsicElements["shaderMaterial"];

declare global {
    namespace JSX {
        interface IntrinsicElements {
            waveMaterial: WaveMaterialImpl;
        }
    }
}

type WaveMaterialProps = JSX.IntrinsicElements["shaderMaterial"] & {
    url: any;
};

const WaveMat = shaderMaterial(
    { uTime: 0, frequencyData: 0 },
    vertex,
    fragment
);

extend({ WaveMat });

export function WaveMaterial({
    url,
    ...props
}: WaveMaterialProps) {
    extend({ WaveMaterial: WaveMat });

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

    useFrame((state) => {
        if (analyserRef.current) {
            // added ignore since Shadermaterial does not have uTime value
            // @ts-ignore
            waveMaterial.current.uTime += state.clock.getElapsedTime();
            analyserRef.current.getByteFrequencyData(data);

            //console.log(data);
            // @ts-ignore
            waveMaterial.current.frequencyData = data;
        }

        //console.log(data);
    });

    return (
        <waveMaterial key={WaveMat.key} ref={waveMaterial} {...props} />
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
