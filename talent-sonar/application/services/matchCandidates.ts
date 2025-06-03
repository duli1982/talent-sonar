import { CandidateEntity, Candidate } from '../../domain/candidate';
import { JobEntity, Job } from '../../domain/job';
import { MatchEntity, Match, SkillMatch } from '../../domain/match';
import { VectorDbService } from '../../infrastructure/data/vectorDb';
import { GeminiClient } from '../../infrastructure/ai/geminiClient';

export interface MatchCandidatesRequest {
  jobId: string;
  maxResults?: number;
  minScore?: number;
  includeInternal?: boolean;
  includeExternal?: boolean;
}

export interface MatchCandidatesResponse {
  matches: Match[];
  totalCandidatesEvaluated: number;
  processingTimeMs: number;
}

export class MatchCandidatesService {
  constructor(
    private vectorDb: VectorDbService,
    private geminiClient: GeminiClient
  ) {}

  async execute(request: MatchCandidatesRequest): Promise<MatchCandidatesResponse> {
    const startTime = Date.now();
    
    try {
      // Get job details
      const job = await this.vectorDb.getJob(request.jobId);
      if (!job) {
        throw new Error(`Job with ID ${request.jobId} not found`);
      }

      const jobEntity = new JobEntity(job);
      
      // Find similar candidates using vector search
      const candidateIds = await this.vectorDb.findSimilarCandidates(
        job.embedding || [],
        request.maxResults || 50
      );

      // Filter candidates based on request criteria
      const candidates = await this.filterCandidates(candidateIds, request);
      
      // Generate matches for each candidate
      const matches: Match[] = [];
      for (const candidate of candidates) {
        const match = await this.generateMatch(candidate, jobEntity);
        if (match.overallScore >= (request.minScore || 0.3)) {
          matches.push(match);
        }
      }

      // Sort by overall score descending
      matches.sort((a, b) => b.overallScore - a.overallScore);

      const processingTime = Date.now() - startTime;

      return {
        matches: matches.slice(0, request.maxResults || 20),
        totalCandidatesEvaluated: candidates.length,
        processingTimeMs: processingTime
      };

    } catch (error) {
      throw new Error(`Failed to match candidates: ${error.message}`);
    }
  }

  private async filterCandidates(
    candidateIds: string[], 
    request: MatchCandidatesRequest
  ): Promise<Candidate[]> {
    const candidates: Candidate[] = [];
    
    for (const id of candidateIds) {
      const candidate = await this.vectorDb.getCandidate(id);
      if (!candidate) continue;

      // Filter by internal/external preference
      if (request.includeInternal === false && candidate.isInternal) continue;
      if (request.includeExternal === false && !candidate.isInternal) continue;
      
      // Only include available candidates
      if (candidate.availabilityStatus === 'not_available') continue;

      candidates.push(candidate);
    }

    return candidates;
  }

  private async generateMatch(candidate: Candidate, job: JobEntity): Promise<Match> {
    const candidateEntity = new CandidateEntity(candidate);
    
    // Calculate skill matches
    const skillMatches = this.calculateSkillMatches(candidateEntity, job);
    
    // Calculate various scores
    const experienceScore = this.calculateExperienceScore(candidateEntity, job);
    const locationScore = this.calculateLocationScore(candidate, job.toJSON());
    const availabilityScore = this.calculateAvailabilityScore(candidate);
    
    // Calculate overall score with weights
    const overallScore = this.calculateOverallScore({
      skillMatches,
      experienceScore,
      locationScore,
      availabilityScore
    });

    // Generate AI reasoning
    const reasoning = await this.generateReasoning(candidateEntity, job, skillMatches);

    const match: Match = {
      id: `match_${candidate.id}_${job.id}_${Date.now()}`,
      candidateId: candidate.id,
      jobId: job.id,
      overallScore,
      skillMatches,
      experienceScore,
      locationScore,
      availabilityScore,
      reasoning,
      confidence: Math.min(overallScore + 0.1, 1.0),
      matchType: candidate.isInternal ? 'internal' : 'external',
      createdAt: new Date(),
      status: 'pending'
    };

    return match;
  }

