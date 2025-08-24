import type { NextApiRequest, NextApiResponse } from 'next';
import { draftOutreach } from '../../application/draftOutreach';
import { Candidate } from '../../domain/candidate';
import { Job } from '../../domain/job';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const { candidate, job } = req.body as { candidate: Candidate; job: Job };
    const message = await draftOutreach(candidate, job);
    return res.status(200).json({ message });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
