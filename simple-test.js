// Simple test script for Google Generative AI TTS
const https = require('https');
const fs = require('fs');
const path = require('path');

// Read API key from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=([^\n]+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
  console.error('API key not found in .env.local file');
  process.exit(1);
}

console.log(`API key found (length: ${apiKey.length})`);

// Simple text to convert
const text = 'Hello, this is a test of the text-to-speech API.';
const voiceName = 'Kore';

// Create request data
const requestData = JSON.stringify({
  contents: [{ parts: [{ text }] }],
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName }
      }
    }
  }
});

// API endpoint
const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  }
};

console.log('Sending request to Google Generative AI API...');

// Make the request
const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
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
          const outputPath = path.join(__dirname, 'test-output.wav');
          fs.writeFileSync(outputPath, Buffer.from(audioData, 'base64'));
          console.log(`Audio saved to ${outputPath}`);
        } else {
          console.error('No audio data in response');
          console.log('Response:', JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        console.log('Raw response:', data);
      }
    } else {
      console.error('Error response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

// Send the request
req.write(requestData);
req.end();

console.log('Request sent, waiting for response...');