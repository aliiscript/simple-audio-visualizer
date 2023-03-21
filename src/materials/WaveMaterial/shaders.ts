export const vertex = /*glsl*/ `
    uniform float uTime;
    uniform float frequencyData[32];
    varying vec2 vUv;
    varying float vData;
    void main() {
        vec3 pos = position;
        float frequency = frequencyData[int(pos.x * 25.0)];
        pos.y += frequency / 750.0;
        vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
        // change modelPosition.y with audio frequencies maybe/data
        //modelPosition.y += sin(modelPosition.x * 5.);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectionPosition = projectionMatrix * viewPosition;
        gl_Position = projectionPosition;
        // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
        vData = frequency;
    }
`;

export const fragment = /*glsl*/ `
      uniform float uTime;
      varying vec2 vUv;
      varying float vData;
      void main() {
        vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), vUv.x);

        vec3 colMix = mix(color, vec3(vData / 1000.0), vUv.x);
        gl_FragColor = vec4(colMix, 1.0);
      }
    `;
