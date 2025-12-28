import { AUDIO_CONSTANTS } from './audioConstants';
import { createAudioBuffer, decodeGeminiAudio } from './audioProcessor';
import { logger } from '@/lib/logger';

interface AudioQueue {
    nextStartTime: number;
    isPlaying: boolean;
}

export class AudioPlayer {
    private audioContext: AudioContext;
    private queue: AudioQueue = {
        nextStartTime: 0,
        isPlaying: false,
    };
    private playbackAnalyser: AnalyserNode | null = null;
    private onAnalyserChange?: (analyser: AnalyserNode | null) => void;
    private gainNode: GainNode;
    private readonly VOLUME = 0.9; // Slightly below 1.0 to prevent clipping

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
        this.gainNode = audioContext.createGain();
        this.gainNode.gain.value = this.VOLUME;
        this.gainNode.connect(audioContext.destination);
    }

    setAnalyserCallback(callback: (analyser: AnalyserNode | null) => void) {
        this.onAnalyserChange = callback;
    }

    // Play Gemini audio chunk with proper queueing
    playChunk(
        base64: string,
        onStart?: () => void,
        onEnd?: () => void
    ): void {
        try {
            const pcmData = decodeGeminiAudio(base64);
            const audioBuffer = createAudioBuffer(
                pcmData,
                AUDIO_CONSTANTS.GEMINI_SAMPLE_RATE,
                this.audioContext
            );

            const duration = audioBuffer.duration;
            const currentTime = this.audioContext.currentTime;
            const isFirstChunk = !this.queue.isPlaying;
            const scheduledStartTime = isFirstChunk
                ? currentTime
                : Math.max(currentTime, this.queue.nextStartTime);

            this.queue.nextStartTime = scheduledStartTime + duration;
            this.queue.isPlaying = true;

            logger.debug('Scheduling audio:', {
                isFirstChunk,
                currentTime: currentTime.toFixed(3),
                scheduledStart: scheduledStartTime.toFixed(3),
                duration: duration.toFixed(3),
                nextStart: this.queue.nextStartTime.toFixed(3),
            });

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;

            const analyser = this.createPlaybackAnalyser();
            source.connect(analyser);
            analyser.connect(this.gainNode);

            this.playbackAnalyser = analyser;
            this.onAnalyserChange?.(analyser);

            if (isFirstChunk) {
                onStart?.();
            }

            source.start(scheduledStartTime);

            source.onended = () => {
                const timeSinceEnd = this.audioContext.currentTime;
                if (timeSinceEnd >= this.queue.nextStartTime - 0.1) {
                    logger.debug('Last audio chunk ended');
                    onEnd?.();
                    this.queue.nextStartTime = 0;
                    this.queue.isPlaying = false;
                    this.playbackAnalyser = null;
                    this.onAnalyserChange?.(null);
                }
            };
        } catch (error) {
            logger.error('Error playing audio chunk:', error);
            // Silently handle audio playback errors - don't disrupt user experience
            onEnd?.();
        }
    }

    private createPlaybackAnalyser(): AnalyserNode {
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = AUDIO_CONSTANTS.FFT_SIZE;
        analyser.smoothingTimeConstant = AUDIO_CONSTANTS.SMOOTHING_TIME_CONSTANT;
        analyser.minDecibels = AUDIO_CONSTANTS.MIN_DECIBELS;
        analyser.maxDecibels = AUDIO_CONSTANTS.MAX_DECIBELS;
        return analyser;
    }

    getPlaybackAnalyser(): AnalyserNode | null {
        return this.playbackAnalyser;
    }

    reset(): void {
        this.queue.nextStartTime = 0;
        this.queue.isPlaying = false;
        this.playbackAnalyser = null;
        this.onAnalyserChange?.(null);
    }
}

