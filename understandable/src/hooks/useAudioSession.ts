import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';
import { AUDIO_CONSTANTS } from '@/services/audio/audioConstants';
import { AudioPlayer } from '@/services/audio/audioPlayer';
import { PCM_WORKLET_CODE, pcm16ToBase64, resamplePCM16 } from '@/services/audio/audioProcessor';

interface UseAudioSessionReturn {
    audioContext: AudioContext | null;
    micAnalyser: AnalyserNode | null;
    playbackAnalyser: AnalyserNode | null;
    activeAnalyser: AnalyserNode | null;
    isMuted: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    mute: () => void;
    unmute: () => void;
    setOnAudioReceived: (callback: (base64: string) => void) => void;
    setActiveAnalyser: (analyser: AnalyserNode | null) => void;
    getAudioPlayer: () => AudioPlayer | null;
}

export function useAudioSession(onAudioReceived?: (base64: string) => void): UseAudioSessionReturn {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
    const [playbackAnalyser, setPlaybackAnalyser] = useState<AnalyserNode | null>(null);
    const [activeAnalyser, setActiveAnalyserState] = useState<AnalyserNode | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const micStreamRef = useRef<MediaStream | null>(null);
    const pcmWorkletRef = useRef<AudioWorkletNode | null>(null);
    const audioPlayerRef = useRef<AudioPlayer | null>(null);
    const onAudioReceivedRef = useRef(onAudioReceived);

    const setActiveAnalyser = useCallback((analyser: AnalyserNode | null) => {
        setActiveAnalyserState(analyser);
    }, []);

    const getAudioPlayer = useCallback(() => {
        return audioPlayerRef.current;
    }, []);

    useEffect(() => {
        onAudioReceivedRef.current = onAudioReceived;
    }, [onAudioReceived]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;

            const context = new AudioContext();
            setAudioContext(context);
            const sampleRate = context.sampleRate;

            await context.audioWorklet.addModule(
                URL.createObjectURL(
                    new Blob([PCM_WORKLET_CODE], { type: 'application/javascript' })
                )
            );

            const source = context.createMediaStreamSource(stream);

            // Create mic analyser
            const analyser = context.createAnalyser();
            analyser.fftSize = AUDIO_CONSTANTS.FFT_SIZE;
            analyser.smoothingTimeConstant = AUDIO_CONSTANTS.SMOOTHING_TIME_CONSTANT;
            analyser.minDecibels = AUDIO_CONSTANTS.MIN_DECIBELS;
            analyser.maxDecibels = AUDIO_CONSTANTS.MAX_DECIBELS;

            const gainNode = context.createGain();
            gainNode.gain.value = 0;

            source.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(context.destination);

            setMicAnalyser(analyser);
            setActiveAnalyserState(analyser);

            // Create PCM worklet
            const pcmWorklet = new AudioWorkletNode(context, 'pcm-processor');
            pcmWorkletRef.current = pcmWorklet;

            pcmWorklet.port.onmessage = (event) => {
                const pcmChunk: Int16Array = event.data;
                const resampledPCM = resamplePCM16(
                    pcmChunk,
                    sampleRate,
                    AUDIO_CONSTANTS.TARGET_SAMPLE_RATE
                );
                const base64Audio = pcm16ToBase64(resampledPCM);
                onAudioReceivedRef.current?.(base64Audio);
            };

            source.connect(pcmWorklet);

            // Create audio player
            const audioPlayer = new AudioPlayer(context);
            audioPlayer.setAnalyserCallback((analyser) => {
                setPlaybackAnalyser(analyser);
                setActiveAnalyserState(analyser || analyser);
            });
            audioPlayerRef.current = audioPlayer;
        } catch (error) {
            logger.error('Error starting recording:', error);
            // Clean up on error
            micStreamRef.current?.getTracks().forEach((track) => track.stop());
            micStreamRef.current = null;
            throw error;
        }
    }, [micAnalyser]);

    const stopRecording = useCallback(async () => {
        micStreamRef.current?.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;

        if (audioContext) {
            await audioContext.close();
            setAudioContext(null);
        }

        pcmWorkletRef.current = null;
        audioPlayerRef.current?.reset();
        audioPlayerRef.current = null;

        setMicAnalyser(null);
        setPlaybackAnalyser(null);
        setActiveAnalyserState(null);
        setIsMuted(false);
    }, [audioContext]);

    const mute = useCallback(() => {
        micStreamRef.current?.getTracks().forEach((track) => {
            track.enabled = false;
        });
        setIsMuted(true);
    }, []);

    const unmute = useCallback(() => {
        micStreamRef.current?.getTracks().forEach((track) => {
            track.enabled = true;
        });
        setIsMuted(false);
    }, []);

    const setOnAudioReceived = useCallback((callback: (base64: string) => void) => {
        onAudioReceivedRef.current = callback;
    }, []);

    return {
        audioContext,
        micAnalyser,
        playbackAnalyser,
        activeAnalyser,
        isMuted,
        startRecording,
        stopRecording,
        mute,
        unmute,
        setOnAudioReceived,
        setActiveAnalyser,
        getAudioPlayer,
    };
}
