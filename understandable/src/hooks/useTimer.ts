import { useEffect, useRef } from 'react';
import { TIMER_CONSTANTS } from '@/lib/constants';

export function useTimer(
    isActive: boolean,
    onExpire: () => void,
    duration: number = TIMER_CONSTANTS.SESSION_DURATION_MS
) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                onExpire();
            }, duration);

            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
            };
        } else {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isActive, onExpire, duration]);

    const reset = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (isActive) {
            timerRef.current = setTimeout(() => {
                onExpire();
            }, duration);
        }
    };

    const clear = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return { reset, clear };
}

