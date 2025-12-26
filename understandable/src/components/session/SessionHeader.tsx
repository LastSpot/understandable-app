import { Badge } from '@/components/ui/badge';
import { SessionStatus } from '@/types/session';

interface SessionHeaderProps {
    topic: string;
    status: SessionStatus;
    hasStarted: boolean;
    isMuted: boolean;
}

export function SessionHeader({ topic, status, hasStarted, isMuted }: SessionHeaderProps) {
    const displayStatus = hasStarted ? (isMuted ? 'muted' : status) : '';

    return (
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold text-foreground">Explain: {topic}</h1>
                <Badge variant="secondary" className="text-xs">
                    Explain like I&apos;m 5
                </Badge>
            </div>
            <span className="text-sm text-muted-foreground">{displayStatus}</span>
        </div>
    );
}
