interface ClaudeMessage { role: 'user' | 'assistant'; content: string; }

export async function callClaude(systemPrompt: string, userMessage: string, maxTokens?: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not defined');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens || 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API Error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  if (data.content && data.content.length > 0 && data.content[0].text) {
    return data.content[0].text;
  }
  
  throw new Error('Unexpected response format from Claude API');
}
