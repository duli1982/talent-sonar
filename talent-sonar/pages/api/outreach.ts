import { NextApiRequest, NextApiResponse } from 'next';
import { DraftOutreachService, DraftOutreachRequest } from '../../application/services/draftOutreach';
import { VectorDbService, SimpleEmbeddingService } from '../../infrastructure/data/vectorDb';
import { GeminiClient, MockGeminiClient } from '../../infrastructure/ai/geminiClient';

// Initialize services
const embeddingService = new SimpleEmbeddingService();
const vectorDb = new VectorDbService(embeddingService);
const geminiClient = process.env.GEMINI_API_KEY 
  ? new GeminiClient({ apiKey: process.env.GEMINI_API_KEY })
  : new MockGeminiClient();
const outreachService = new DraftOutreachService(vectorDb, geminiClient);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const request: DraftOutreachRequest = req.body;
    
    // Validate request
    if (!request.matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }

    // Generate outreach
    const result = await outreachService.execute(request);
    
    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Outreach API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
