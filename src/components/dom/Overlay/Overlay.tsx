import * as React from "react";
import styled from "styled-components";
import styles from "./Overlay.module.css";

interface FSProps {
    r: boolean;
}

function Overlay({ ready, set }: any) {
     
    return (
        <FullscreenDiv r={ready} style={{ opacity: ready ? 0 : 1 }}>
            <CenterDiv>
                <StyledH1>Start Visualizer</StyledH1>
                <button style={{ cursor: "hand" }} onClick={() => set(true)}>
                    ▶️
                </button>
            </CenterDiv>
        </FullscreenDiv>
    );
}

const FullscreenDiv = styled.div<FSProps>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all 1s;
    background-color: #323232;
    opacity: var(--opacity);
`;

const CenterDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const StyledH1 = styled.h1`
    color: #e8d6cb;
    font-size: 2rem;
`;

export default Overlay;
