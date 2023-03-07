import * as React from "react";
import { useRef } from "react";
import { extend, useFrame, MaterialNode } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { ShaderMaterial } from "three";

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
      varying vec2 vUv;
      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
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
        gl_FragColor = vec4(vUv, sin(uTime/1012.0), 1.0);
      }
    `
);

extend({ WaveMaterial });

function Wave() {
    const waveMaterial = useRef<ShaderMaterial>(null);
    const waveMaterial2 = useRef<ShaderMaterial>(null);

    let uTime;
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
    });

    return (
        <>
            <mesh position={[0, 2, 0]}>
                <boxBufferGeometry args={[10, 0.1, 0.1, 10, 1, 1]} />
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
