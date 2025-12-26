'use client';

import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const exampleTopics = [
    'What is a human?',
    'Explain my job',
    'What is a mitochondria?',
    'What is money?',
    'Inflation',
];

const formSchema = z.object({
    topic: z.string().min(1, {
        message: 'Topic is required',
    }),
});

interface StartViewProps {
    onStart: (topic: string) => void;
}

export function StartView({ onStart }: StartViewProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            topic: '',
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onStart(values.topic);
    };

    const onExampleTopicClick = (topic: string) => {
        form.setValue('topic', topic);
        form.handleSubmit(onSubmit)();
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <div className="w-full max-w-[640px] space-y-4">
                {/* Logo */}
                <Image
                    src="/understandable-logo.png"
                    alt="Understandable"
                    width={450}
                    height={450}
                    className="mx-auto m-0"
                />

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Headline */}
                    <h2 className="text-center text-3xl font-medium tracking-tight text-foreground text-balance">
                        What would you like to practice understanding today?
                    </h2>

                    {/* Search Input */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="topic"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 rounded-full border border-input bg-background p-1.5 pl-4 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className="flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                                />
                                            </FormControl>
                                            <Button
                                                type="submit"
                                                disabled={!field.value?.trim()}
                                                className="rounded-full px-5 py-2 text-sm font-medium"
                                            >
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Make it understandable
                                            </Button>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>

                    {/* Description */}
                    <p className="text-center text-sm text-muted-foreground">
                        Explain it in simple language. The listener will interrupt when something
                        isn&apos;t clear — &quot;What does that mean?&quot;, &quot;I don&apos;t get
                        it&quot;, &quot;What is …?&quot;
                        <br />
                        <span className="mt-1 inline-block">
                            Think of it as the &quot;explain to a 5-year-old&quot; rule.
                        </span>
                    </p>

                    {/* Example Chips */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {exampleTopics.map((topic) => (
                            <Button
                                key={topic}
                                onClick={() => onExampleTopicClick(topic)}
                                variant="outline"
                                size="sm"
                            >
                                {topic}
                            </Button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
