import type { NextApiRequest, NextApiResponse } from 'next';
import { Job } from '../../domain/job';
import { Candidate } from '../../domain/candidate';
import { matchCandidates } from '../../application/matchCandidates'; // Using the actual application function

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { job, candidates } = req.body as { job: Job, candidates: Candidate[] };

      if (!job || !candidates) {
        return res.status(400).json({ error: 'Missing job or candidates in request body' });
      }

      // In a real app, you might fetch candidates based on the job,
      // or have them passed from a more sophisticated frontend.
      const matches = await matchCandidates(job, candidates);

      // For now, let's add a dummy score if the application layer doesn't.
      // The application layer `matchCandidates` currently returns [].
      // So we will mock a response here for the UI to work.
      const enhancedMatches = candidates.map(candidate => {
         let score = 0;
         const commonSkills = candidate.skills.filter(skill => job.requiredSkills.includes(skill));
         score += commonSkills.length * 20; // 20 points per common skill
         if (candidate.experienceYears >= job.minExperienceYears) {
             score += 20; // 20 points for meeting experience
         }
         score = Math.min(score, 100); // Cap score at 100

         return {
             candidate,
             job,
             score,
             isStrongMatch: score > 60
         };
      }).filter(match => match.score > 0); // Only return candidates with some match score


      res.status(200).json({ matches: enhancedMatches });
    } catch (error) {
      console.error('Error in match API:', error);
      res.status(500).json({ error: 'Internal server error while matching candidates' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
