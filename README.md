# Flame Audio AI

Transform audio with AI-powered speech technology. Convert speech to text and text to speech with industry-leading accuracy.

## Features

- **Speech-to-Text**: Transcribe audio files with High  accuracy
- **Text-to-Speech**: Generate natural-sounding audio from text
- **Multi-language Support**: Support for 50+ languages
- **Real-time Processing**: Fast audio processing and transcription
- **Speaker Diarization**: Identify different speakers in audio
- **Multiple Audio Formats**: Support for MP3, WAV, M4A, and more
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with credentials provider
- **AI Services**: Google Generative AI
- **UI Components**: Radix UI, Lucide React Icons
- **Styling**: Tailwind CSS with dark mode support

## Installation

### Prerequisites

- Node.js 20 or higher
- MongoDB (local or MongoDB Atlas)
- Git

### Clone the Repository

```bash
git clone https://github.com/Bag-zy/flame-audio.git
cd flame-audio
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory and add the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/flame-audio
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flame-audio

# Application Settings
NEXT_PUBLIC_APP_NAME=Flame Audio AI
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXT_PUBLIC_AUTH_ENABLED=true
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECURE_COOKIE=false
NEXTAUTH_DEBUG=true
NEXTAUTH_TRUST_HOST=true

# Session settings
NEXTAUTH_SESSION_MAX_AGE=2592000
NEXTAUTH_SESSION_UPDATE_AGE=86400

# Google Generative AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key
NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_URL=https://generativelanguage.googleapis.com/v1beta
```

### Generate Authentication Secret

Generate a secure secret for NextAuth.js:

```bash
npx auth secret
```

Copy the generated secret to your `.env.local` file as `NEXTAUTH_SECRET`.

### Database Setup

1. **Local MongoDB**: Make sure MongoDB is running on your system
2. **MongoDB Atlas**: Create a cluster and get your connection string

### Google AI API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the API key to your `.env.local` file

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Landing Page
- Visit the homepage to learn about Flame Audio AI features
- Navigate to the playground to start using the application

### Authentication
- Click "Get Started" or go to `/playground` to access the main application
- Register a new account or login with existing credentials
- Authentication is required to access the playground features

### Speech-to-Text
1. Go to the Playground
2. Upload an audio file or record directly
3. Select language and transcription settings
4. Click "Transcribe" to convert speech to text
5. View results with timestamps and speaker identification

### Text-to-Speech
1. In the Playground, switch to the TTS tab
2. Enter text you want to convert to speech
3. Select voice and language options
4. Click "Generate Speech" to create audio
5. Download or play the generated audio

## Project Structure

```
flame-audio/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── playground/        # Main application pages
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── layout/           # Layout components
│   │   ├── sections/         # Landing page sections
│   │   └── ui/               # UI components
│   ├── lib/                  # Utility libraries
│   ├── models/               # Database models
│   └── utils/                # Helper functions
├── public/                   # Static assets
├── .env.local               # Environment variables
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies
```

## API Endpoints

- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signup` - User registration
- `POST /api/transcribe-audio` - Audio transcription
- `POST /api/text-to-speech` - Text-to-speech conversion
- `GET /api/voices` - Available TTS voices
- `GET /api/tts-status/:id` - Check TTS job status

## Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Contact

- **Email**: Flameheadlabs256@gmail.com
- **LinkedIn**: [Flamehead Labs](https://www.linkedin.com/in/flamehead-labs-919910285)
- **Twitter**: [@flameheadlabsug](https://x.com/flameheadlabsug)
- **GitHub**: [Flamehead-Labs-Ug](https://github.com/Flamehead-Labs-Ug/flame-audio)

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Google AI](https://ai.google.dev/) - AI services
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components

---

Built with ❤️ by [Flamehead Labs](https://github.com/Flamehead-Labs-Ug)