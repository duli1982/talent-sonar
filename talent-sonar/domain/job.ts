export interface JobRequirement {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
  weight: number; // 1-10 importance scale
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: JobRequirement[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  isInternal: boolean;
  postedDate: Date;
  closingDate?: Date;
  status: 'open' | 'closed' | 'on-hold';
  hiringManager: string;
  embedding?: number[];
}

export class JobEntity {
  private state: Job;

  constructor(job: Job) {
    this.state = { ...job };
    this.validateJob();
  }

  get id(): string { return this.state.id; }
  get title(): string { return this.state.title; }
  get department(): string { return this.state.department; }
  get requirements(): JobRequirement[] { return [...this.state.requirements]; }
  get isInternal(): boolean { return this.state.isInternal; }
  get status(): string { return this.state.status; }

  public getRequiredSkills(): JobRequirement[] {
    return this.state.requirements.filter(req => req.required);
  }

  public getPreferredSkills(): JobRequirement[] {
    return this.state.requirements.filter(req => !req.required);
  }

  public getSkillWeight(skillName: string): number {
    const requirement = this.state.requirements.find(req => 
      req.skill.toLowerCase() === skillName.toLowerCase()
    );
    return requirement?.weight || 0;
  }

  public isActive(): boolean {
    const now = new Date();
    return this.state.status === 'open' && 
           (!this.state.closingDate || this.state.closingDate > now);
  }

  public updateStatus(status: Job['status']): void {
    this.state.status = status;
  }

  private validateJob(): void {
    if (!this.state.title || this.state.title.trim().length === 0) {
      throw new Error('Job title is required');
    }
    if (!this.state.department || this.state.department.trim().length === 0) {
      throw new Error('Department is required');
    }
    if (this.state.requirements.length === 0) {
      throw new Error('At least one job requirement is needed');
    }
  }

  public toJSON(): Job {
    return { ...this.state };
  }
}
