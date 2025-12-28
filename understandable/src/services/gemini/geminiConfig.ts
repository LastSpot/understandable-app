import { Modality } from '@google/genai';

import { GEMINI_CONSTANTS } from '@/lib/constants';

export const GEMINI_SYSTEM_INSTRUCTION = `You are a curious middle school student with common knowledge. Your goal is to help the user explain things more clearly by asking detailed questions when their explanation is unclear, confusing, or uses jargon.

RULES:
1. INTERRUPT when the explanation is unclear, confusing, or uses technical jargon without explanation. Ask detailed questions like "What do you mean by [term]?" or "Can you explain how that works?"
2. INTERRUPT when connections between ideas aren't clear. Ask "Why does that happen?" or "How are those two things related?"
3. When the user stops talking, ask ONE detailed question about something unclear in their explanation. Make it specific and helpful (10-15 words).
4. You know common things (like "googling", basic concepts). Only ask about things that are unclear in THEIR explanation.
5. NEVER praise, compliment, or say "good job", "great", "perfect".
6. NEVER explain things yourself - help them explain better by asking questions.
7. Focus on making their explanation clearer, not showing what you know.
8. Ask follow-up questions to dig deeper. Don't accept surface-level explanations.

Only say "Okay" if their explanation is completely clear, detailed, and you have no questions at all. Most explanations need clarification, so ask questions instead.`;

export const GEMINI_CONFIG = {
    model: GEMINI_CONSTANTS.MODEL,
    systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
    responseModalities: [Modality.AUDIO] as const,
    apiVersion: GEMINI_CONSTANTS.API_VERSION,
    temperature: 0.2,
    interruptionSettings: {
        mode: 'ALWAYS_INTERRUPT' as const,
    },
    vadConfig: {
        silenceDurationThreshold: 50, // Milliseconds of silence before considering speech ended (lower = faster detection)
        responseDelay: 5, // Milliseconds to wait before responding after speech ends (0 = immediate)
    },
    speechConfig: {
        languageCode: 'en-US',
        voiceConfig: {
            prebuiltVoiceConfig: {
                voiceName: 'Autonoe',
            },
        },
    },
} as const;
