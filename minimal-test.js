// Minimal test script for Google TTS API
const https = require('https');
const fs = require('fs');

// Replace with your API key
const apiKey = 'AIzaSyBatYrbbr0AKVznDvFR7WRrqxtP0ADocbs';

// Create request data
const requestData = JSON.stringify({
  contents: [{ 
    parts: [{ 
      text: 'Hello, this is a test of the text-to-speech API.' 
    }] 
  }],
  generationConfig: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Kore' }
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

console.log('Sending request...');

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
          fs.writeFileSync('output.wav', Buffer.from(audioData, 'base64'));
          console.log('Audio saved to output.wav');
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