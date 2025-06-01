import type { NextApiRequest, NextApiResponse } from 'next';
import { Candidate } from '../../domain/candidate';
import { Job } from '../../domain/job';
import { Match } from '../../domain/match';
import { matchCandidatesToJob } from '../../application/matchCandidates';
import { getAllCandidates, getJobById } from '../../infrastructure/data'; // Using mock data

type ErrorResponse = {
  error: string;
  details?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Match[] | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { jobId } = req.body;

  if (!jobId || typeof jobId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid jobId in request body' });
  }

  try {
    const job = await getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: `Job with ID ${jobId} not found` });
    }

    const candidates = await getAllCandidates();
    if (!candidates || candidates.length === 0) {
      return res.status(200).json([]); // No candidates to match
    }

    const matches = matchCandidatesToJob(job, candidates);

    return res.status(200).json(matches);

  } catch (err: any) {
    console.error('Error in /api/match:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
