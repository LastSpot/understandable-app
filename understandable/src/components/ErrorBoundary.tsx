'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: unknown) {
        logger.error('ErrorBoundary caught an error:', { error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex min-h-screen flex-col items-center justify-center px-4">
                        <div className="text-center space-y-4 max-w-md">
                            <h1 className="text-2xl font-semibold">Something went wrong</h1>
                            <p className="text-muted-foreground">
                                We encountered an unexpected error. Please try refreshing the page.
                            </p>
                            <Button
                                onClick={() => {
                                    this.setState({ hasError: false });
                                    window.location.reload();
                                }}
                            >
                                Refresh Page
                            </Button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

