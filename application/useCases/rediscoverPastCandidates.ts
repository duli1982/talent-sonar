// Use case: Rediscover strong "silver medalist" past candidates

import { Candidate, Job } from '../../domain';
import { MatchingService } from '../services/matchingService';

export function rediscoverPastCandidates(candidates: Candidate[], job: Job) {
  const matches = MatchingService.matchCandidatesToJob(candidates, job);
  // Only return those above a threshold (e.g., 60%)
  return matches.filter(match => match.score >= 0.6);
}
