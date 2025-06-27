// Test script for Google Generative AI TTS
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^"(.*)"$/, '$1');
    env[key] = value;
  }
});

// Set environment variables
process.env.GOOGLE_GENERATIVE_AI_API_KEY = env.GOOGLE_GENERATIVE_AI_API_KEY;

async function testTTS() {
  try {
    console.log('Testing Google Generative AI TTS...');
    
    // Check API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY is not set in .env.local');
      return;
    }
    console.log(`API key found (length: ${apiKey.length})`);
    
    // Initialize the API
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('API initialized');
    
    // Generate content
    console.log('Generating speech...');
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: 'Hello, this is a test of the text-to-speech API.' }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });
    console.log('Response received');
    
    // Extract audio data
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      console.error('No audio data in response');
      console.log('Response structure:', JSON.stringify(response, null, 2));
      return;
    }
    
    // Save audio file
    const outputPath = path.join(__dirname, 'test-output.wav');
    fs.writeFileSync(outputPath, Buffer.from(audioData, 'base64'));
    console.log(`Audio saved to ${outputPath}`);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error testing TTS:', error);
    console.error('Error details:', error.message);
    
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      console.error('\nThe TTS model is not available or not enabled for your API key.');
      console.error('Make sure you have access to the Gemini 2.5 TTS models.');
    }
    
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      console.error('\nYou have exceeded the Google Generative AI API quota.');
      console.error('Please try again later or upgrade your API plan.');
    }
  }
}

testTTS();