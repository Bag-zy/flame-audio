const { google } = require('@ai-sdk/google');

async function testAISDK() {
  try {
    console.log('Google AI SDK version:', require('@ai-sdk/google/package.json').version);
    console.log('Google AI SDK loaded successfully');
    
    // Test creating a simple text generation model
    const model = google('gemini-pro');
    console.log('Model created successfully:', model.modelId);
    
    // Test a simple completion
    const response = await model.generateText({
      prompt: 'Hello, world!',
      maxTokens: 10
    });
    
    console.log('Test response:', response);
  } catch (error) {
    console.error('Error testing Google AI SDK:', error);
  }
}

testAISDK();
