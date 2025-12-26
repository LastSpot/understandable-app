export interface GeminiMessage {
    serverContent?: {
        modelTurn?: {
            parts?: Array<{
                inlineData?: {
                    data?: string;
                };
            }>;
        };
        audio?: {
            data?: string;
        };
    };
}
