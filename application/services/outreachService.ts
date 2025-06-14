// Service for generating personalized outreach messages

import { Candidate, Employee, Job } from '../../domain';

export class OutreachService {
  static generateInternalOutreach(employee: Employee, job: Job): string {
    return `Hi ${employee.name}, we noticed your skills in ${employee.skills.join(', ')} match our new role "${job.title}". Interested in learning more about this opportunity?`;
  }

  static generatePastCandidateOutreach(candidate: Candidate, job: Job): string {
    return `Hello ${candidate.name}, we're revisiting top past candidates and think your experience is a great fit for our "${job.title}" role. Would you like to reconnect?`;
  }
}
