import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';

export async function draftOutreachMessage(candidate: Candidate, job: Job): Promise<string> {
  // Placeholder implementation:
  // This function will eventually generate a personalized outreach message.
  // For now, it returns a generic message.
  console.log(`Drafting outreach for candidate: ${candidate.name} for job: ${job.title}`);
  return `Dear ${candidate.name},

We think you might be a good fit for the ${job.title} position.

Best regards,
Talent Sonar Team`;
}
