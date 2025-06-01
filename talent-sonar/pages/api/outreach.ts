import type { NextApiRequest, NextApiResponse } from 'next';
import { Match } from '../../domain/match'; // Assuming Match includes Candidate and Job details
import { draftOutreachMessage } from '../../application/draftOutreach';
import { getCandidateById, getJobById } from '../../infrastructure/data'; // To reconstruct match if needed

// This is the expected structure for the outreach request body
interface OutreachRequestBody {
  match?: Match; // Preferably, the full match object is sent
  // OR, if sending IDs:
  candidateId?: string;
  jobId?: string;
  score?: number; // Score might be recalculated or taken as is
}

interface OutreachResponse {
  subject: string;
  body: string;
  recipientEmail: string;
}

type ErrorResponse = {
  error: string;
  details?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OutreachResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { match, candidateId, jobId, score }: OutreachRequestBody = req.body;

  let fullMatch: Match | null = null;

  try {
    if (match && match.candidate && match.job) {
      fullMatch = match;
    } else if (candidateId && jobId) {
      // If full match object is not provided, try to reconstruct it
      const candidate = await getCandidateById(candidateId);
      const job = await getJobById(jobId);

      if (!candidate) {
        return res.status(404).json({ error: `Candidate with ID ${candidateId} not found` });
      }
      if (!job) {
        return res.status(404).json({ error: `Job with ID ${jobId} not found` });
      }

      // score might be missing or provided, if not, it's okay as draftOutreachMessage might not use it directly
      // or might use a default. The current implementation of draftOutreachMessage does use score.
      // For simplicity, we'll use the provided score or a default if not available.
      const matchScore = typeof score === 'number' ? score : 0; // Default score if not provided

      fullMatch = {
        id: `temp_match_${candidateId}_${jobId}`, // Temporary ID as it's reconstructed
        candidate,
        job,
        score: matchScore,
        matchDate: new Date(), // Match date for a reconstructed match might not be accurate
      };
    } else {
      return res.status(400).json({
        error: 'Invalid request body. Provide either a full "match" object or "candidateId" and "jobId".'
      });
    }

    if (!fullMatch) {
      // This case should ideally be caught by the checks above, but as a safeguard:
      return res.status(400).json({ error: 'Could not determine match details from request.' });
    }

    const outreachDetails = draftOutreachMessage(fullMatch);

    return res.status(200).json(outreachDetails);

  } catch (err: any) {
    console.error('Error in /api/outreach:', err);
    if (err.message.startsWith('Invalid match data')) { // Specific error from draftOutreachMessage
        return res.status(400).json({ error: 'Invalid match data provided.', details: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
