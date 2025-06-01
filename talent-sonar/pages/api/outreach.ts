import type { NextApiRequest, NextApiResponse } from 'next';
import { Candidate } from '../../domain/candidate';
import { Job } from '../../domain/job';
import { draftOutreachMessage } from '../../application/draftOutreach'; // Using the actual application function

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { candidate, job } = req.body as { candidate: Candidate, job: Job };

      if (!candidate || !job) {
        return res.status(400).json({ error: 'Missing candidate or job in request body' });
      }

      const message = await draftOutreachMessage(candidate, job);
      res.status(200).json({ message });
    } catch (error) {
      console.error('Error in outreach API:', error);
      res.status(500).json({ error: 'Internal server error while drafting outreach' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
