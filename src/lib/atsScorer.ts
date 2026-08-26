import type { ResumeData, AnalysisScores, AnalysisInsight } from './types';

const ACTION_VERB_LIST = [
  'architected', 'developed', 'engineered', 'spearheaded', 'orchestrated',
  'optimized', 'streamlined', 'pioneered', 'accelerated', 'transformed',
  'delivered', 'implemented', 'designed', 'built', 'launched',
  'automated', 'enhanced', 'scaled', 'revamped', 'led',
  'managed', 'created', 'established', 'improved', 'reduced',
  'increased', 'generated', 'analyzed', 'coordinated', 'executed',
  'directed', 'facilitated', 'drove', 'spearheaded', 'cultivated',
];

const ATS_KEYWORDS = [
  'javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql',
  'aws', 'docker', 'kubernetes', 'ci/cd', 'rest', 'api', 'git',
  'agile', 'scrum', 'testing', 'debugging', 'optimization', 'scalability',
  'microservices', 'full-stack', 'frontend', 'backend', 'database',
  'postgresql', 'mongodb', 'redis', 'graphql', 'tailwind', 'supabase',
  'jenkins', 'terraform', 'ansible', 'nginx', 'linux', 'lambda',
  's3', 'ec2', 'github actions', 'jest', 'cypress', 'selenium',
];

export interface FixSuggestion {
  category: string;
  issue: string;
  fix: string;
  severity: 'critical' | 'warning' | 'info';
  pointsRecovered: number;
}

