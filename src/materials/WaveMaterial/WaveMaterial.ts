import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { vertex, fragment } from "./shaders";
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
    vertex,
    fragment
);

extend({ WaveMaterial });
