import { useState, useEffect, useRef, memo } from "react";

//declare module '*.mp3'
import song from "../../audio/icoHeal08.mp3";

function AudioComponent() {
    const [playState, setPlayState] = useState("stop");
    const [source, setSource] = useState<
        MediaElementAudioSourceNode | undefined
    >(); // specify the type of the state variable
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // useEffect in Nextjs is client side 
    useEffect(() => {
        audioRef.current = new Audio(song);

        audioCtxRef.current = new AudioContext();
        const source = audioCtxRef.current.createMediaElementSource(
            audioRef.current as HTMLMediaElement // explicitly cast audioRef.current to HTMLMediaElement to avoid type errors
        );
        const volume = audioCtxRef.current.createGain();
        volume.gain.value = 0.5;
        source.connect(volume);
        volume.connect(audioCtxRef.current.destination);

        //source.connect(audioCtxRef.current.destination);
        setSource(source);
    }, []);

    return (
        <div>
            <button
                className="play"
                onClick={() => {
                    if (audioCtxRef.current?.state === "suspended") {
                        audioCtxRef.current.resume();
                    }
                    audioRef.current?.play();
                }}
            >
                play
            </button>
            <button
                className="pause"
                onClick={() => {
                    audioRef.current?.pause();
                }}
            >
                pause
            </button>
        </div>
    );
}

export default memo(AudioComponent);
