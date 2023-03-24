import * as React from "react";
import * as THREE from "three";
import { WaveMaterial } from "../../../materials/WaveMaterial/WaveMaterial";

function Visualizer({ url }: any) {
    // Create a curve based on the points
    const [path, setCurve] = React.useState(() => {
        // Create an empty array to stores the points
        let points = [];
        // i can be thought of as a shaping functon
        // to process it better mentally
        // this loop makes the curve smaller or shorter along x-axis
        for (let i = 0; i < 2; i += 1) {
            points.push(new THREE.Vector3(i, 0, 0));
        }
        console.log("The path:");
        console.table(points);
        return new THREE.CatmullRomCurve3(points);
    });

    let tubularSegments = 1000;
    let radius = 0.08;
    let radialSegments = 50;
    let closed = false;

    return (
        <>
            <mesh position={[-0.5, 0, 0]}>
                <tubeBufferGeometry
                    args={[
                        path,
                        tubularSegments,
                        radius,
                        radialSegments,
                        closed,
                    ]}
                />
                <WaveMaterial url={url} />
            </mesh>
        </>
    );
}

export default Visualizer;
