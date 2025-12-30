'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';
import { useAudioSession } from '@/hooks/useAudioSession';
import { useGeminiSession } from '@/hooks/useGeminiSession';
import { useTimer } from '@/hooks/useTimer';
import { SessionStatus } from '@/types/session';

import { ErrorToast } from './ErrorToast';
import { SessionContent } from './session/SessionContent';
import { SessionControls } from './session/SessionControls';
import { SessionHeader } from './session/SessionHeader';

interface SessionViewProps {
    topic: string;
    onEnd: () => void;
    onTimeUp: () => void;
    isTimeUp: boolean;
}

export function SessionView({ topic, onEnd, onTimeUp, isTimeUp }: SessionViewProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const [status, setStatus] = useState<SessionStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const audioSession = useAudioSession();
    const geminiSession = useGeminiSession();

    const audioSessionRef = useRef(audioSession);
    const geminiSessionRef = useRef(geminiSession);

    useEffect(() => {
        audioSessionRef.current = audioSession;
    }, [audioSession]);

    useEffect(() => {
        geminiSessionRef.current = geminiSession;
    }, [geminiSession]);

    useEffect(() => {
        const handleAudioReceived = (base64Audio: string) => {
            // Don't send audio when timer is up (modal is shown)
            if (!isTimeUp && geminiSessionRef.current.isConnected) {
                geminiSessionRef.current.sendAudio(base64Audio);
            }
        };
        audioSessionRef.current.setOnAudioReceived(handleAudioReceived);
    }, [isTimeUp]);

    useEffect(() => {
        const handleGeminiAudioReceived = (audioData: string) => {
            const audioPlayer = audioSessionRef.current.getAudioPlayer();
            if (audioSessionRef.current.audioContext && audioPlayer) {
                setStatus('speaking');
                audioPlayer.playChunk(
                    audioData,
                    () => setStatus('speaking'),
                    () => {
                        setStatus('listening');
                        audioSessionRef.current.setActiveAnalyser(
                            audioSessionRef.current.micAnalyser
                        );
                    }
                );
            }
        };

        geminiSessionRef.current.setOnAudioReceived(handleGeminiAudioReceived);
    }, []);

    useEffect(() => {
        if (audioSession.playbackAnalyser) {
            audioSession.setActiveAnalyser(audioSession.playbackAnalyser);
        } else if (audioSession.micAnalyser) {
            audioSession.setActiveAnalyser(audioSession.micAnalyser);
        }
    }, [audioSession.playbackAnalyser, audioSession.micAnalyser, audioSession]);

    useTimer(hasStarted && !isTimeUp, onTimeUp);

    // Reconnect websocket when timer resets (user clicks "Try again")
    useEffect(() => {
        if (!isTimeUp && hasStarted && !geminiSession.isConnected) {
            logger.debug('Reconnecting websocket after timer reset');
            geminiSession.connect(topic).catch((error) => {
                logger.error('Error reconnecting websocket:', error);
                setErrorMessage('Connection lost. Please try starting again.');
                setHasStarted(false);
                setStatus('idle');
            });
        }
    }, [isTimeUp, hasStarted, geminiSession, topic]);

    const handleStartTalking = useCallback(async () => {
        try {
            setStatus('requesting');
            setErrorMessage(null);
            await audioSession.startRecording();
            await geminiSession.connect(topic);
            setHasStarted(true);
            setStatus('listening');
        } catch (error) {
            logger.error('Error starting session:', error);
            setStatus('idle');
            setHasStarted(false);

            // User-friendly error messages
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
                    setErrorMessage(
                        'Microphone access is required. Please allow microphone access and try again.'
                    );
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    setErrorMessage(
                        'Connection error. Please check your internet connection and try again.'
                    );
                } else {
                    setErrorMessage('Unable to start session. Please try again.');
                }
            } else {
                setErrorMessage('Unable to start session. Please try again.');
            }
        }
    }, [audioSession, geminiSession, topic]);

    const handleEndSession = useCallback(async () => {
        try {
            setErrorMessage(null);
            await audioSession.stopRecording();
            geminiSession.disconnect();
            setHasStarted(false);
            setStatus('idle');
            onEnd();
        } catch (error) {
            logger.error('Error ending session:', error);
            // Still end the session even if cleanup fails
            setHasStarted(false);
            setStatus('idle');
            onEnd();
        }
    }, [audioSession, geminiSession, onEnd]);

    const handleToggleMute = useCallback(() => {
        if (audioSession.isMuted) {
            audioSession.unmute();
            setStatus('listening');
        } else {
            audioSession.mute();
            setStatus('muted');
        }
    }, [audioSession]);

    return (
        <>
            <div className="flex min-h-screen flex-col bg-background px-4 py-8">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
                    <SessionHeader
                        topic={topic}
                        status={status}
                        hasStarted={hasStarted}
                        isMuted={audioSession.isMuted}
                    />
                    <SessionContent analyser={audioSession.activeAnalyser} isActive={hasStarted} />
                    <div className="flex flex-col items-center gap-3 pb-8 sm:flex-row sm:justify-center">
                        <SessionControls
                            hasStarted={hasStarted}
                            isMuted={audioSession.isMuted}
                            onStart={handleStartTalking}
                            onToggleMute={handleToggleMute}
                            onEnd={handleEndSession}
                        />
                    </div>
                </div>
            </div>
            {errorMessage && (
                <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
            )}
        </>
    );
}
