import https from 'https';

interface TTSRequestOptions {
  text: string;
  voiceName: string;
  isMultiSpeaker: boolean;
  speakerVoiceConfigs?: Array<{
    speaker: string;
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName: string };
    };
  }>;
}

export async function callGoogleTTSAPI(apiKey: string, options: TTSRequestOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    // Prepare request data
    let requestData;
    
    if (options.isMultiSpeaker && options.speakerVoiceConfigs) {
      // Multi-speaker request
      requestData = JSON.stringify({
        contents: [{ parts: [{ text: options.text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: options.speakerVoiceConfigs
            }
          }
        }
      });
    } else {
      // Single-speaker request
      requestData = JSON.stringify({
        contents: [{ parts: [{ text: options.text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: options.voiceName }
            }
          }
        }
      });
    }
    
    // API endpoint
    const apiOptions = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    // Make the request
    const req = https.request(apiOptions, (res) => {
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
          } catch (error) {
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
    
    // Send the request
    req.write(requestData);
    req.end();
  });
}