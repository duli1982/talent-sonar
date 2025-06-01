import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';

// This is mock data. In a real application, this data would come from a database,
// APIs, or other persistent storage.

export const mockCandidates: Candidate[] = [
  {
    id: 'cand001',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    skills: ['TypeScript', 'React', 'Angular', 'Java', 'Project Management'],
    experience: 5,
    education: 'B.Sc. Computer Science, Stanford University'
  },
  {
    id: 'cand002',
    name: 'Bob The Builder',
    email: 'bob@example.com',
    skills: ['Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'SQL'],
    experience: 2,
    education: 'M.Sc. Software Engineering, MIT'
  },
  {
    id: 'cand003',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    skills: ['TypeScript', 'React', 'Node.js', 'GraphQL', 'Next.js', 'System Design'],
    experience: 7,
    education: 'Ph.D. Computer Science, UC Berkeley'
  },
  {
    id: 'cand004',
    name: 'Diana Prince',
    email: 'diana@example.com',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'SQL', 'Leadership'],
    experience: 10,
    education: 'B.Eng. Software Engineering, University of Toronto'
  },
  {
    id: 'cand005',
    name: 'Edward Scissorhands',
    email: 'edward@example.com',
    skills: ['C++', 'Game Development', 'Unity', 'Unreal Engine', 'Artifical Intelligence'],
    experience: 4,
    education: 'Self-taught / Various Online Courses'
  },
  {
    id: 'cand006',
    name: 'Fiona Gallagher',
    email: 'fiona@example.com',
    skills: ['Customer Service', 'Sales', 'Team Management', 'Communication', 'Problem Solving'],
    experience: 6,
    education: 'High School Diploma, Some College'
  }
];

export const mockJobs: Job[] = [
  {
    id: 'job001',
    title: 'Senior Frontend Engineer',
    description: 'Join our innovative team to build cutting-edge user interfaces with React and TypeScript. Lead frontend development projects and mentor junior engineers.',
    requiredSkills: ['TypeScript', 'React', 'Redux', 'Next.js', 'System Design', 'Leadership'],
    requiredExperience: 5,
    location: 'San Francisco, CA',
    company: 'Innovatech Solutions'
  },
  {
    id: 'job002',
    title: 'Cloud Infrastructure Engineer',
    description: 'Design, build, and maintain our scalable cloud infrastructure on AWS. Work with Docker, Kubernetes, and IaC tools.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python', 'CI/CD'],
    requiredExperience: 4,
    location: 'Remote',
    company: 'CloudNimbus Inc.'
  },
  {
    id: 'job003',
    title: 'Full-Stack Developer',
    description: 'Develop and maintain both frontend and backend components of our web applications. Tech stack includes Node.js, Express, React, and PostgreSQL.',
    requiredSkills: ['Node.js', 'Express.js', 'React', 'SQL', 'REST APIs'],
    requiredExperience: 3,
    location: 'New York, NY',
    company: 'Connective Apps'
  },
  {
    id: 'job004',
    title: 'Game Developer',
    description: 'Create immersive gameplay experiences using Unity or Unreal Engine. Passion for gaming and strong C++ or C# skills required.',
    requiredSkills: ['C++', 'C#', 'Unity', 'Unreal Engine', 'Game Design'],
    requiredExperience: 2,
    location: 'Austin, TX',
    company: 'PixelPlay Studios'
  }
];

// Functions to simulate data fetching (could be replaced with actual API calls)
export const getCandidateById = async (id: string): Promise<Candidate | undefined> => {
  return mockCandidates.find(c => c.id === id);
};

export const getAllCandidates = async (): Promise<Candidate[]> => {
  return mockCandidates;
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
  return mockJobs.find(j => j.id === id);
};

export const getAllJobs = async (): Promise<Job[]> => {
  return mockJobs;
};
