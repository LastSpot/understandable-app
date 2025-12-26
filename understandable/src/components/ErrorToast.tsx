'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorToastProps {
    message: string;
    onDismiss: () => void;
    duration?: number;
}

export function ErrorToast({ message, onDismiss, duration = 5000 }: ErrorToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">{message}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive hover:bg-destructive/20"
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onDismiss, 300);
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

