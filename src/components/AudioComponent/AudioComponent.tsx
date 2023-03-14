import { useState, useEffect, useRef, memo } from "react";
import { useControls } from "leva";

//declare module '*.mp3'
import song from "../../audio/icoHeal08.mp3";

function AudioComponent() {
    const [source, setSource] = useState<
        MediaElementAudioSourceNode | undefined
    >(); // specify the type of the state variable
    const [panValue, setPanValue] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const pannerRef = useRef<StereoPannerNode | null>(null);

    // useEffect in Nextjs is client side
    useEffect(() => {
        audioRef.current = new Audio(song);

        audioCtxRef.current = new AudioContext();
        const track = audioCtxRef.current.createMediaElementSource(
            audioRef.current as HTMLMediaElement // explicitly cast audioRef.current to HTMLMediaElement to avoid type errors
        );
        const volume = audioCtxRef.current.createGain();
        volume.gain.value = 1.0;

        const pannerOptions = { pan: 0.0 };
        pannerRef.current = new StereoPannerNode(
            audioCtxRef.current,
            pannerOptions
        );
        const panner = pannerRef.current;
        track.connect(volume);
        volume.connect(panner);
        panner.connect(audioCtxRef.current.destination);

        //source.connect(audioCtxRef.current.destination);
        setSource(track);
    }, []);

    const handlePanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (pannerRef.current) {
            setPanValue(Number(event.target.value));
            pannerRef.current.pan.value = Number(event.target.value);
        }
    };

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
            <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={panValue}
                onChange={handlePanChange}
            />
        </div>
    );
}

export default memo(AudioComponent);
