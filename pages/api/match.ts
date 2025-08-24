import type { NextApiRequest, NextApiResponse } from 'next';
import { matchCandidates } from '../../application/matchCandidates';
import { Candidate } from '../../domain/candidate';
import { Job } from '../../domain/job';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const { candidates, job } = req.body as { candidates: Candidate[]; job: Job };
    const matches = matchCandidates(candidates, job);
    return res.status(200).json({ matches });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
