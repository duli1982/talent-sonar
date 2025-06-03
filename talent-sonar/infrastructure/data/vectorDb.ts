import { Candidate } from '../../domain/candidate';
import { Job } from '../../domain/job';
import { Match } from '../../domain/match';

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
  calculateSimilarity(embedding1: number[], embedding2: number[]): number;
}

export class VectorDbService {
  private candidates: Map<string, Candidate> = new Map();
  private jobs: Map<string, Job> = new Map();
  private matches: Map<string, Match> = new Map();
  private candidateEmbeddings: Map<string, number[]> = new Map();
  private jobEmbeddings: Map<string, number[]> = new Map();

  constructor(private embeddingService: EmbeddingService) {
    this.initializeSampleData();
  }

  // Candidate operations
  async addCandidate(candidate: Candidate): Promise<void> {
    this.candidates.set(candidate.id, candidate);
    
    // Generate embedding for candidate
    const candidateText = this.candidateToText(candidate);
    const embedding = await this.embeddingService.generateEmbedding(candidateText);
    this.candidateEmbeddings.set(candidate.id, embedding);
    
    // Update candidate with embedding
    candidate.embedding = embedding;
  }

  async getCandidate(id: string): Promise<Candidate | null> {
    return this.candidates.get(id) || null;
  }

  async getAllCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  // Job operations
  async addJob(job: Job): Promise<void> {
    this.jobs.set(job.id, job);
    
    // Generate embedding for job
    const jobText = this.jobToText(job);
    const embedding = await this.embeddingService.generateEmbedding(jobText);
    this.jobEmbeddings.set(job.id, embedding);
    
    // Update job with embedding
    job.embedding = embedding;
  }

  async getJob(id: string): Promise<Job | null> {
    return this.jobs.get(id) || null;
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  // Match operations
  async addMatch(match: Match): Promise<void> {
    this.matches.set(match.id, match);
  }

  async getMatch(id: string): Promise<Match | null> {
    return this.matches.get(id) || null;
  }

  async getMatchesForJob(jobId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match => match.jobId === jobId);
  }

