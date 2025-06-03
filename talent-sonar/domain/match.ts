export interface SkillMatch {
  skillName: string;
  candidateLevel: string;
  requiredLevel: string;
  score: number; // 0-1
  isMatch: boolean;
}

export interface Match {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number; // 0-1
  skillMatches: SkillMatch[];
  experienceScore: number;
  locationScore: number;
  availabilityScore: number;
  culturalFitScore?: number;
  reasoning: string;
  confidence: number; // 0-1
  matchType: 'internal' | 'external' | 'returning_candidate';
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'contacted' | 'rejected';
}

export class MatchEntity {
  private state: Match;

  constructor(match: Match) {
    this.state = { ...match };
    this.validateMatch();
  }

  get id(): string { return this.state.id; }
  get candidateId(): string { return this.state.candidateId; }
  get jobId(): string { return this.state.jobId; }
  get overallScore(): number { return this.state.overallScore; }
  get skillMatches(): SkillMatch[] { return [...this.state.skillMatches]; }
  get matchType(): string { return this.state.matchType; }
  get status(): string { return this.state.status; }
  get reasoning(): string { return this.state.reasoning; }

  public isHighQualityMatch(): boolean {
    return this.state.overallScore >= 0.7 && this.state.confidence >= 0.8;
  }

  public getMatchedSkills(): SkillMatch[] {
    return this.state.skillMatches.filter(match => match.isMatch);
  }

  public getMissingSkills(): SkillMatch[] {
    return this.state.skillMatches.filter(match => !match.isMatch);
  }

  public updateStatus(status: Match['status']): void {
    this.state.status = status;
  }

  public getMatchSummary(): string {
    const matchedCount = this.getMatchedSkills().length;
    const totalCount = this.state.skillMatches.length;
    const percentage = Math.round((this.state.overallScore * 100));
    
    return `${percentage}% match (${matchedCount}/${totalCount} skills matched)`;
  }

  private validateMatch(): void {
    if (!this.state.candidateId || !this.state.jobId) {
      throw new Error('Candidate ID and Job ID are required');
    }
    if (this.state.overallScore < 0 || this.state.overallScore > 1) {
      throw new Error('Overall score must be between 0 and 1');
    }
    if (this.state.confidence < 0 || this.state.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
  }

  public toJSON(): Match {
    return { ...this.state };
  }
}
