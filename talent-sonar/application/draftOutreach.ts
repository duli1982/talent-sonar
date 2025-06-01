import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';
import { Match } from '../domain/match';

interface OutreachMessage {
  subject: string;
  body: string;
  recipientEmail: string;
}

// This is a simplified outreach drafting function.
// In a real application, this could involve more sophisticated templating,
// personalization based on more candidate/job attributes, and integration
// with email services.
export const draftOutreachMessage = (match: Match): OutreachMessage => {
  if (!match || !match.candidate || !match.job) {
    throw new Error('Invalid match data provided for drafting outreach.');
  }

  const { candidate, job, score }_ = match;

  const subject = `Opportunity at ${job.company}: ${job.title}`;

  let body = `Dear ${candidate.name},\n\n`;
  body += `I hope this email finds you well.\n\n`;
  body += `I came across your profile and was very impressed with your experience, particularly your skills in [mention key skills, e.g., ${candidate.skills.slice(0, 2).join(', ')}].\n\n`;
  body += `At ${job.company}, we are currently looking for a ${job.title}. `;
  body += `This role involves [briefly mention 1-2 key responsibilities from job.description, if available, otherwise use a generic phrase].\n\n`;

  body += `Based on your background, especially your ${candidate.experience} years of experience and skills, we believe you could be a great fit for this position. Our matching system gave your profile a score of ${score}% for this role.\n\n`;

  body += `Would you be open to a brief chat to discuss this opportunity further? You can learn more about the role here: [Link to Job Description - Placeholder]\n\n`;
  body += `Thank you for your time and consideration.\n\n`;
  body += `Best regards,\n\n`;
  body += `[Your Name/Recruiter Name]\n`;
  body += `[Your Title/Company]\n`;

  return {
    subject,
    body,
    recipientEmail: candidate.email,
  };
};

// Example Usage (can be removed or moved to a test file):
/*
const sampleCandidate: Candidate = {
  id: 'cand001',
  name: 'Alice Wonderland',
  email: 'alice@example.com',
  skills: ['TypeScript', 'React', 'Angular', 'Java'],
  experience: 5,
  education: 'B.Sc. Computer Science'
};

const sampleJob: Job = {
  id: 'job123',
  title: 'Software Engineer',
  description: 'Develop amazing software using modern technologies. Responsibilities include coding, testing, and deployment.',
  requiredSkills: ['TypeScript', 'React', 'Node.js'],
  requiredExperience: 3,
  location: 'Remote',
  company: 'Tech Solutions Inc.'
};

const sampleMatch: Match = {
  id: 'match123',
  candidate: sampleCandidate,
  job: sampleJob,
  score: 85,
  matchDate: new Date()
};

const outreach = draftOutreachMessage(sampleMatch);
console.log('Subject:', outreach.subject);
console.log('Email to:', outreach.recipientEmail);
console.log('Body:\n', outreach.body);
*/
