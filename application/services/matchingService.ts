// Service for intelligent matching between candidates/employees and jobs

import { Candidate, Employee, Job, Match } from '../../domain';

export class MatchingService {
  // Example: match candidates by skills similarity
  static matchCandidatesToJob(
    candidates: Candidate[] | Employee[],
    job: Job
  ): Match[] {
    // Very basic logic; replace with AI/embedding logic later
    return candidates.map((profile) => ({
      profileId: profile.id,
      jobId: job.id,
      score: MatchingService.calculateMatchScore(profile.skills, job.skills)
    }));
  }

  static calculateMatchScore(profileSkills: string[], jobSkills: string[]): number {
    // Example: percent overlap of skills
    const overlap = profileSkills.filter(skill => jobSkills.includes(skill));
    return overlap.length / jobSkills.length;
  }
}
