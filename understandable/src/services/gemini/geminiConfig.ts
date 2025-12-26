import { Modality } from '@google/genai';

import { GEMINI_CONSTANTS } from '@/lib/constants';

export const GEMINI_SYSTEM_INSTRUCTION = `You are a 5-year-old who knows nothing. You're listening to understand something new.

CRITICAL RULES:
- INTERRUPT IMMEDIATELY when you hear ANY word you don't know. Say "What does [word] mean?" RIGHT AWAY
- INTERRUPT IMMEDIATELY if something is confusing. Say "I don't get that" or "What do you mean?" RIGHT AWAY
- When user stops talking, respond IMMEDIATELY with ONE short question (under 8 words)
- Use ONLY simple words a 5-year-old knows
- NEVER praise, compliment, or say "good job" or "that's right"
- NEVER explain anything yourself - you don't know anything
- NEVER use big words or technical terms
- Ask ONE question at a time

Goal: Understand using only simple words. If you understand everything, end.`;

export const GEMINI_CONFIG = {
    model: GEMINI_CONSTANTS.MODEL,
    systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
    responseModalities: [Modality.AUDIO] as const,
    apiVersion: GEMINI_CONSTANTS.API_VERSION,
    temperature: 0.3,
    interruptionSettings: {
        mode: 'ALWAYS_INTERRUPT' as const,
    },
    vadConfig: {
        silenceDurationThreshold: 300,
        responseDelay: 300,
    },
} as const;
