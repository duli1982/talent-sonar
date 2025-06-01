import { Candidate } from './candidate';
import { Job } from './job';

export interface Match {
  candidate: Candidate;
  job: Job;
  score: number; // Example: a percentage match
  isStrongMatch: boolean;
}
