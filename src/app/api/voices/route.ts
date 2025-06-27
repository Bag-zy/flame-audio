import { NextResponse } from 'next/server';
import { VOICE_OPTIONS, SUPPORTED_LANGUAGES } from '../text-to-speech/route';

export async function GET() {
  return NextResponse.json({
    voices: VOICE_OPTIONS,
    languages: SUPPORTED_LANGUAGES
  });
}