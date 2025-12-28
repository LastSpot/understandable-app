'use server';

import { GoogleGenAI, Modality } from '@google/genai';

import { GEMINI_SYSTEM_INSTRUCTION } from '@/services/gemini/geminiConfig';

export async function getGeminiLiveToken() {
    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
        throw new Error('Missing API key');
    }

    const expireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    const client = new GoogleGenAI({ apiKey });

    const token = await client.authTokens.create({
        config: {
            uses: 1, // The default
            expireTime: expireTime,
            liveConnectConstraints: {
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    sessionResumption: {},
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
                    // Temporarily removing speechConfig to test if it's causing issues
                    // speechConfig: GEMINI_CONFIG.speechConfig,
                },
            },
            httpOptions: {
                apiVersion: 'v1alpha',
            },
        },
    });

    return {
        token: token.name,
    };
}
