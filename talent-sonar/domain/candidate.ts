export interface CandidateSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
}

export interface CandidateExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  technologies: string[];
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location: string;
  skills: CandidateSkill[];
  experience: CandidateExperience[];
  education: string[];
  resumeText: string;
  isInternal: boolean;
  department?: string;
  currentRole?: string;
  careerAspirations?: string[];
  performanceRating?: number;
  availabilityStatus: 'available' | 'partially_available' | 'not_available';
  lastUpdated: Date;
  embedding?: number[];
}

export class CandidateEntity {
  private state: Candidate;

  constructor(candidate: Candidate) {
    this.state = { ...candidate };
    this.validateCandidate();
  }

  get id(): string { return this.state.id; }
  get fullName(): string { return `${this.state.firstName} ${this.state.lastName}`; }
  get email(): string { return this.state.email; }
  get skills(): CandidateSkill[] { return [...this.state.skills]; }
  get isInternal(): boolean { return this.state.isInternal; }
  get availabilityStatus(): string { return this.state.availabilityStatus; }

  public getSkillsByLevel(level: CandidateSkill['level']): CandidateSkill[] {
    return this.state.skills.filter(skill => skill.level === level);
  }

  public getTotalExperienceYears(): number {
    return this.state.experience.reduce((total, exp) => {
      const endDate = exp.endDate || new Date();
      const years = (endDate.getTime() - exp.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return total + years;
    }, 0);
  }

  public hasSkill(skillName: string): boolean {
    return this.state.skills.some(skill => 
      skill.name.toLowerCase().includes(skillName.toLowerCase())
    );
  }

  public updateAvailability(status: Candidate['availabilityStatus']): void {
    this.state.availabilityStatus = status;
    this.state.lastUpdated = new Date();
  }

  private validateCandidate(): void {
    if (!this.state.email || !this.state.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (!this.state.firstName || !this.state.lastName) {
      throw new Error('First name and last name are required');
    }
  }

  public toJSON(): Candidate {
    return { ...this.state };
  }
}
