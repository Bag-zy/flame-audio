import { NextResponse } from 'next/server';
import https from 'https';

// Define supported voices
export const VOICE_OPTIONS = [
  { id: 'Zephyr', description: 'Bright' },
  { id: 'Puck', description: 'Upbeat' },
  { id: 'Charon', description: 'Informative' },
  { id: 'Kore', description: 'Firm' },
  { id: 'Fenrir', description: 'Excitable' },
  { id: 'Leda', description: 'Youthful' },
  { id: 'Orus', description: 'Firm' },
  { id: 'Aoede', description: 'Breezy' },
  { id: 'Callirrhoe', description: 'Easy-going' },
  { id: 'Autonoe', description: 'Bright' },
  { id: 'Enceladus', description: 'Breathy' },
  { id: 'Iapetus', description: 'Clear' },
  { id: 'Umbriel', description: 'Easy-going' },
  { id: 'Algieba', description: 'Smooth' },
  { id: 'Despina', description: 'Smooth' },
  { id: 'Erinome', description: 'Clear' },
  { id: 'Algenib', description: 'Gravelly' },
  { id: 'Rasalgethi', description: 'Informative' },
  { id: 'Laomedeia', description: 'Upbeat' },
  { id: 'Achernar', description: 'Soft' },
  { id: 'Alnilam', description: 'Firm' },
  { id: 'Schedar', description: 'Even' },
  { id: 'Gacrux', description: 'Mature' },
  { id: 'Pulcherrima', description: 'Forward' },
  { id: 'Achird', description: 'Friendly' },
  { id: 'Zubenelgenubi', description: 'Casual' },
  { id: 'Vindemiatrix', description: 'Gentle' },
  { id: 'Sadachbia', description: 'Lively' },
  { id: 'Sadaltager', description: 'Knowledgeable' },
  { id: 'Sulafat', description: 'Warm' }
];

// Define supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'ar-EG', name: 'Arabic (Egyptian)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-US', name: 'Spanish (US)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'id-ID', name: 'Indonesian (Indonesia)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'ko-KR', name: 'Korean (Korea)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian (Russia)' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)' },
  { code: 'pl-PL', name: 'Polish (Poland)' },
  { code: 'th-TH', name: 'Thai (Thailand)' },
  { code: 'tr-TR', name: 'Turkish (Turkey)' },
  { code: 'vi-VN', name: 'Vietnamese (Vietnam)' },
  { code: 'ro-RO', name: 'Romanian (Romania)' },
  { code: 'uk-UA', name: 'Ukrainian (Ukraine)' },
  { code: 'bn-BD', name: 'Bengali (Bangladesh)' },
  { code: 'en-IN', name: 'English (India)' },
  { code: 'mr-IN', name: 'Marathi (India)' },
  { code: 'ta-IN', name: 'Tamil (India)' },
  { code: 'te-IN', name: 'Telugu (India)' }
];

// Direct API call to Google TTS
async function callGoogleTTS(apiKey: string, text: string, voiceName: string, isMultiSpeaker: boolean, speakerVoiceConfigs?: any[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let requestData;
    
    if (isMultiSpeaker && speakerVoiceConfigs && speakerVoiceConfigs.length > 0) {
      requestData = JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs
            }
          }
        }
      });
    } else {
      requestData = JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });
    }
    
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (audioData) {
              resolve(audioData);
            } else {
              reject(new Error('No audio data in response'));
            }
          } catch (error: any) {
            reject(new Error(`Error parsing response: ${error.message}`));
          }
        } else {
          reject(new Error(`API error: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });
    
    req.write(requestData);
    req.end();
  });
}

export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const text = formData.get('text') as string | null;
    const voiceName = formData.get('voice') as string | null;
    const isMultiSpeaker = formData.get('isMultiSpeaker') === 'true';
    const styleInstructions = formData.get('style_instructions') as string | null;
    const speakersData = formData.get('speakers') as string | null;
    
    // Validate required fields
    if (!text) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required text' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
      return new NextResponse(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the prompt based on style instructions and text
    let prompt = '';
    const styleInstr = styleInstructions && styleInstructions.trim() !== '' ? styleInstructions.trim() : '';
    
    if (styleInstr) {
      prompt = `${styleInstr}\n${text}`;
    } else {
      prompt = text;
    }

    console.log('Generating speech with prompt:', prompt.substring(0, 50) + '...');
    
    // Parse speakers for multi-speaker mode
    let speakerVoiceConfigs: any[] = [];
    
    if (isMultiSpeaker && speakersData) {
      try {
        const speakers = JSON.parse(speakersData);
        speakerVoiceConfigs = speakers.map((speaker: any) => ({
          speaker: speaker.name,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: speaker.voice }
          }
        }));
      } catch (error) {
        console.error('Error parsing speakers data:', error);
        speakerVoiceConfigs = [
          {
            speaker: 'Speaker1',
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' }
            }
          }
        ];
      }
    }
    
    try {
      // Call Google TTS API directly
      const audioData = await callGoogleTTS(
        apiKey, 
        prompt, 
        voiceName || 'Kore', 
        isMultiSpeaker, 
        isMultiSpeaker ? speakerVoiceConfigs : undefined
      );
      
      // Return the audio data
      return new NextResponse(
        JSON.stringify({ 
          audioData,
          format: 'audio/wav',  // Use proper MIME type
          model: 'gemini-2.5-flash-preview-tts',
          voice: voiceName || 'Kore',
          isMultiSpeaker,
          text
        }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (apiError: any) {
      console.error('API error:', apiError.message);
      
      // Check for specific error types
      if (apiError.message.includes('not found') || apiError.message.includes('does not exist')) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Model not available',
            details: 'The TTS model is not available or not enabled for your API key.'
          }), 
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (apiError.message.includes('quota') || apiError.message.includes('rate limit')) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'API rate limit exceeded',
            details: 'You have exceeded the Google Generative AI API quota. Please try again later.'
          }), 
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to generate speech',
          details: apiError.message
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error in text-to-speech API:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate speech',
        details: error.message || 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET endpoint to retrieve voice options and supported languages
export async function GET() {
  return NextResponse.json({
    voices: VOICE_OPTIONS,
    languages: SUPPORTED_LANGUAGES
  });
}