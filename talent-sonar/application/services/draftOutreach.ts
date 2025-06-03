import { MatchEntity, Match } from '../../domain/match';
import { CandidateEntity, Candidate } from '../../domain/candidate';
import { JobEntity, Job } from '../../domain/job';
import { VectorDbService } from '../../infrastructure/data/vectorDb';
import { GeminiClient } from '../../infrastructure/ai/geminiClient';

export interface OutreachMessage {
  id: string;
  matchId: string;
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'enthusiastic';
  personalizationElements: string[];
  createdAt: Date;
}

export interface DraftOutreachRequest {
  matchId: string;
  tone?: 'professional' | 'friendly' | 'enthusiastic';
  includeCompensation?: boolean;
  customMessage?: string;
}

export interface DraftOutreachResponse {
  message: OutreachMessage;
  alternativeSubjects: string[];
}

export class DraftOutreachService {
  constructor(
    private vectorDb: VectorDbService,
    private geminiClient: GeminiClient
  ) {}

  async execute(request: DraftOutreachRequest): Promise<DraftOutreachResponse> {
    try {
      // Get match details
      const match = await this.vectorDb.getMatch(request.matchId);
      if (!match) {
        throw new Error(`Match with ID ${request.matchId} not found`);
      }

      const candidate = await this.vectorDb.getCandidate(match.candidateId);
      const job = await this.vectorDb.getJob(match.jobId);

      if (!candidate || !job) {
        throw new Error('Candidate or Job not found for this match');
      }

      const matchEntity = new MatchEntity(match);
      const candidateEntity = new CandidateEntity(candidate);
      const jobEntity = new JobEntity(job);

      // Generate personalized outreach message
      const message = await this.generateOutreachMessage(
        matchEntity,
        candidateEntity,
        jobEntity,
        request
      );

      // Generate alternative subjects
      const alternativeSubjects = await this.generateAlternativeSubjects(
        candidateEntity,
        jobEntity,
        request.tone || 'professional'
      );

      return {
        message,
        alternativeSubjects
      };

    } catch (error) {
      throw new Error(`Failed to draft outreach: ${error.message}`);
    }
  }

  private async generateOutreachMessage(
    match: MatchEntity,
    candidate: CandidateEntity,
    job: JobEntity,
    request: DraftOutreachRequest
  ): Promise<OutreachMessage> {
    const tone = request.tone || 'professional';
    const personalizationElements = this.extractPersonalizationElements(match, candidate, job);
    
    const subject = await this.generateSubject(candidate, job, tone);
    const body = await this.generateBody(match, candidate, job, request);

    return {
      id: `outreach_${match.id}_${Date.now()}`,
      matchId: match.id,
      subject,
      body,
      tone,
      personalizationElements,
      createdAt: new Date()
    };
  }

  private async generateSubject(
    candidate: CandidateEntity,
    job: JobEntity,
    tone: string
  ): Promise<string> {
    const isInternal = candidate.isInternal;
    
    const subjectPrompts = {
      professional: {
        internal: `Professional opportunity: ${job.title} role in ${job.department}`,
        external: `Exciting opportunity: ${job.title} position at our company`
      },
      friendly: {
        internal: `Hi ${candidate.fullName.split(' ')[0]}, interesting opportunity in ${job.department}`,
        external: `Hi ${candidate.fullName.split(' ')[0]}, we'd love to reconnect about a ${job.title} role`
      },
      enthusiastic: {
        internal: `🚀 Amazing ${job.title} opportunity perfect for your skills!`,
        external: `🌟 Your dream ${job.title} role awaits - let's chat!`
      }
    };

    const baseSubject = subjectPrompts[tone][isInternal ? 'internal' : 'external'];
    
    try {
      const prompt = `
        Create a compelling email subject line for this scenario:
        - Candidate: ${candidate.fullName} (${isInternal ? 'Internal' : 'External'})
        - Job: ${job.title}
        - Tone: ${tone}
        - Base idea: ${baseSubject}
        
        Make it personalized and engaging. Return only the subject line.
      `;
      
      return await this.geminiClient.generateText(prompt);
    } catch (error) {
      return baseSubject;
    }
  }