export function calculateATSScore(resume: ResumeData): {
  scores: AnalysisScores;
  insights: AnalysisInsight[];
  breakdown: { category: string; points: number; maxPoints: number; suggestions?: FixSuggestion[] }[];
} {
  const allText = [
    resume.summary,
    ...resume.experience.flatMap(e => [e.description, ...e.bullets]),
    ...resume.projects.map(p => p.description),
    ...resume.achievements,
    resume.skills.join(' '),
  ].join(' ').toLowerCase();

  const hasContact = !!(resume.email && resume.phone);
  const hasSummary = resume.summary.length > 50;
  const experienceCount = resume.experience.length;
  const projectCount = resume.projects.length;
  const skillCount = resume.skills.length;
  const educationCount = resume.education.length;
  const achievementCount = resume.achievements.length;

  const actionVerbCount = ACTION_VERB_LIST.filter(v => allText.includes(v)).length;
  const keywordCount = ATS_KEYWORDS.filter(k => allText.includes(k)).length;
  const hasMetrics = /\d+%|\$\d+|\d+x|\d+\s*(users|customers|requests|projects|people|k|k\+)/.test(allText);
  const weakPhrases = ['responsible for', 'worked on', 'helped with', 'in charge of', 'duties included', 'tasked with'];
  const weakPhraseCount = weakPhrases.filter(p => allText.includes(p)).length;

  const sectionsPresent = [
    hasContact, hasSummary, experienceCount > 0, projectCount > 0,
    skillCount > 0, educationCount > 0, achievementCount > 0,
  ].filter(Boolean).length;

  // ── Build per-category breakdown with fix suggestions ──

  const breakdown: { category: string; points: number; maxPoints: number; suggestions?: FixSuggestion[] }[] = [];

  // 1. Resume Sections (20 pts)
  const sectionSuggestions: FixSuggestion[] = [];
  if (!hasContact) sectionSuggestions.push({ category: 'Sections', issue: 'Missing contact information', fix: 'Add your email and phone number at the top of the resume', severity: 'critical', pointsRecovered: 4 });
  if (!hasSummary) sectionSuggestions.push({ category: 'Sections', issue: 'Missing professional summary', fix: 'Add a 2-3 line summary highlighting your expertise and key achievements', severity: 'critical', pointsRecovered: 3 });
  if (experienceCount === 0) sectionSuggestions.push({ category: 'Sections', issue: 'No work experience listed', fix: 'Add at least 1-2 work experiences with bullet points describing achievements', severity: 'critical', pointsRecovered: 3 });
  if (projectCount === 0) sectionSuggestions.push({ category: 'Sections', issue: 'No projects listed', fix: 'Add 2-3 projects with tech stack and description to showcase practical skills', severity: 'warning', pointsRecovered: 2 });
  if (skillCount === 0) sectionSuggestions.push({ category: 'Sections', issue: 'No skills listed', fix: 'Add 10-15 relevant skills matching your target role', severity: 'critical', pointsRecovered: 3 });
  if (educationCount === 0) sectionSuggestions.push({ category: 'Sections', issue: 'No education listed', fix: 'Add your degree, institution, and graduation year', severity: 'warning', pointsRecovered: 2 });
  if (achievementCount === 0) sectionSuggestions.push({ category: 'Sections', issue: 'No achievements listed', fix: 'Add 2-3 quantified achievements (awards, recognitions, certifications)', severity: 'warning', pointsRecovered: 2 });
  breakdown.push({ category: 'Resume Sections', points: Math.min(20, Math.round((sectionsPresent / 7) * 20)), maxPoints: 20, suggestions: sectionSuggestions });

  // 2. Skills Match (20 pts)
  const skillSuggestions: FixSuggestion[] = [];
  if (skillCount < 10) skillSuggestions.push({ category: 'Skills', issue: `Only ${skillCount} skills listed (recommended: 12+)`, fix: `Add ${12 - skillCount} more industry-relevant skills like Docker, AWS, CI/CD, REST APIs, TypeScript`, severity: 'critical', pointsRecovered: 20 - Math.min(20, Math.round((skillCount / 15) * 20)) });
  else if (skillCount < 15) skillSuggestions.push({ category: 'Skills', issue: `${skillCount} skills — could be expanded`, fix: 'Add 3-5 more specialized skills to reach optimal keyword density', severity: 'info', pointsRecovered: 5 });
  breakdown.push({ category: 'Skills Match', points: Math.min(20, Math.round((skillCount / 15) * 20)), maxPoints: 20, suggestions: skillSuggestions });

  // 3. Action Verbs (10 pts)
  const verbSuggestions: FixSuggestion[] = [];
  if (actionVerbCount < 5) verbSuggestions.push({ category: 'Action Verbs', issue: `Only ${actionVerbCount} strong action verbs found`, fix: 'Start each bullet with power verbs: Developed, Architected, Optimized, Spearheaded, Engineered, Delivered', severity: 'critical', pointsRecovered: 10 - Math.min(10, Math.round((actionVerbCount / 5) * 10)) });
  if (weakPhraseCount > 0) verbSuggestions.push({ category: 'Action Verbs', issue: `Found ${weakPhraseCount} weak phrases (responsible for, worked on, etc.)`, fix: 'Replace weak phrases with strong action verbs. "Responsible for" → "Led", "Worked on" → "Developed"', severity: 'warning', pointsRecovered: 3 });
  breakdown.push({ category: 'Action Verbs', points: Math.min(10, Math.round((actionVerbCount / 5) * 10)) - weakPhraseCount, maxPoints: 10, suggestions: verbSuggestions });

  // 4. Formatting (10 pts)
  const formatSuggestions: FixSuggestion[] = [];
  const emptyBullets = resume.experience.filter(e => e.bullets.length === 0 || e.bullets.every(b => !b.trim())).length;
  if (emptyBullets > 0) formatSuggestions.push({ category: 'Formatting', issue: `${emptyBullets} experience entries with empty bullet points`, fix: 'Add 3-5 bullet points per role describing specific achievements with metrics', severity: 'critical', pointsRecovered: 5 });
  breakdown.push({ category: 'Formatting', points: resume.experience.length > 0 && resume.experience.every(e => e.bullets.filter(b => b.trim()).length >= 2) ? 10 : emptyBullets > 0 ? 3 : 7, maxPoints: 10, suggestions: formatSuggestions });

  // 5. Keyword Density (20 pts)
  const keywordSuggestions: FixSuggestion[] = [];
  if (keywordCount < 10) keywordSuggestions.push({ category: 'Keywords', issue: `Only ${keywordCount} ATS-standard keywords found`, fix: `Add industry keywords: Docker, AWS, CI/CD, Kubernetes, REST APIs, GraphQL, PostgreSQL, Microservices`, severity: 'critical', pointsRecovered: 20 - Math.min(20, Math.round((keywordCount / 10) * 20)) });
  breakdown.push({ category: 'Keyword Density', points: Math.min(20, Math.round((keywordCount / 10) * 20)), maxPoints: 20, suggestions: keywordSuggestions });

  // 6. Experience (10 pts)
  const expSuggestions: FixSuggestion[] = [];
  if (experienceCount === 0) expSuggestions.push({ category: 'Experience', issue: 'No work experience entries', fix: 'Add your work history with role, company, dates, and achievement bullets', severity: 'critical', pointsRecovered: 10 });
  else if (experienceCount === 1) expSuggestions.push({ category: 'Experience', issue: 'Only 1 experience entry', fix: 'Add 2-3 more experiences (internships, freelance, or projects count)', severity: 'info', pointsRecovered: 6 });
  breakdown.push({ category: 'Experience', points: Math.min(10, experienceCount * 4), maxPoints: 10, suggestions: expSuggestions });

  // 7. Education (5 pts)
  breakdown.push({ category: 'Education', points: Math.min(5, educationCount * 2.5), maxPoints: 5, suggestions: educationCount === 0 ? [{ category: 'Education', issue: 'No education entries', fix: 'Add your degree, institution, and graduation year', severity: 'warning', pointsRecovered: 5 }] : [] });

  // 8. Quantified Metrics (5 pts) — replaced Grammar
  const metricSuggestions: FixSuggestion[] = [];
  if (!hasMetrics) metricSuggestions.push({ category: 'Metrics', issue: 'No quantified metrics found (no %, $, or user counts)', fix: 'Add numbers to bullets: "reduced latency by 40%", "served 10,000+ users", "cut costs by $50K"', severity: 'critical', pointsRecovered: 5 });
  breakdown.push({ category: 'Quantified Metrics', points: hasMetrics ? 5 : 0, maxPoints: 5, suggestions: metricSuggestions });

  const total = breakdown.reduce((sum, b) => sum + b.points, 0);

  const scores: AnalysisScores = {
    atsCompatibility: total,
    keywordOptimization: Math.min(100, Math.round((keywordCount / 15) * 100)),
    formatting: breakdown[3].points * 10,
    grammar: 95,
    professionalism: Math.min(100, 50 + actionVerbCount * 8 + (hasMetrics ? 15 : 0) - weakPhraseCount * 5),
    achievements: Math.min(100, achievementCount * 20 + (hasMetrics ? 20 : 0)),
    projects: Math.min(100, projectCount * 25),
    skills: Math.min(100, Math.round((skillCount / 15) * 100)),
    education: Math.min(100, educationCount * 50),
    readability: Math.min(100, 70 + (hasSummary ? 15 : 0) + (hasMetrics ? 10 : 0)),
    actionVerbs: Math.min(100, Math.round((actionVerbCount / 10) * 100)),
    overallImpression: Math.round(total * 0.7 + (hasMetrics ? 15 : 0) + (hasSummary ? 10 : 0)),
  };

  // ── Insights ──
  const insights: AnalysisInsight[] = [];

  if (hasSummary) {
    insights.push({ category: 'Summary', type: 'strength', title: 'Professional Summary Present', detail: 'Your resume includes a professional summary, which helps ATS systems and recruiters quickly understand your profile.' });
  } else {
    insights.push({ category: 'Summary', type: 'weakness', title: 'Missing Professional Summary', detail: 'Add a 2-3 line professional summary at the top. This is critical for ATS parsing and recruiter first impressions.' });
  }

  if (actionVerbCount >= 5) {
    insights.push({ category: 'Language', type: 'strength', title: 'Strong Action Verbs', detail: `Found ${actionVerbCount} action verbs. Your experience descriptions are impactful and engaging.` });
  } else {
    insights.push({ category: 'Language', type: 'weakness', title: 'Insufficient Action Verbs', detail: `Only ${actionVerbCount} action verbs found. Start each bullet with strong verbs like "Developed", "Architected", or "Optimized".` });
  }

  if (weakPhraseCount > 0) {
    insights.push({ category: 'Language', type: 'weakness', title: 'Weak Phrases Detected', detail: `Found ${weakPhraseCount} weak phrases like "responsible for" or "worked on". Replace them with impactful action verbs.` });
  }

  if (hasMetrics) {
    insights.push({ category: 'Impact', type: 'strength', title: 'Quantified Achievements', detail: 'Your resume includes quantified metrics, which significantly boosts credibility and demonstrates measurable impact.' });
  } else {
    insights.push({ category: 'Impact', type: 'suggestion', title: 'Add Quantified Metrics', detail: 'Include numbers, percentages, and timeframes: "reduced load time by 40%" or "served 10,000+ users".' });
  }

  if (skillCount >= 12) {
    insights.push({ category: 'Skills', type: 'strength', title: 'Comprehensive Skills Section', detail: `With ${skillCount} skills listed, your resume has strong keyword density for ATS parsing.` });
  } else {
    insights.push({ category: 'Skills', type: 'weakness', title: 'Expand Skills Section', detail: `Only ${skillCount} skills listed. Add relevant technical skills and tools to improve ATS keyword matching.` });
  }

  if (projectCount >= 2) {
    insights.push({ category: 'Projects', type: 'strength', title: 'Strong Project Portfolio', detail: `With ${projectCount} projects, you demonstrate practical application of your skills.` });
  } else {
    insights.push({ category: 'Projects', type: 'suggestion', title: 'Add More Projects', detail: 'Include at least 2-3 well-documented projects to showcase hands-on experience.' });
  }

  if (keywordCount >= 10) {
    insights.push({ category: 'ATS', type: 'strength', title: 'Excellent Keyword Optimization', detail: `Found ${keywordCount} industry-standard keywords. Your resume is well-optimized for ATS scanning.` });
  } else {
    insights.push({ category: 'ATS', type: 'weakness', title: 'Low Keyword Density', detail: `Only ${keywordCount} ATS-standard keywords found. Include more industry-relevant terms.` });
  }

  return { scores, insights, breakdown };
}

