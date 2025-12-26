feat: implement live voice AI conversation with Gemini and refactor codebase

Implement a complete live voice AI conversation system using Google Gemini Live API
with real-time audio processing, waveform visualization, and comprehensive error handling.

## Core Features

### Live Voice AI Integration
- Integrate Google Gemini Live API for real-time voice conversations
- Implement bidirectional audio streaming (microphone input → Gemini, Gemini output → speakers)
- Configure Gemini to act as a curious 5-year-old listener for "explain like I'm 5" concept
- Enable ALWAYS_INTERRUPT mode for natural conversation flow
- Configure VAD (Voice Activity Detection) for quick response timing (300ms)

### Audio Processing
- Implement PCM audio worklet for real-time microphone capture
- Add audio resampling from device sample rate (44.1kHz/48kHz) to 16kHz for Gemini API
- Create audio playback queue system to prevent audio corruption
- Implement proper PCM decoding for Gemini's audio output (16-bit little-endian)
- Set up dual analyser nodes for microphone input and playback visualization

### Waveform Visualization
- Create Spotify-style waveform component with 50 animated frequency bars
- Implement real-time audio visualization using Web Audio API AnalyserNode
- Add smooth animations and responsive bar heights based on audio amplitude
- Optimize rendering with useMemo, useCallback, and pre-allocated arrays

### Session Management
- Implement 5-minute session timer with TimeUpModal
- Add timer reset functionality when user clicks "Try again"
- Create session status tracking (idle, requesting, listening, speaking, muted)
- Display mute status in session header

### Error Handling & UX
- Add ErrorBoundary component for graceful error recovery
- Implement ErrorToast for user-friendly error notifications
- Create production-ready error messages (hide technical details from users)
- Add internal logging system for debugging
- Handle microphone permission errors gracefully
- Handle network connection errors with clear messaging

## Codebase Refactoring

### Architecture Improvements
- Refactor monolithic SessionView into modular components:
  - SessionHeader: Topic and status display
  - SessionContent: Waveform and instructional text
  - SessionControls: Start, mute, and end buttons
- Extract custom hooks for separation of concerns:
  - useAudioSession: Microphone and audio context management
  - useGeminiSession: Gemini API connection and audio sending
  - useTimer: Countdown timer logic

### Service Layer Organization
- Create services/audio/ for audio processing:
  - audioProcessor.ts: PCM worklet code, resampling, conversion, decoding
  - audioPlayer.ts: Audio playback queueing and analyser management
  - audioConstants.ts: Centralized audio constants
- Create services/gemini/ for Gemini integration:
  - geminiClient.ts: Gemini API connection and message handling
  - geminiConfig.ts: System instructions and API configuration

### Type Safety
- Create types/gemini.ts for Gemini message interfaces
- Create types/session.ts for session status types
- Remove unused type definitions (audio.ts, SessionState)

### Constants & Utilities
- Centralize constants in lib/constants.ts (timer, waveform, Gemini model)
- Create lib/logger.ts for consistent logging across the app
- Maintain lib/utils.ts for Tailwind class merging

### Code Quality
- Remove all dead code (unused functions, variables, files)
- Follow DRY principles throughout codebase
- Improve code readability and maintainability
- Add minimal, purposeful comments
- Optimize React components with proper memoization

## Configuration

### Gemini System Instructions
- Configure AI to act as ignorant 5-year-old listener
- Set strict interruption rules for technical terms and confusion
- Prevent supportive or reaffirming responses
- Enforce simple language and short questions (under 8 words)
- Lower temperature to 0.3 for more focused responses

### Audio Configuration
- Target sample rate: 16kHz for Gemini API
- FFT size: 2048 for frequency analysis
- Smoothing time constant: 0.2 for waveform visualization
- VAD silence threshold: 300ms
- VAD response delay: 300ms

## Bug Fixes

- Fix rafIdRef undefined error in waveform rendering
- Fix Session.state property access error (use manual state tracking)
- Fix audio sample rate mismatch (implement resampling)
- Fix race condition in Gemini connection (await onopen callback)
- Fix corrupted audio playback (implement proper PCM decoding and queueing)
- Fix waveform not reacting to audio (connect analysers to audio context)
- Fix mute status not displaying (update SessionHeader logic)
- Fix duplicate draw function causing analyser scope error

## Technical Details

- Use Next.js 16 with React 19
- Implement Web Audio API for real-time audio processing
- Use AudioWorklet for non-blocking PCM audio capture
- Base64 encode/decode for Gemini API audio format
- Implement linear interpolation for audio resampling
- Use requestAnimationFrame for smooth waveform updates