  private async generateBody(
    match: MatchEntity,
    candidate: CandidateEntity,
    job: JobEntity,
    request: DraftOutreachRequest
  ): Promise<string> {
    const isInternal = candidate.isInternal;
    const matchedSkills = match.getMatchedSkills().map(s => s.skillName).slice(0, 3);
    const firstName = candidate.fullName.split(' ')[0];
    
    const prompt = `
      Write a personalized outreach email for this candidate:
      
      CANDIDATE INFO:
      - Name: ${candidate.fullName}
      - Type: ${isInternal ? 'Internal Employee' : 'External Candidate'}
      - Current Role: ${candidate.toJSON().currentRole || 'Not specified'}
      - Department: ${candidate.toJSON().department || 'Not specified'}
      - Top Skills: ${matchedSkills.join(', ')}
      
      JOB INFO:
      - Title: ${job.title}
      - Department: ${job.department}
      - Location: ${job.toJSON().location}
      - Type: ${isInternal ? 'Internal Transfer/Promotion' : 'New Position'}
      
      MATCH INFO:
      - Overall Score: ${Math.round(match.overallScore * 100)}%
      - Reasoning: ${match.reasoning}
      
      REQUIREMENTS:
      - Tone: ${request.tone || 'professional'}
      - Length: 150-200 words
      - Include specific skills match
      - ${isInternal ? 'Mention career growth opportunity' : 'Reference previous interaction if external'}
      - ${request.includeCompensation ? 'Mention competitive compensation' : 'Do not mention compensation'}
      - End with clear call to action
      
      ${request.customMessage ? `CUSTOM MESSAGE TO INCLUDE: ${request.customMessage}` : ''}
      
      Write the email body only (no subject line).
    `;

    try {
      return await this.geminiClient.generateText(prompt);
    } catch (error) {
      return this.generateFallbackBody(match, candidate, job, request);
    }
  }

  private generateFallbackBody(
    match: MatchEntity,
    candidate: CandidateEntity,
    job: JobEntity,
    request: DraftOutreachRequest
  ): string {
    const firstName = candidate.fullName.split(' ')[0];
    const isInternal = candidate.isInternal;
    const matchedSkills = match.getMatchedSkills().map(s => s.skillName).slice(0, 3);

    if (isInternal) {
      return `Hi ${firstName},

I hope this message finds you well. I wanted to reach out about an exciting ${job.title} opportunity in our ${job.department} department that I believe aligns perfectly with your skills and career aspirations.

Based on your background, particularly your expertise in ${matchedSkills.join(', ')}, you would be an excellent fit for this role. This position offers a great opportunity for career growth and the chance to take on new challenges.

${request.customMessage || ''}

I'd love to discuss this opportunity with you in more detail. Are you available for a brief conversation this week?

Best regards,
[Your Name]`;
    } else {
      return `Hi ${firstName},

I hope you're doing well. We were impressed by your background when we previously connected, and I wanted to reach out about a ${job.title} position that has opened up at our company.

Your experience with ${matchedSkills.join(', ')} makes you a strong candidate for this role. We believe this could be an excellent opportunity that aligns with your career goals.

${request.customMessage || ''}

I'd love to reconnect and discuss how this role might be a great fit for you. Would you be open to a brief conversation?

Looking forward to hearing from you,
[Your Name]`;
    }
  }

  private async generateAlternativeSubjects(
    candidate: CandidateEntity,
    job: JobEntity,
    tone: string
  ): Promise<string[]> {
    const prompt = `
      Generate 3 alternative email subject lines for:
      - Candidate: ${candidate.fullName} (${candidate.isInternal ? 'Internal' : 'External'})
      - Job: ${job.title}
      - Tone: ${tone}
      
      Make each subject line unique and engaging. Return as a simple list.
    `;

    try {
      const response = await this.geminiClient.generateText(prompt);
      return response.split('\n').filter(line => line.trim()).slice(0, 3);
    } catch (error) {
      return [
        `${job.title} opportunity - perfect match for your skills`,
        `Let's discuss this ${job.title} role`,
        `Your expertise + our ${job.title} position = great fit`
      ];
    }
  }

  private extractPersonalizationElements(
    match: MatchEntity,
    candidate: CandidateEntity,
    job: JobEntity
  ): string[] {
    const elements: string[] = [];
    
    // Add matched skills
    const matchedSkills = match.getMatchedSkills().map(s => s.skillName);
    if (matchedSkills.length > 0) {
      elements.push(`Matched skills: ${matchedSkills.slice(0, 3).join(', ')}`);
    }
    
    // Add experience relevance
    if (candidate.getTotalExperienceYears() > 0) {
      elements.push(`${candidate.getTotalExperienceYears().toFixed(1)} years experience`);
    }
    
    // Add internal/external context
    elements.push(candidate.isInternal ? 'Internal candidate' : 'External candidate');
    
    // Add location match
    const candidateLocation = candidate.toJSON().location;
    const jobLocation = job.toJSON().location;
    if (candidateLocation === jobLocation) {
      elements.push('Location match');
    }
    
    return elements;
  }
}
