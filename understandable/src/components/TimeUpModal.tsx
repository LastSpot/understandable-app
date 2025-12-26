'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface TimeUpModalProps {
    open: boolean;
    onComplete: () => void;
    onKeepGoing: () => void;
}

export function TimeUpModal({ open, onComplete, onKeepGoing }: TimeUpModalProps) {
    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>That was helpful.</DialogTitle>
                    <DialogDescription>
                        If you&apos;re satisfied with how you explained it, you can wrap this one
                        up.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onKeepGoing}
                        className="w-full bg-transparent sm:w-auto"
                    >
                        Try again
                    </Button>
                    <Button onClick={onComplete} className="w-full sm:w-auto">
                        I made it understandable
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
