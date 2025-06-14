// Service for identifying "hidden gem" candidates and employees

import { Candidate, Employee, Job } from '../../domain';

export class TalentAnalysisService {
  // Identify profiles that match 70%+ but don't have the job title in their experience
  static findHiddenGems(profiles: (Candidate | Employee)[], job: Job): (Candidate | Employee)[] {
    return profiles.filter(profile => {
      const skillOverlap = profile.skills.filter((s: string) => job.skills.includes(s)).length;
      const isHiddenGem = skillOverlap / job.skills.length >= 0.7 &&
        !profile.experience?.some((exp: string) => exp.toLowerCase().includes(job.title.toLowerCase()));
      return isHiddenGem;
    });
  }
}