  async getMatchesForCandidate(candidateId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match => match.candidateId === candidateId);
  }

  // Vector search operations
  async findSimilarCandidates(jobEmbedding: number[], limit: number = 10): Promise<string[]> {
    const similarities: Array<{ id: string; score: number }> = [];
    
    for (const [candidateId, candidateEmbedding] of this.candidateEmbeddings.entries()) {
      const similarity = this.embeddingService.calculateSimilarity(jobEmbedding, candidateEmbedding);
      similarities.push({ id: candidateId, score: similarity });
    }
    
    // Sort by similarity score (descending) and return top results
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.id);
  }

  async findSimilarJobs(candidateEmbedding: number[], limit: number = 10): Promise<string[]> {
    const similarities: Array<{ id: string; score: number }> = [];
    
    for (const [jobId, jobEmbedding] of this.jobEmbeddings.entries()) {
      const similarity = this.embeddingService.calculateSimilarity(candidateEmbedding, jobEmbedding);
      similarities.push({ id: jobId, score: similarity });
    }
    
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.id);
  }

  // Helper methods to convert objects to searchable text
  private candidateToText(candidate: Candidate): string {
    const skillsText = candidate.skills.map(skill => `${skill.name} ${skill.level}`).join(' ');
    const experienceText = candidate.experience.map(exp => 
      `${exp.position} at ${exp.company} ${exp.technologies.join(' ')}`
    ).join(' ');
    
    return `${candidate.firstName} ${candidate.lastName} ${skillsText} ${experienceText} ${candidate.resumeText}`.toLowerCase();
  }

  private jobToText(job: Job): string {
    const requirementsText = job.requirements.map(req => `${req.skill} ${req.level}`).join(' ');
    return `${job.title} ${job.department} ${job.description} ${requirementsText}`.toLowerCase();
  }

  // Initialize with sample data for demo
  private async initializeSampleData(): Promise<void> {
    // Sample candidates
    const sampleCandidates: Candidate[] = [
      {
        id: 'candidate_1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        location: 'Budapest',
        skills: [
          { name: 'JavaScript', level: 'advanced', yearsOfExperience: 5 },
          { name: 'React', level: 'advanced', yearsOfExperience: 4 },
          { name: 'Node.js', level: 'intermediate', yearsOfExperience: 3 }
        ],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Senior Developer',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2024-01-01'),
            description: 'Full-stack development',
            technologies: ['JavaScript', 'React', 'Node.js']
          }
        ],
        education: ['Computer Science Degree'],
        resumeText: 'Experienced full-stack developer with expertise in modern web technologies',
        isInternal: true,
        department: 'Engineering',
        currentRole: 'Senior Developer',
        careerAspirations: ['Team Lead', 'Architect'],
        performanceRating: 4.5,
        availabilityStatus: 'available',
        lastUpdated: new Date()
      },
      {
        id: 'candidate_2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@external.com',
        location: 'Budapest',
        skills: [
          { name: 'Python', level: 'expert', yearsOfExperience: 7 },
          { name: 'Machine Learning', level: 'advanced', yearsOfExperience: 5 },
          { name: 'TensorFlow', level: 'advanced', yearsOfExperience: 4 }
        ],
        experience: [
          {
            company: 'AI Solutions',
            position: 'ML Engineer',
            startDate: new Date('2019-01-01'),
            description: 'Machine learning model development',
            technologies: ['Python', 'TensorFlow', 'Scikit-learn']
          }
        ],
        education: ['PhD in Computer Science'],
        resumeText: 'PhD-level machine learning engineer with extensive experience in AI model development',
        isInternal: false,
        availabilityStatus: 'available',
        lastUpdated: new Date()
      }
    ];

    // Sample jobs
    const sampleJobs: Job[] = [
      {
        id: 'job_1',
        title: 'Senior Full-Stack Developer',
        department: 'Engineering',
        location: 'Budapest',
        description: 'We are looking for a senior full-stack developer to join our team',
        requirements: [
          { skill: 'JavaScript', level: 'advanced', required: true, weight: 9 },
          { skill: 'React', level: 'advanced', required: true, weight: 8 },
          { skill: 'Node.js', level: 'intermediate', required: true, weight: 7 },
          { skill: 'TypeScript', level: 'intermediate', required: false, weight: 6 }
        ],
        employmentType: 'full-time',
        experienceLevel: 'senior',
        isInternal: false,
        postedDate: new Date(),
        status: 'open',
        hiringManager: 'Jane Doe'
      },
      {
        id: 'job_2',
        title: 'AI/ML Engineer',
        department: 'Data Science',
        location: 'Budapest',
        description: 'Join our AI team to build cutting-edge machine learning solutions',
        requirements: [
          { skill: 'Python', level: 'advanced', required: true, weight: 10 },
          { skill: 'Machine Learning', level: 'advanced', required: true, weight: 9 },
          { skill: 'TensorFlow', level: 'intermediate', required: true, weight: 8 },
          { skill: 'Deep Learning', level: 'intermediate', required: false, weight: 7 }
        ],
        employmentType: 'full-time',
        experienceLevel: 'senior',
        isInternal: false,
        postedDate: new Date(),
        status: 'open',
        hiringManager: 'Bob Wilson'
      }
    ];

    // Add sample data
    for (const candidate of sampleCandidates) {
      await this.addCandidate(candidate);
    }

    for (const job of sampleJobs) {
      await this.addJob(job);
    }
  }
}

// Simple embedding service implementation for demo
export class SimpleEmbeddingService implements EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    // This is a simplified embedding generation for demo purposes
    // In production, you would use a proper embedding model
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0);
    
    // Simple hash-based embedding
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const index = (charCode * (i + 1)) % embedding.length;
        embedding[index] += 1 / (i + 1);
      }
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }
    
    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }
}
