export const logger = {
    debug: (message: string, data?: unknown) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(message, data);
        }
    },
    error: (message: string, error?: unknown) => {
        console.error(message, error);
    },
    warn: (message: string, data?: unknown) => {
        if (process.env.NODE_ENV === 'development') {
            console.warn(message, data);
        }
    },
};

