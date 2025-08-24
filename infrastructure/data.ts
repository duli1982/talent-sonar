import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';

export const candidates: Candidate[] = [
  {
    id: 'c1',
    name: 'Alice Johnson',
    skills: ['TypeScript', 'React', 'Node.js'],
    experience: '3 years at TechCorp',
    resumeText: 'Experienced frontend developer with focus on React and TypeScript.'
  },
  {
    id: 'c2',
    name: 'Bob Smith',
    skills: ['Python', 'Django', 'React'],
    experience: '5 years full-stack experience',
    resumeText: 'Full stack engineer with Python and React expertise.'
  }
];

export const jobs: Job[] = [
  {
    id: 'j1',
    title: 'Frontend Developer',
    description: 'Build and maintain user interfaces.',
    requiredSkills: ['TypeScript', 'React']
  }
];
