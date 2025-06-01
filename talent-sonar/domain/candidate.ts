export type CandidateSource = 'employee' | 'silver_medalist';

export interface CandidateProfile {
  id: string;
  name: string;
  summary: string;        // Skills and experience
  source: CandidateSource;
  currentRole?: string;
  metadata?: Record<string, any>;
}
