import type { NextPage } from "next";
import styled from "styled-components";
import { useControls } from "leva";
import { useState, Suspense } from "react";
import CanvasLayout from "../components/layout/CanvasLayout";
import DomLayout from "../components/layout/DomLayout";
import Overlay from "../components/dom/Overlay";
import Wave from "../components/canvas/Wave";
import { suspend } from "suspend-react";
import Visualizer from "../components/canvas/Visualizer";
import song from "../audio/icoHeal08.mp3";
import song2 from "../audio/lastSurprise.mp3";

// dom components go here
const DOM = ({ ready, set }: any) => {
    return (
        <DomLayout>
            <Overlay ready={ready} set={set} />
        </DomLayout>
    );
};

// canvas components go here
const R3F = () => {
    // Leva's useControl causes the ReactDOM.render warning that shows in the console
    //comment out if u dont want error
    const { color, hoverColor } = useControls({
        color: "#c1b61f",
        hoverColor: "#2d52ad",
    });

    return (
        <CanvasLayout>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            {/* <Wave /> */}
            <Suspense fallback={null}>
                <Visualizer position-z={4.5} url={song} />
            </Suspense>
        </CanvasLayout>
    );
};

const Home: NextPage = () => {
    const [ready, set] = useState(false);

    // set true while i implement visualier
    return (
        <>
            {ready && <R3F />}
            <DOM ready={ready} set={set} />
        </>
    );
};

export default Home;
