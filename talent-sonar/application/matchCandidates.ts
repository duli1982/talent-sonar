import { Candidate } from '../domain/candidate';
import { Job } from '../domain/job';
import { Match, MatchCreateDTO } from '../domain/match';

// This is a simplified matching algorithm.
// In a real application, this would involve more complex logic,
// possibly machine learning models, and external data sources.
const calculateMatchScore = (candidate: Candidate, job: Job): number => {
  let score = 0;

  // Score based on skills match
  const jobSkills = new Set(job.requiredSkills.map(skill => skill.toLowerCase()));
  const candidateSkills = new Set(candidate.skills.map(skill => skill.toLowerCase()));

  let commonSkills = 0;
  for (const skill of candidateSkills) {
    if (jobSkills.has(skill)) {
      commonSkills++;
    }
  }
  score += (commonSkills / job.requiredSkills.length) * 50; // Max 50 points for skills

  // Score based on experience
  if (candidate.experience >= job.requiredExperience) {
    score += 30; // 30 points if experience is sufficient
  } else {
    score += (candidate.experience / job.requiredExperience) * 30; // Proportional score
  }

  // Score based on education (simplified)
  // This could be more sophisticated, e.g., checking for specific degrees or institutions
  if (candidate.education && candidate.education.length > 0) {
    score += 20; // 20 points for having some education listed
  }

  return Math.min(Math.round(score), 100); // Ensure score is between 0 and 100
};

export const matchCandidatesToJob = (
  job: Job,
  candidates: Candidate[],
  // In a real app, this would likely be an async function
  // that fetches candidate and job data from a repository/database.
  // For simplicity, we'll pass them directly here.
  //
  // We might also have a MatchRepository to save the created matches.
  // saveMatch: (matchData: MatchCreateDTO) => Promise<Match>
): Match[] => {
  if (!job || !candidates || candidates.length === 0) {
    return [];
  }

  const matches: Match[] = candidates.map(candidate => {
    const score = calculateMatchScore(candidate, job);

    // We would typically call `saveMatch` here and use its result.
    // const newMatch = await saveMatch({ candidateId: candidate.id, jobId: job.id, score });
    // For this example, we'll create a Match object directly.
    const newMatch: Match = {
      id: `match_${job.id}_${candidate.id}_${Date.now()}`, // Simple unique ID
      candidate,
      job,
      score,
      matchDate: new Date(),
    };
    return newMatch;
  });

  // Sort matches by score in descending order
  return matches.sort((a, b) => b.score - a.score);
};

// Example Usage (can be removed or moved to a test file):
/*
const sampleJob: Job = {
  id: 'job123',
  title: 'Software Engineer',
  description: 'Develop amazing software.',
  requiredSkills: ['TypeScript', 'React', 'Node.js'],
  requiredExperience: 3,
  location: 'Remote',
  company: 'Tech Solutions Inc.'
};

const sampleCandidates: Candidate[] = [
  {
    id: 'cand001',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    skills: ['TypeScript', 'React', 'Angular', 'Java'],
    experience: 5,
    education: 'B.Sc. Computer Science'
  },
  {
    id: 'cand002',
    name: 'Bob The Builder',
    email: 'bob@example.com',
    skills: ['Node.js', 'Python', 'AWS'],
    experience: 2,
    education: 'M.Sc. Software Engineering'
  },
  {
    id: 'cand003',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    skills: ['TypeScript', 'React', 'Node.js', 'GraphQL'],
    experience: 7,
    education: 'Ph.D. Computer Science'
  }
];

const topMatches = matchCandidatesToJob(sampleJob, sampleCandidates);
console.log('Top Matches:', topMatches);
*/
