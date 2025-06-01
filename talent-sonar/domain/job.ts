export interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  requiredExperience: number; // Minimum years of experience
  location: string;
  company: string;
}
