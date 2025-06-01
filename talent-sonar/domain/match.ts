import { Candidate } from './candidate';
import { Job } from './job';

export interface Match {
  id: string;
  candidate: Candidate;
  job: Job;
  score: number; // A numerical score representing the quality of the match
  matchDate: Date;
}

export interface MatchCreateDTO {
  candidateId: string;
  jobId: string;
  score: number;
}
