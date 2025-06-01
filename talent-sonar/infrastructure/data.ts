import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';

// Placeholder data - in a real application, this would come from a database or API.

export const sampleCandidates: Candidate[] = [
  { id: 'cand1', name: 'Alice Wonderland', skills: ['TypeScript', 'React', 'Node.js'], experienceYears: 5 },
  { id: 'cand2', name: 'Bob The Builder', skills: ['Python', 'Django', 'AWS'], experienceYears: 8 },
  { id: 'cand3', name: 'Charlie Brown', skills: ['Java', 'Spring', 'Kubernetes'], experienceYears: 3 },
];

export const sampleJobs: Job[] = [
  { id: 'job1', title: 'Senior Frontend Developer', requiredSkills: ['TypeScript', 'React', 'Next.js'], minExperienceYears: 5 },
  { id: 'job2', title: 'Backend Python Engineer', requiredSkills: ['Python', 'FastAPI', 'PostgreSQL'], minExperienceYears: 4 },
];
