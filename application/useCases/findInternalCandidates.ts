// Use case: Find internal employees for a given job

import { Employee, Job } from '../../domain';
import { MatchingService } from '../services/matchingService';

export function findInternalCandidates(employees: Employee[], job: Job) {
  const matches = MatchingService.matchCandidatesToJob(employees, job);
  // Only return those above a threshold (e.g., 60%)
  return matches.filter(match => match.score >= 0.6);
}