  private calculateSkillMatches(candidate: CandidateEntity, job: JobEntity): SkillMatch[] {
    const skillMatches: SkillMatch[] = [];
    const jobRequirements = job.requirements;
    const candidateSkills = candidate.skills;

    for (const requirement of jobRequirements) {
      const candidateSkill = candidateSkills.find(skill => 
        skill.name.toLowerCase().includes(requirement.skill.toLowerCase()) ||
        requirement.skill.toLowerCase().includes(skill.name.toLowerCase())
      );

      const skillMatch: SkillMatch = {
        skillName: requirement.skill,
        candidateLevel: candidateSkill?.level || 'none',
        requiredLevel: requirement.level,
        score: candidateSkill ? this.calculateSkillScore(candidateSkill.level, requirement.level) : 0,
        isMatch: candidateSkill ? this.isSkillLevelMatch(candidateSkill.level, requirement.level) : false
      };

      skillMatches.push(skillMatch);
    }

    return skillMatches;
  }

  private calculateSkillScore(candidateLevel: string, requiredLevel: string): number {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    const candidateScore = levels[candidateLevel] || 0;
    const requiredScore = levels[requiredLevel] || 1;
    
    if (candidateScore >= requiredScore) return 1.0;
    if (candidateScore === requiredScore - 1) return 0.7;
    if (candidateScore === requiredScore - 2) return 0.4;
    return 0.1;
  }

  private isSkillLevelMatch(candidateLevel: string, requiredLevel: string): boolean {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    return (levels[candidateLevel] || 0) >= (levels[requiredLevel] || 1);
  }

  private calculateExperienceScore(candidate: CandidateEntity, job: JobEntity): number {
    const totalYears = candidate.getTotalExperienceYears();
    const jobLevel = job.toJSON().experienceLevel;
    
    const requiredYears = {
      'entry': 0,
      'mid': 3,
      'senior': 7,
      'lead': 10
    };

    const required = requiredYears[jobLevel] || 0;
    if (totalYears >= required) return 1.0;
    if (totalYears >= required * 0.7) return 0.8;
    if (totalYears >= required * 0.5) return 0.6;
    return 0.3;
  }

  private calculateLocationScore(candidate: Candidate, job: Job): number {
    if (candidate.location.toLowerCase() === job.location.toLowerCase()) return 1.0;
    if (candidate.location.toLowerCase().includes('remote') || job.location.toLowerCase().includes('remote')) return 0.9;
    return 0.5; // Different location but potentially relocatable
  }

  private calculateAvailabilityScore(candidate: Candidate): number {
    switch (candidate.availabilityStatus) {
      case 'available': return 1.0;
      case 'partially_available': return 0.7;
      case 'not_available': return 0.1;
      default: return 0.5;
    }
  }

  private calculateOverallScore(scores: {
    skillMatches: SkillMatch[];
    experienceScore: number;
    locationScore: number;
    availabilityScore: number;
  }): number {
    const skillScore = scores.skillMatches.reduce((sum, match) => sum + match.score, 0) / scores.skillMatches.length;
    
    // Weighted average
    const weights = {
      skills: 0.5,
      experience: 0.25,
      location: 0.15,
      availability: 0.1
    };

    return (
      skillScore * weights.skills +
      scores.experienceScore * weights.experience +
      scores.locationScore * weights.location +
      scores.availabilityScore * weights.availability
    );
  }

  private async generateReasoning(
    candidate: CandidateEntity,
    job: JobEntity,
    skillMatches: SkillMatch[]
  ): Promise<string> {
    const matchedSkills = skillMatches.filter(m => m.isMatch).map(m => m.skillName);
    const missingSkills = skillMatches.filter(m => !m.isMatch).map(m => m.skillName);
    
    const prompt = `
      Analyze this candidate match for the position:
      
      Job: ${job.title}
      Candidate: ${candidate.fullName}
      Matched Skills: ${matchedSkills.join(', ')}
      Missing Skills: ${missingSkills.join(', ')}
      Experience: ${candidate.getTotalExperienceYears().toFixed(1)} years
      
      Provide a concise 2-3 sentence explanation of why this candidate is a good match, 
      highlighting strengths and noting any skill gaps.
    `;

    try {
      return await this.geminiClient.generateText(prompt);
    } catch (error) {
      return `Strong candidate with ${matchedSkills.length} matching skills. ${missingSkills.length > 0 ? `May need development in: ${missingSkills.slice(0, 3).join(', ')}.` : ''}`;
    }
  }
}
