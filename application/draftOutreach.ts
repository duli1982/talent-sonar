import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';
import { generateText } from '../infrastructure/geminiClient';

export async function draftOutreach(candidate: Candidate, job: Job): Promise<string> {
  const prompt = `Write a concise personalized outreach message inviting ${candidate.name} to apply for the ${job.title} role. Highlight matching skills: ${job.requiredSkills.join(', ')}.`;
  try {
    return await generateText(prompt);
  } catch (err) {
    return `Hi ${candidate.name}, we think you'd be great for the ${job.title} position. Let's talk!`;
  }
}
