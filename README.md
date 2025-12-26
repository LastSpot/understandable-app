# Understandable

A live voice AI conversation app that tests whether you truly understand a concept by having you explain it to a curious 5-year-old listener powered by Google Gemini Live API.

> "If you can't explain it to a 5-year-old, you don't understand it yourself." - Albert Einstein

## Features

### 🎤 Live Voice Conversation

-   Real-time bidirectional audio streaming with Google Gemini Live API
-   Natural conversation flow with voice activity detection (VAD)
-   Instant interruptions when technical terms or confusing explanations are detected
-   Quick response timing (300ms after user stops speaking)

### 🎨 Real-time Audio Visualization

-   Spotify-style waveform visualization with 50 animated frequency bars
-   Visual feedback for both microphone input and AI audio output
-   Smooth animations and responsive design

### ⏱️ Session Management

-   5-minute session timer with optional extension
-   Session status tracking (idle, requesting, listening, speaking, muted)
-   Mute/unmute functionality with visual status indicators

### 🛡️ Production-Ready Error Handling

-   Graceful error recovery with ErrorBoundary
-   User-friendly error messages (technical details hidden)
-   Comprehensive logging for debugging
-   Handles microphone permissions and network errors

## Tech Stack

-   **Framework**: Next.js 16 with React 19
-   **AI**: Google Gemini Live API (gemini-2.5-flash-native-audio-preview)
-   **Audio**: Web Audio API, AudioWorklet for PCM processing
-   **UI**: Tailwind CSS, Radix UI components
-   **Language**: TypeScript
-   **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

-   Node.js 20+ and npm/yarn/pnpm
-   Google Gemini API key
-   Microphone access

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd understandable-app
```

2. Navigate to the project directory:

```bash
cd understandable
```

3. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

4. Set up environment variables:
   Create a `.env.local` file in the `understandable` directory:

```env
GEMINI_KEY=your_gemini_api_key_here
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Enter a Topic**: Input any concept or topic you want to explain
2. **Start Talking**: Click "Start Talking" and begin explaining your topic
3. **AI Interrupts**: The AI (acting as a 5-year-old) will interrupt when it hears:
    - Technical terms or jargon it doesn't understand
    - Confusing or vague explanations
    - Complex words that need simplification
4. **Respond**: Answer the AI's questions using simple language
5. **Test Your Understanding**: If you can explain it simply enough for the AI to understand, you've mastered the concept!

## Project Structure

```
understandable/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx            # Main page with session management
│   │   └── layout.tsx           # Root layout
│   ├── components/             # React components
│   │   ├── SessionView.tsx     # Main session component
│   │   ├── StartView.tsx       # Topic input form
│   │   ├── Waveform.tsx        # Audio visualization
│   │   ├── TimeUpModal.tsx     # Timer expiration modal
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   ├── ErrorToast.tsx      # Error notifications
│   │   └── session/            # Session sub-components
│   │       ├── SessionHeader.tsx
│   │       ├── SessionContent.tsx
│   │       └── SessionControls.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAudioSession.ts  # Audio context & microphone
│   │   ├── useGeminiSession.ts # Gemini API connection
│   │   └── useTimer.ts         # Session timer logic
│   ├── services/               # Business logic
│   │   ├── audio/              # Audio processing
│   │   │   ├── audioProcessor.ts
│   │   │   ├── audioPlayer.ts
│   │   │   └── audioConstants.ts
│   │   └── gemini/             # Gemini integration
│   │       ├── geminiClient.ts
│   │       └── geminiConfig.ts
│   ├── types/                  # TypeScript types
│   │   ├── gemini.ts
│   │   └── session.ts
│   ├── lib/                    # Utilities
│   │   ├── constants.ts        # App constants
│   │   ├── logger.ts           # Logging utility
│   │   └── utils.ts            # Helper functions
│   └── actions/                # Server actions
│       └── gemini.ts           # Gemini token generation
```

## Key Features Explained

### Audio Processing

-   **PCM Worklet**: Captures raw audio data from microphone without blocking the main thread
-   **Resampling**: Converts device sample rate (44.1kHz/48kHz) to 16kHz required by Gemini API
-   **Audio Queue**: Prevents audio corruption by scheduling playback chunks sequentially
-   **Dual Analysers**: Separate analysers for microphone input and AI output visualization

### Gemini Configuration

-   **System Instruction**: Configured to act as an ignorant 5-year-old listener
-   **Interruption Mode**: `ALWAYS_INTERRUPT` enables natural conversation interruptions
-   **VAD Settings**: 300ms silence threshold and response delay for quick turn-taking
-   **Temperature**: Set to 0.3 for focused, consistent responses

### Error Handling

-   **ErrorBoundary**: Catches React component errors and displays fallback UI
-   **ErrorToast**: Shows user-friendly error messages without exposing technical details
-   **Internal Logging**: Technical errors logged for debugging while users see friendly messages

## Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run start` - Start production server
-   `npm run lint` - Run ESLint
-   `npm run format` - Format code with Prettier

## Configuration

### Audio Settings

-   Target sample rate: 16kHz (Gemini API requirement)
-   FFT size: 2048 (frequency analysis)
-   Smoothing: 0.2 (waveform visualization)

### Session Settings

-   Default duration: 5 minutes
-   VAD silence threshold: 300ms
-   VAD response delay: 300ms

### Gemini Settings

-   Model: `gemini-2.5-flash-native-audio-preview-12-2025`
-   Temperature: 0.3
-   Interruption mode: ALWAYS_INTERRUPT

## Browser Compatibility

-   Chrome/Edge (recommended): Full support for Web Audio API and AudioWorklet
-   Firefox: Full support
-   Safari: May have limitations with AudioWorklet

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Acknowledgments

-   Built with [Google Gemini Live API](https://ai.google.dev/gemini-api/docs/live-guide)
-   UI components from [shadcn/ui](https://ui.shadcn.com/)
-   Styled with [Tailwind CSS](https://tailwindcss.com/)
