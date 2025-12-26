// Timer constants
export const TIMER_CONSTANTS = {
    SESSION_DURATION_MS: 5 * 60 * 1000,
} as const;

// Waveform visualization constants
export const WAVEFORM_CONSTANTS = {
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 150,
    NUM_BARS: 50,
    BAR_SPACING_RATIO: 0.6,
    MIN_BAR_HEIGHT: 3,
    IDLE_BAR_HEIGHT: 4,
    AMPLIFICATION_FACTOR: 1.8,
    SMOOTHING_FACTOR: 0.7,
} as const;

// Gemini API constants
export const GEMINI_CONSTANTS = {
    MODEL: 'gemini-2.5-flash-native-audio-preview-12-2025',
    API_VERSION: 'v1alpha',
} as const;
