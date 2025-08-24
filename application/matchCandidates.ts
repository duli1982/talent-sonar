import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';
import { Match } from '../domain/match';

export function matchCandidates(candidates: Candidate[], job: Job): Match[] {
  return candidates
    .map(candidate => {
      const matchedSkills = candidate.skills.filter(skill =>
        job.requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
      );
      const score = matchedSkills.length / job.requiredSkills.length;
      const explanation = matchedSkills.length
        ? `Matched skills: ${matchedSkills.join(', ')}`
        : 'No required skills matched';
      return { candidate, job, score, explanation };
    })
    .sort((a, b) => b.score - a.score);
}
