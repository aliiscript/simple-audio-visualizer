export const vertex = /*glsl*/ `
    uniform float uTime;
    // the number in the bracket can be though of
    // as the resolution for the samples
    // smaller it is the lower resolution it is and the less you see
    // and vice versa
    uniform float frequencyData[64];
    varying vec2 vUv;
    varying float vData;
    
    vec3 random3(vec3 c) {
      float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
      vec3 r;
      r.z = fract(512.0*j);
      j *= .125;
      r.x = fract(512.0*j);
      j *= .125;
      r.y = fract(512.0*j);
      return r-0.5;
  }

    const float F3 =  0.3333333;
    const float G3 =  0.1666667;
    float snoise(vec3 p) {

        vec3 s = floor(p + dot(p, vec3(F3)));
        vec3 x = p - s + dot(s, vec3(G3));

        vec3 e = step(vec3(0.0), x - x.yzx);
        vec3 i1 = e*(1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy*(1.0 - e);

        vec3 x1 = x - i1 + G3;
        vec3 x2 = x - i2 + 2.0*G3;
        vec3 x3 = x - 1.0 + 3.0*G3;

        vec4 w, d;

        w.x = dot(x, x);
        w.y = dot(x1, x1);
        w.z = dot(x2, x2);
        w.w = dot(x3, x3);

        w = max(0.6 - w, 0.0);

        d.x = dot(random3(s), x);
        d.y = dot(random3(s + i1), x1);
        d.z = dot(random3(s + i2), x2);
        d.w = dot(random3(s + 1.0), x3);

        w *= w;
        w *= w;
        d *= w;

        return dot(d, vec4(52.0));
    }

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

export const fragment = 
/*glsl*/ `
      uniform float uTime;
      varying vec2 vUv;
      varying float vData;
      void main() {
        vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), vUv.x);

        vec3 colMix = mix(color, vec3(vData / 1000.0), vUv.x);
        gl_FragColor = vec4(colMix, 1.0);
      }
    `;
