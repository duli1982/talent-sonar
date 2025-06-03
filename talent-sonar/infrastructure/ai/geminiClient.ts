export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateTextRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateTextResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class GeminiClient {
  private config: GeminiConfig;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(config: GeminiConfig) {
    this.config = {
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 1000,
      ...config
    };
  }

  async generateText(prompt: string, options?: Partial<GenerateTextRequest>): Promise<string> {
    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: options?.temperature || this.config.temperature,
          maxOutputTokens: options?.maxTokens || this.config.maxTokens,
          topP: 0.8,
          topK: 10
        }
      };

      const response = await fetch(
        `${this.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('No response generated');
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate text: ${error.message}`);
    }
  }

  async generateStructuredResponse<T>(
    prompt: string, 
    schema: string,
    options?: Partial<GenerateTextRequest>
  ): Promise<T> {
    const structuredPrompt = `
      ${prompt}
      
      Please respond in the following JSON format:
      ${schema}
      
      Return only valid JSON, no additional text.
    `;

    try {
      const response = await this.generateText(structuredPrompt, options);
      return JSON.parse(response.trim());
    } catch (error) {
      throw new Error(`Failed to generate structured response: ${error.message}`);
    }
  }

  async generateBatch(prompts: string[], options?: Partial<GenerateTextRequest>): Promise<string[]> {
    const results: string[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchPromises = batch.map(prompt => this.generateText(prompt, options));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch ${i / batchSize + 1} failed:`, error);
        // Add empty strings for failed requests
        results.push(...new Array(batch.length).fill(''));
      }
      
      // Add delay between batches
      if (i + batchSize < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Specialized methods for talent matching
  async generateCandidateAnalysis(candidate: any, job: any): Promise<string> {
    const prompt = `
      Analyze this candidate for the given job position:
      
      CANDIDATE:
      Name: ${candidate.firstName} ${candidate.lastName}
      Skills: ${candidate.skills.map(s => `${s.name} (${s.level})`).join(', ')}
      Experience: ${candidate.experience.map(e => `${e.position} at ${e.company}`).join(', ')}
      
      JOB:
      Title: ${job.title}
      Requirements: ${job.requirements.map(r => `${r.skill} (${r.level})`).join(', ')}
      
      Provide a detailed analysis of:
      1. Skill alignment
      2. Experience relevance
      3. Growth potential
      4. Potential concerns
      
      Keep the analysis professional and objective.
    `;

    return this.generateText(prompt);
  }

  async generatePersonalizedOutreach(candidate: any, job: any, tone: string = 'professional'): Promise<{
    subject: string;
    body: string;
  }> {
    const schema = `
    {
      "subject": "Email subject line",
      "body": "Email body content"
    }
    `;

    const prompt = `
      Generate a personalized outreach email for:
      
      Candidate: ${candidate.firstName} ${candidate.lastName}
      Job: ${job.title}
      Tone: ${tone}
      Internal: ${candidate.isInternal ? 'Yes' : 'No'}
      
      Make it engaging and personalized based on their background.
    `;

    return this.generateStructuredResponse(prompt, schema);
  }
}

// Mock implementation for development/testing
export class MockGeminiClient extends GeminiClient {
  constructor() {
    super({ apiKey: 'mock-key' });
  }

  async generateText(prompt: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock responses based on prompt content
    if (prompt.includes('candidate match')) {
      return "This candidate shows strong alignment with the position requirements, particularly in JavaScript and React development. Their 5 years of experience matches well with the senior-level role. Some areas for growth include TypeScript proficiency.";
    }
    
    if (prompt.includes('outreach email')) {
      return "I hope this message finds you well. I wanted to reach out about an exciting opportunity that aligns perfectly with your background and skills. Your experience with modern web technologies makes you an ideal candidate for our Senior Developer position. I'd love to discuss this opportunity with you further.";
    }
    
    if (prompt.includes('subject line')) {
      return "Exciting Senior Developer opportunity - perfect match for your skills";
    }
    
    return "This is a mock response for development purposes. The actual Gemini API would provide more sophisticated and contextual responses.";
  }
}
