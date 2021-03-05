import React, { useEffect, useState } from 'react';

// Thanks https://stackoverflow.com/questions/47686345/playing-sound-in-reactjs

const useAudio = url => {
    const [audio, setAudio] = useState(new Audio(url));
    const [playing, setPlaying] = useState(false);

    const toggle = () => setPlaying(!playing);
    const play = () => setPlaying(true);
    const stop = () => setPlaying(false);

    useEffect(() => {
            if (playing) {
                audio.play();
            } else {
                audio.pause();
                audio.load();
            }
        },
        [playing]
    );

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };
    }, [audio]);

    useEffect(() => {
        if (audio.src !== url) {
            setPlaying(false);

            setAudio(new Audio(url));
        }
    }, [url])

    return [playing, toggle, play, stop];
};

export default useAudio;