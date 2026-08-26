export interface ResumeData {
  photoUrl?: string;
  photoPath?: string;
  photoUpdatedAt?: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  skills: string[];
  achievements: string[];
  certificates: string[];
  languages: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  techStack: string[];
  description: string;
  link: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface AnalysisScores {
  atsCompatibility: number;
  keywordOptimization: number;
  formatting: number;
  grammar: number;
  professionalism: number;
  achievements: number;
  projects: number;
  skills: number;
  education: number;
  readability: number;
  actionVerbs: number;
  overallImpression: number;
}

export interface AnalysisInsight {
  category: string;
  type: 'strength' | 'weakness' | 'suggestion';
  title: string;
  detail: string;
}

export interface JobMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strongKeywords: string[];
  weakKeywords: string[];
  experienceMatch: number;
}

export interface CoverLetterData {
  company: string;
  position: string;
  content: string;
}

export interface InterviewQuestion {
  category: 'technical' | 'hr' | 'behavioral' | 'company';
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedApproach: string;
}
