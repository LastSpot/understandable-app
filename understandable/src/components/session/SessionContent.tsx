import { Waveform } from '@/components/Waveform';

interface SessionContentProps {
    analyser: AnalyserNode | null;
    isActive: boolean;
}

export function SessionContent({ analyser, isActive }: SessionContentProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center py-12">
            <Waveform analyser={analyser} isActive={isActive} />
            <p className="mt-8 max-w-sm text-center text-sm text-muted-foreground">
                Explain it in simple words. I&apos;ll interrupt if I don&apos;t understand.
            </p>
        </div>
    );
}

