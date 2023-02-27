import * as React from 'react';

function Wave() {
  return (
      <mesh position={[0, 2, 0]}>
          <boxBufferGeometry args={[10, .1, .1, 10, 1, 1]} />
          <meshPhongMaterial color={"#1fc12f"} wireframe={true} />
      </mesh>
  );
}

export default Wave;
