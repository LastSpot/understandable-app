import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';
import { AUDIO_CONSTANTS } from '@/services/audio/audioConstants';
import { GeminiClient } from '@/services/gemini/geminiClient';

interface UseGeminiSessionReturn {
    isConnected: boolean;
    connect: (topic?: string) => Promise<void>;
    disconnect: () => void;
    sendAudio: (base64Audio: string) => void;
    setOnAudioReceived: (callback: (audioData: string) => void) => void;
}

export function useGeminiSession(
    onAudioReceived?: (audioData: string) => void
): UseGeminiSessionReturn {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<GeminiClient | null>(null);
    const onAudioReceivedRef = useRef(onAudioReceived);

    useEffect(() => {
        onAudioReceivedRef.current = onAudioReceived;
    }, [onAudioReceived]);

    const connect = useCallback(async (topic: string = '') => {
        // Disconnect existing client if any
        if (clientRef.current) {
            clientRef.current.disconnect();
            clientRef.current = null;
            setIsConnected(false);
        }

        const client = new GeminiClient();
        clientRef.current = client;

        await client.connect(
            {
                onOpen: () => {
                    setIsConnected(true);
                },
                onAudioReceived: (audioData) => {
                    onAudioReceivedRef.current?.(audioData);
                },
                onError: (error) => {
                    logger.error('Gemini session error:', error);
                    setIsConnected(false);
                    // Don't expose technical error details to user
                },
                onClose: () => {
                    setIsConnected(false);
                },
            },
            topic
        );
    }, []);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
            clientRef.current = null;
            setIsConnected(false);
        }
    }, []);

    const sendAudio = useCallback((base64Audio: string) => {
        if (clientRef.current) {
            clientRef.current.sendAudio(base64Audio, AUDIO_CONSTANTS.TARGET_SAMPLE_RATE);
        }
    }, []);

    const setOnAudioReceived = useCallback((callback: (audioData: string) => void) => {
        onAudioReceivedRef.current = callback;
    }, []);

    return {
        isConnected,
        connect,
        disconnect,
        sendAudio,
        setOnAudioReceived,
    };
}
