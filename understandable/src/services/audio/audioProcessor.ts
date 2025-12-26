import { AUDIO_CONSTANTS } from './audioConstants';

// PCM Worklet code for converting Float32 audio to Int16 PCM
export const PCM_WORKLET_CODE = `
    class PCMProcessor extends AudioWorkletProcessor {
        process(inputs) {
            const input = inputs[0];
            if (!input || !input[0]) return true;

            const channel = input[0];

            const pcm16 = new Int16Array(channel.length);
            for (let i = 0; i < channel.length; i++) {
                const s = Math.max(-1, Math.min(1, channel[i]));
                pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(s * 32768)));
            }

            this.port.postMessage(pcm16);
            return true;
        }
    }

    registerProcessor('pcm-processor', PCMProcessor);
`;

// Resample PCM16 audio from sourceRate to targetRate
export function resamplePCM16(
    input: Int16Array,
    sourceRate: number,
    targetRate: number
): Int16Array {
    if (sourceRate === targetRate) {
        return input;
    }

    const ratio = sourceRate / targetRate;
    const outputLength = Math.floor(input.length / ratio);
    const output = new Int16Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
        const srcIndex = i * ratio;
        const srcIndexFloor = Math.floor(srcIndex);
        const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
        const t = srcIndex - srcIndexFloor;

        output[i] = Math.round(input[srcIndexFloor] * (1 - t) + input[srcIndexCeil] * t);
    }

    return output;
}

// Convert Int16Array PCM to base64 string
export function pcm16ToBase64(pcm16: Int16Array): string {
    const bytes = new Uint8Array(pcm16.buffer);
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary);
}

// Decode Gemini audio (base64 PCM) to Int16Array
export function decodeGeminiAudio(base64: string): Int16Array {
    const binaryString = atob(base64);
    const audioBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        audioBytes[i] = binaryString.charCodeAt(i);
    }

    const byteLength = audioBytes.length - (audioBytes.length % 2);
    const sampleCount = byteLength / 2;
    const pcmData = new Int16Array(sampleCount);
    const dataView = new DataView(audioBytes.buffer, 0, byteLength);

    for (let i = 0; i < sampleCount; i++) {
        pcmData[i] = dataView.getInt16(i * 2, true);
    }

    return pcmData;
}

// Create AudioBuffer from PCM16 data with resampling
export function createAudioBuffer(
    pcmData: Int16Array,
    sourceSampleRate: number,
    audioContext: AudioContext
): AudioBuffer {
    const targetSampleRate = audioContext.sampleRate;
    const duration = pcmData.length / sourceSampleRate;
    const frameCount = Math.ceil(duration * targetSampleRate);
    const audioBuffer = audioContext.createBuffer(1, frameCount, targetSampleRate);
    const channelData = audioBuffer.getChannelData(0);

    if (targetSampleRate === sourceSampleRate) {
        const copyLength = Math.min(pcmData.length, frameCount);
        for (let i = 0; i < copyLength; i++) {
            channelData[i] = pcmData[i] / AUDIO_CONSTANTS.PCM_MAX_VALUE;
        }
        for (let i = copyLength; i < frameCount; i++) {
            channelData[i] = 0;
        }
    } else {
        const ratio = sourceSampleRate / targetSampleRate;
        for (let i = 0; i < frameCount; i++) {
            const srcIndex = i * ratio;
            const srcIndexFloor = Math.floor(srcIndex);
            const srcIndexCeil = Math.min(srcIndexFloor + 1, pcmData.length - 1);

            if (srcIndexFloor < 0 || srcIndexFloor >= pcmData.length) {
                channelData[i] = 0;
                continue;
            }

            const t = srcIndex - srcIndexFloor;
            const sample1 = pcmData[srcIndexFloor] / AUDIO_CONSTANTS.PCM_MAX_VALUE;
            const sample2 =
                srcIndexCeil < pcmData.length
                    ? pcmData[srcIndexCeil] / AUDIO_CONSTANTS.PCM_MAX_VALUE
                    : sample1;

            channelData[i] = Math.max(-1, Math.min(1, sample1 * (1 - t) + sample2 * t));
        }
    }

    return audioBuffer;
}

