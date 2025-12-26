'use client';

import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SessionView } from '@/components/SessionView';
import { StartView } from '@/components/StartView';
import { TimeUpModal } from '@/components/TimeUpModal';

export default function Home() {
    const [topic, setTopic] = useState<string>('');
    const [isStarted, setIsStarted] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);

    const handleStart = (selectedTopic: string) => {
        setTopic(selectedTopic);
        setIsStarted(true);
    };

    const handleEnd = () => {
        setIsStarted(false);
        setTopic('');
    };

    const handleTimeUp = () => {
        setIsTimeUp(true);
    };

    const handleComplete = () => {
        setIsTimeUp(false);
        setIsStarted(false);
        setTopic('');
    };

    const handleKeepGoing = () => {
        setIsTimeUp(false);
    };

    return (
        <ErrorBoundary>
            <main>
                {!isStarted ? (
                    <StartView onStart={handleStart} />
                ) : (
                    <SessionView
                        topic={topic}
                        onEnd={handleEnd}
                        onTimeUp={handleTimeUp}
                        isTimeUp={isTimeUp}
                    />
                )}
                <TimeUpModal
                    open={isTimeUp}
                    onComplete={handleComplete}
                    onKeepGoing={handleKeepGoing}
                />
            </main>
        </ErrorBoundary>
    );
}
