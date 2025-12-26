import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionControlsProps {
    hasStarted: boolean;
    isMuted: boolean;
    onStart: () => void;
    onToggleMute: () => void;
    onEnd: () => void;
}

export function SessionControls({
    hasStarted,
    isMuted,
    onStart,
    onToggleMute,
    onEnd,
}: SessionControlsProps) {
    if (!hasStarted) {
        return (
            <Button onClick={onStart} size="lg" className="gap-2 rounded-full px-8">
                <Mic className="h-4 w-4" />
                Start talking
            </Button>
        );
    }

    return (
        <>
            <Button
                variant="outline"
                onClick={onToggleMute}
                size="lg"
                className="gap-2 rounded-full bg-transparent px-6"
            >
                {isMuted ? (
                    <>
                        <MicOff className="h-4 w-4" />
                        Unmute
                    </>
                ) : (
                    <>
                        <Mic className="h-4 w-4" />
                        Mute
                    </>
                )}
            </Button>
            <Button onClick={onEnd} size="lg" className="gap-2 rounded-full px-6">
                I made it understandable
            </Button>
        </>
    );
}

