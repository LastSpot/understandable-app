import { GoogleGenAI, LiveServerMessage, Session } from '@google/genai';

import { logger } from '@/lib/logger';
import { getGeminiLiveToken } from '@/actions/gemini';
import { GeminiMessage } from '@/types/gemini';

import { GEMINI_CONFIG, getGeminiConfig } from './geminiConfig';

export interface GeminiClientCallbacks {
    onOpen?: () => void;
    onAudioReceived?: (audioData: string) => void;
    onError?: (error: ErrorEvent) => void;
    onClose?: (event: CloseEvent) => void;
}

export class GeminiClient {
    private session: Session | null = null;
    private isConnected = false;

    async connect(callbacks: GeminiClientCallbacks, topic: string = ''): Promise<void> {
        return new Promise((resolve, reject) => {
            this.isConnected = false;

            getGeminiLiveToken(topic)
                .then(({ token }) => {
                    const ai = new GoogleGenAI({
                        apiKey: token,
                        apiVersion: GEMINI_CONFIG.apiVersion,
                    });

                    const geminiConfig = getGeminiConfig(topic);
                    const config = {
                        responseModalities: [...geminiConfig.responseModalities],
                        systemInstruction: geminiConfig.systemInstruction,
                        temperature: geminiConfig.temperature,
                        interruptionSettings: geminiConfig.interruptionSettings,
                        vadConfig: geminiConfig.vadConfig,
                        speechConfig: geminiConfig.speechConfig,
                    } as Parameters<typeof ai.live.connect>[0]['config'] & {
                        interruptionSettings: typeof geminiConfig.interruptionSettings;
                        vadConfig: typeof geminiConfig.vadConfig;
                        speechConfig: typeof geminiConfig.speechConfig;
                    };

                    logger.debug('Connecting to Gemini Live with config:', {
                        model: geminiConfig.model,
                        topic,
                        systemInstruction: geminiConfig.systemInstruction.substring(0, 100) + '...',
                        temperature: config.temperature,
                        interruptionSettings: config.interruptionSettings,
                        vadConfig: config.vadConfig,
                        responseDelay: config.vadConfig?.responseDelay,
                        silenceThreshold: config.vadConfig?.silenceDurationThreshold,
                    });

                    ai.live
                        .connect({
                            model: geminiConfig.model,
                            config,
                            callbacks: {
                                onopen: () => {
                                    logger.debug('Gemini Live: opened');
                                    this.isConnected = true;
                                    callbacks.onOpen?.();
                                    resolve();
                                },
                                onmessage: (message: LiveServerMessage) => {
                                    logger.debug('Gemini Live message received:', message);
                                    const audioData = this.parseAudioData(message);
                                    if (audioData) {
                                        logger.debug(
                                            'Audio data parsed successfully, length:',
                                            audioData.length
                                        );
                                        callbacks.onAudioReceived?.(audioData);
                                    } else {
                                        logger.debug('No audio data found in message');
                                    }
                                },
                                onerror: (e: ErrorEvent) => {
                                    logger.error('Gemini Live error:', e);
                                    callbacks.onError?.(e);
                                    reject(e);
                                },
                                onclose: (e: CloseEvent) => {
                                    this.isConnected = false;
                                    logger.debug('Gemini Live closed:', e?.reason ?? e);
                                    callbacks.onClose?.(e);
                                },
                            },
                        })
                        .then((session) => {
                            this.session = session;
                        })
                        .catch((error) => {
                            logger.error('Error connecting to Gemini:', error);
                            reject(error);
                        });
                })
                .catch((error) => {
                    logger.error('Error getting Gemini token:', error);
                    reject(error);
                });
        });
    }

    sendAudio(base64Audio: string, sampleRate: number): void {
        if (!this.isConnected || !this.session) {
            logger.warn('Cannot send audio: session not connected');
            return;
        }

        try {
            this.session.sendRealtimeInput({
                audio: {
                    data: base64Audio,
                    mimeType: `audio/pcm;rate=${sampleRate}`,
                },
            });
        } catch (error) {
            logger.error('Error sending audio to Gemini:', error);
            // Silently handle - audio sending errors shouldn't disrupt user experience
        }
    }

    disconnect(): void {
        if (this.session) {
            this.session.close();
            this.session = null;
            this.isConnected = false;
        }
    }

    getIsConnected(): boolean {
        return this.isConnected;
    }

    private parseAudioData(message: LiveServerMessage): string | undefined {
        const geminiMessage = message as unknown as GeminiMessage;

        // Structure 1: modelTurn.parts[].inlineData.data
        const parts = geminiMessage.serverContent?.modelTurn?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData?.data) {
                    return part.inlineData.data;
                }
            }
        }

        // Structure 2: Direct audio field
        const serverContent = geminiMessage.serverContent as
            | { audio?: { data?: string } }
            | undefined;
        if (serverContent?.audio?.data) {
            return serverContent.audio.data;
        }

        // Log full message if no audio found
        if (process.env.NODE_ENV === 'development') {
            logger.debug('Full message structure:', JSON.stringify(message, null, 2));
        }

        return undefined;
    }
}
