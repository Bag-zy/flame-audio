// Direct test of Google TTS REST API
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

// Test data
const text = 'Hello, this is a test of the text-to-speech API.';
const voiceName = 'Kore';

// Test different request formats
const testFormats = [
  {
    name: 'Format 1: generationConfig + camelCase',
    data: {
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    }
  },
  {
    name: 'Format 2: config + snake_case',
    data: {
      contents: [{ parts: [{ text }] }],
      config: {
        response_modalities: ['Audio'],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: { voice_name: voiceName }
          }
        }
      }
    }
  },
  {
    name: 'Format 3: Simple responseModalities',
    data: {
      contents: [{ parts: [{ text }] }],
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  }
];

async function testFormat(format) {
  return new Promise((resolve) => {
    console.log(`\n--- Testing ${format.name} ---`);
    
    const requestData = JSON.stringify(format.data);
    console.log('Request data:', JSON.stringify(format.data, null, 2));
    
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
              console.log('✅ SUCCESS: Audio data received');
              const outputPath = path.join(__dirname, `test-output-${format.name.replace(/[^a-zA-Z0-9]/g, '-')}.wav`);
              fs.writeFileSync(outputPath, Buffer.from(audioData, 'base64'));
              console.log(`Audio saved to ${outputPath}`);
            } else {
              console.log('❌ No audio data in response');
              console.log('Response structure:', JSON.stringify(response, null, 2));
            }
          } catch (error) {
            console.log('❌ Error parsing response:', error.message);
            console.log('Raw response:', data);
          }
        } else {
          console.log('❌ Error response:', data);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      resolve();
    });
    
    req.write(requestData);
    req.end();
  });
}

async function runTests() {
  console.log('Testing Google TTS API with different formats...\n');
  
  for (const format of testFormats) {
    await testFormat(format);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n--- Test completed ---');
}

runTests();