export function calculateJobMatch(
  resume: ResumeData,
  jobDescription: string
): {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strongKeywords: string[];
  weakKeywords: string[];
  experienceMatch: number;
} {
  const jobLower = jobDescription.toLowerCase();
  const resumeLower = resume.skills.join(' ').toLowerCase() +
    ' ' + resume.experience.flatMap(e => [...e.bullets, e.description]).join(' ').toLowerCase() +
    ' ' + resume.projects.map(p => p.description).join(' ').toLowerCase();

  const techTerms = [
    'react', 'next.js', 'nextjs', 'typescript', 'javascript', 'python', 'java',
    'docker', 'aws', 'kubernetes', 'node', 'node.js', 'sql', 'postgresql',
    'mongodb', 'redis', 'graphql', 'rest', 'api', 'ci/cd', 'jenkins',
    'github actions', 'tailwind', 'css', 'html', 'flutter', 'swift', 'kotlin',
    'go', 'rust', 'c++', 'c#', 'ruby', 'rails', 'django', 'flask', 'fastapi',
    'spring', 'express', 'vue', 'angular', 'svelte', 'supabase', 'firebase',
    'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'spark',
    'kafka', 'rabbitmq', 'microservices', 'serverless', 'lambda', 's3', 'ec2',
    'terraform', 'ansible', 'linux', 'bash', 'nginx', 'apache',
    'testing', 'jest', 'cypress', 'selenium', 'junit', 'pytest',
    'agile', 'scrum', 'kanban', 'jira', 'git', 'github', 'gitlab',
  ];

  const matchedSkills = techTerms.filter(t =>
    jobLower.includes(t) && resumeLower.includes(t)
  );

  const missingSkills = techTerms.filter(t =>
    jobLower.includes(t) && !resumeLower.includes(t)
  );

  const jobKeywords = jobDescription
    .toLowerCase()
    .replace(/[^\w\s+#./-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const jobWordFreq: Record<string, number> = {};
  jobKeywords.forEach(w => { jobWordFreq[w] = (jobWordFreq[w] || 0) + 1; });

  const strongKeywords = Object.entries(jobWordFreq)
    .filter(([w, c]) => c >= 2 && resumeLower.includes(w))
    .map(([w]) => w)
    .slice(0, 10);

  const weakKeywords = Object.entries(jobWordFreq)
    .filter(([w]) => !resumeLower.includes(w))
    .map(([w]) => w)
    .filter(w => !['the', 'and', 'for', 'with', 'you', 'our', 'are', 'will', 'have', 'this', 'that'].includes(w))
    .slice(0, 10);

  const totalRelevant = matchedSkills.length + missingSkills.length;
  const matchScore = totalRelevant > 0
    ? Math.round((matchedSkills.length / totalRelevant) * 100)
    : 50;

  const experienceYears = resume.experience.length;
  const experienceMatch = Math.min(100, experienceYears * 25 + (matchedSkills.length * 5));

  return {
    matchScore: Math.min(95, matchScore + 10),
    matchedSkills,
    missingSkills,
    strongKeywords,
    weakKeywords,
    experienceMatch: Math.min(95, experienceMatch),
  };
}
