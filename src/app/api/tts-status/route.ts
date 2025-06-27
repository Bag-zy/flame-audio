import { NextResponse } from 'next/server';
import https from 'https';

// Simple function to check if the TTS API is available
async function checkTTSAvailability(apiKey: string): Promise<{ available: boolean; message: string }> {
  return new Promise((resolve) => {
    // Simple test request
    const requestData = JSON.stringify({
      contents: [{ parts: [{ text: 'Test' }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });
    
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
              resolve({ available: true, message: 'TTS API is available and working correctly' });
            } else {
              resolve({ available: false, message: 'TTS API response did not contain audio data' });
            }
          } catch (error: any) {
            resolve({ available: false, message: `Error parsing response: ${error.message}` });
          }
        } else {
          resolve({ 
            available: false, 
            message: `API error: ${res.statusCode} - ${data.substring(0, 200)}` 
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ available: false, message: `Request error: ${error.message}` });
    });
    
    // Set a timeout
    const timeout = setTimeout(() => {
      req.destroy();
      resolve({ available: false, message: 'Request timed out' });
    }, 10000);
    
    req.on('close', () => {
      clearTimeout(timeout);
    });
    
    req.write(requestData);
    req.end();
  });
}

export async function GET() {
  try {
    // Get API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        status: 'error',
        message: 'API key is not configured',
        available: false
      }, { status: 500 });
    }
    
    // Check TTS availability
    const result = await checkTTSAvailability(apiKey);
    
    return NextResponse.json({
      status: result.available ? 'ok' : 'error',
      message: result.message,
      available: result.available
    }, { status: result.available ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      available: false
    }, { status: 500 });
  }
}