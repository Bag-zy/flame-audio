import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getToken } from 'next-auth/jwt';

export const maxDuration = 300; // 5 minutes max execution time

export async function POST(request: Request) {

  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const task = formData.get('task') as 'transcribe' | 'translate' | null;
    const language = formData.get('language') as string | null;
    const temperature = formData.get('temperature') as string | null;
    const diarize = formData.get('diarize') === 'true';
    const punctuation = formData.get('punctuation') !== 'false';
    const format_numbers = formData.get('format_numbers') !== 'false';
    const systemMessage = formData.get('system_message') as string | null;
    
    // Use gemini-2.5-flash for both transcription and translation
    const model = 'gemini-2.5-flash';

    // Validate required fields
    if (!file || !model || !task) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check file type - handle common audio formats explicitly
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const acceptedExts = ['wav', 'mp3', 'aiff', 'aac', 'ogg', 'flac'];
    
    // Accept by MIME type or file extension
    const isAcceptedMime = file.type.startsWith('audio/');
    const isAcceptedExt = fileExt && acceptedExts.includes(fileExt);
    
    if (!isAcceptedMime && !isAcceptedExt) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid file type. Please upload WAV, MP3, AIFF, AAC, OGG, FLAC.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check file size (max 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return new NextResponse(
        JSON.stringify({ error: 'File too large. Maximum size is 25MB.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Google Generative AI
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
      return new NextResponse(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Get file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type;
    
    // Get file extension
    let extension = mimeType.split('/')[1] || 'mp3';
    
    // If the MIME type is not recognized, try to get extension from filename
    if (extension === 'octet-stream' || extension === 'plain') {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (fileExt && ['wav', 'mp3', 'aiff', 'aac', 'ogg', 'flac'].includes(fileExt)) {
        extension = fileExt;
      }
    }
    
    // Determine the correct MIME type based on extension
    const extensionToMime = {
      'wav': 'audio/wav',
      'mp3': 'audio/mpeg',  // Note: mp3 is audio/mpeg, not audio/mp3
      'aiff': 'audio/aiff',
      'aac': 'audio/aac',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac'
    };
    
    // Use the correct MIME type or fallback to the original
    const correctMimeType = extensionToMime[extension as keyof typeof extensionToMime] || mimeType;
    
    console.log('Using MIME type:', correctMimeType);
    
    // Prepare the prompt based on task and options
    let prompt = '';
    
    // Use system message if provided
    if (systemMessage && systemMessage.trim() !== '') {
      prompt = systemMessage.trim();
    } else {
      // Default prompt if no system message
      if (task === 'translate') {
        prompt = 'Transcribe this audio to English text';
      } else {
        prompt = 'Transcribe this audio';
        if (language) {
          prompt += ` in ${language}`;
        }
      }
    }

    // Add formatting instructions
    if (punctuation) {
      prompt += ' with proper punctuation';
    }
    if (format_numbers) {
      prompt += ' and format numbers as words';
    }
    if (diarize) {
      prompt += '. Include speaker diarization with labels like \"Speaker 1:\"';
    }

    prompt += '. Output the transcription as a JSON object with the following structure: { \"text\": \"full transcription text\", \"segments\": [{ \"start\": 0.0, \"end\": 1.23, \"text\": \"segment text\", \"speaker\": \"Speaker 1\" }] }';

    // Call the Gemini API
    const generationConfig = {
      temperature: temperature ? parseFloat(temperature) : 0,
      topK: 32,
      topP: 1,
      maxOutputTokens: 4096,
    };

    // Use the standard API format
    const genModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Convert buffer to base64
    const base64Data = buffer.toString('base64');
    console.log('Using inline data approach...');
    
    console.log('Generating content with inline data...');
    const result = await genModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: correctMimeType, data: base64Data } }
          ]
        }
      ],
      generationConfig,
    });

    // Parse the response
    const response = result.response;
    const text = response.text();
    
    // Try to extract JSON from the response
    try {
      // Find the first { and last } to extract the JSON object
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonStr = text.substring(jsonStart, jsonEnd);
      const jsonResponse = JSON.parse(jsonStr);

      // Calculate duration (approximate if not provided)
      let duration = 0;
      if (jsonResponse.segments && jsonResponse.segments.length > 0) {
        const lastSegment = jsonResponse.segments[jsonResponse.segments.length - 1];
        duration = lastSegment.end || 0;
      }

      // Return the structured response
      return NextResponse.json({
        text: jsonResponse.text || '',
        language: language || 'en',
        duration,
        segments: jsonResponse.segments || [],
        model: model,
        processingTime: response.usageMetadata?.totalTokenCount || 0,
      });
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini response:', jsonError);
      
      // If JSON parsing fails, return the raw text
      return NextResponse.json({
        text,
        language: language || 'en',
        duration: 0,
        model: model,
      });
    }
  } catch (error) {
    console.error('Error in transcription API:', error);
    
    // Check for rate limit error (429)
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'API rate limit exceeded',
          details: 'You have exceeded the Google Generative AI API quota. Please try again later or upgrade your API plan.'
        }), 
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to process transcription',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}