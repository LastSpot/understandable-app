'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { WAVEFORM_CONSTANTS } from '@/lib/constants';
import { logger } from '@/lib/logger';

interface WaveformProps {
    analyser: AnalyserNode | null;
    isActive: boolean;
}

export function Waveform({ analyser, isActive }: WaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const barHeightsRef = useRef<number[]>([]);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Memoize canvas dimensions
    const dimensions = useMemo(
        () => ({
            width: WAVEFORM_CONSTANTS.CANVAS_WIDTH,
            height: WAVEFORM_CONSTANTS.CANVAS_HEIGHT,
            centerY: WAVEFORM_CONSTANTS.CANVAS_HEIGHT / 2,
            numBars: WAVEFORM_CONSTANTS.NUM_BARS,
            barSpacing: WAVEFORM_CONSTANTS.CANVAS_WIDTH / WAVEFORM_CONSTANTS.NUM_BARS,
            barWidth:
                (WAVEFORM_CONSTANTS.CANVAS_WIDTH / WAVEFORM_CONSTANTS.NUM_BARS) *
                WAVEFORM_CONSTANTS.BAR_SPACING_RATIO,
            maxBarHeight: WAVEFORM_CONSTANTS.CANVAS_HEIGHT - 10,
        }),
        []
    );

    // Initialize canvas once
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
            logger.error('Could not get 2D context from canvas');
            return;
        }

        ctxRef.current = ctx;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        canvas.style.width = `${dimensions.width}px`;
        canvas.style.height = `${dimensions.height}px`;
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
    }, [dimensions]);

    // Optimized bar height calculation
    const calculateBarHeights = useCallback(
        (dataArray: Uint8Array, bufferLength: number): number[] => {
            const barsPerFrequencyBin = Math.floor(bufferLength / dimensions.numBars);
            const newBarHeights: number[] = new Array(dimensions.numBars);

            for (let i = 0; i < dimensions.numBars; i++) {
                let sum = 0;
                const start = i * barsPerFrequencyBin;
                const end = Math.min(start + barsPerFrequencyBin, bufferLength);

                for (let j = start; j < end; j++) {
                    sum += dataArray[j];
                }

                const avg = sum / (end - start);
                const normalized = avg / 255;
                const amplified =
                    Math.pow(normalized, 0.5) * WAVEFORM_CONSTANTS.AMPLIFICATION_FACTOR;
                newBarHeights[i] = Math.min(
                    amplified * dimensions.maxBarHeight,
                    dimensions.maxBarHeight
                );
            }

            return newBarHeights;
        },
        [dimensions]
    );

    // Smooth bar heights
    const smoothBarHeights = useCallback(
        (newBarHeights: number[]): void => {
            if (barHeightsRef.current.length === 0) {
                barHeightsRef.current = newBarHeights;
            } else {
                for (let i = 0; i < dimensions.numBars; i++) {
                    barHeightsRef.current[i] =
                        barHeightsRef.current[i] * WAVEFORM_CONSTANTS.SMOOTHING_FACTOR +
                        newBarHeights[i] * (1 - WAVEFORM_CONSTANTS.SMOOTHING_FACTOR);
                }
            }
        },
        [dimensions.numBars]
    );

    // Draw idle state
    const drawIdle = useCallback(
        (ctx: CanvasRenderingContext2D): void => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';

            for (let i = 0; i < dimensions.numBars; i++) {
                const x = i * dimensions.barSpacing + dimensions.barSpacing / 2;
                ctx.fillRect(
                    x - dimensions.barWidth / 2,
                    dimensions.centerY - WAVEFORM_CONSTANTS.IDLE_BAR_HEIGHT / 2,
                    dimensions.barWidth,
                    WAVEFORM_CONSTANTS.IDLE_BAR_HEIGHT
                );
            }
        },
        [dimensions]
    );

    // Draw active waveform
    const drawActive = useCallback(
        (ctx: CanvasRenderingContext2D): void => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);
            ctx.fillStyle = '#000000';

            for (let i = 0; i < dimensions.numBars; i++) {
                const barHeight = Math.max(
                    barHeightsRef.current[i] || 0,
                    WAVEFORM_CONSTANTS.MIN_BAR_HEIGHT
                );
                const x = i * dimensions.barSpacing + dimensions.barSpacing / 2;
                ctx.fillRect(
                    x - dimensions.barWidth / 2,
                    dimensions.centerY - barHeight / 2,
                    dimensions.barWidth,
                    barHeight
                );
            }
        },
        [dimensions]
    );

    useEffect(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        const draw = () => {
            if (!analyser || !isActive) {
                drawIdle(ctx);
                rafRef.current = requestAnimationFrame(draw);
                return;
            }

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            try {
                analyser.getByteFrequencyData(dataArray);
            } catch (error) {
                logger.error('Error getting frequency data:', error);
                drawIdle(ctx);
                rafRef.current = requestAnimationFrame(draw);
                return;
            }

            const newBarHeights = calculateBarHeights(dataArray, bufferLength);
            smoothBarHeights(newBarHeights);
            drawActive(ctx);

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            barHeightsRef.current = [];
        };
    }, [analyser, isActive, calculateBarHeights, smoothBarHeights, drawIdle, drawActive]);

    return (
        <div className="flex items-center justify-center">
            <canvas
                ref={canvasRef}
                className="rounded-xl"
                style={{
                    background: 'transparent',
                }}
            />
        </div>
    );
}
