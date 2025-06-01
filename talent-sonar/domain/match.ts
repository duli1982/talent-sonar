import { CandidateProfile } from './candidate';
import { JobDescription } from './job';

export interface MatchResult {
  candidate: CandidateProfile;
  score: number;
  reason: string;
}

// This is a stub matching function. Replace with AI/embeddings logic later!
export function matchCandidatesToJob(
  job: JobDescription,
  candidates: CandidateProfile[]
): MatchResult[] {
  return candidates.map((cand) => {
    // Simple: score is random, reason just echoes job title
    const score = Math.random();
    const reason = `Matched based on skills overlap with "${job.title}"`;
    return { candidate: cand, score, reason };
  }).sort((a, b) => b.score - a.score);
}
