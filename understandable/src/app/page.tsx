'use client';

import { useState } from 'react';

import StartView from '@/components/start-view';

export default function Home() {
    const [topic, setTopic] = useState<string | null>(null);
    const [isStarted, setIsStarted] = useState(false);

    const handleStart = (selectedTopic: string) => {
        setTopic(selectedTopic);
        setIsStarted(true);
    };

    return (
        <main>
            {!isStarted ? (
                <StartView onStart={handleStart} />
            ) : (
                <div>
                    <h1>Topic: {topic}</h1>
                </div>
            )}
        </main>
    );
}
