import type { ResumeData, ExperienceItem, ProjectItem } from './types';

const ACTION_VERBS = [
  'Architected', 'Developed', 'Engineered', 'Spearheaded', 'Orchestrated',
  'Optimized', 'Streamlined', 'Pioneered', 'Accelerated', 'Transformed',
  'Delivered', 'Implemented', 'Designed', 'Built', 'Launched',
  'Automated', 'Enhanced', 'Scaled', 'Revamped', 'Cultivated',
  'Established', 'Synthesized', 'Catalyzed', 'Mobilized', 'Galvanized',
  'Directed', 'Managed', 'Coordinated', 'Executed', 'Facilitated',
];

const IMPACT_TEMPLATES = [
  'reducing {metric} by {percent}%',
  'improving {metric} by {percent}%',
  'increasing {metric} by {percent}%',
  'saving {percent}% in {metric}',
  'boosting {metric} by {percent}%',
  'cutting {metric} time by {percent}%',
  'growing {metric} by {percent}%',
  'achieving {percent}% improvement in {metric}',
  'serving {percent}K+ {metric}',
  'delivering {percent}% faster {metric}',
];

const TECH_KEYWORDS: Record<string, string[]> = {
  website: ['full-stack', 'responsive', 'web application', 'user interface'],
  app: ['cross-platform', 'mobile application', 'user experience'],
  api: ['RESTful API', 'backend service', 'data pipeline'],
  database: ['database schema', 'data model', 'query optimization'],
  ml: ['machine learning model', 'predictive analytics', 'neural network'],
  ai: ['AI-powered', 'intelligent system', 'automated workflow'],
  crm: ['CRM platform', 'customer management', 'client relationship'],
  hospital: ['Hospital Management System', 'patient care', 'healthcare workflow'],
  ecommerce: ['e-commerce platform', 'checkout flow', 'product catalog'],
  dashboard: ['analytics dashboard', 'data visualization', 'real-time metrics'],
  chatbot: ['conversational AI', 'natural language', 'automated support'],
  game: ['interactive game', 'game engine', 'real-time rendering'],
};

const WEAK_PHRASES: Record<string, string> = {
  'responsible for': 'Led',
  'worked on': 'Developed',
  'helped with': 'Collaborated on',
  'in charge of': 'Directed',
  'made': 'Developed',
  'did': 'Executed',
  'used': 'Leveraged',
  'tasked with': 'Spearheaded',
  'part of': 'Contributed to',
  'involved in': 'Drove',
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPercent(): number {
  return Math.floor(Math.random() * 45) + 25;
}

export function enhanceBulletPoint(input: string): string {
  let result = input.trim();
  if (!result) return result;

  const lower = result.toLowerCase();

  for (const [weak, strong] of Object.entries(WEAK_PHRASES)) {
    const regex = new RegExp(`\\b${weak}\\b`, 'gi');
    result = result.replace(regex, strong);
  }

  if (!ACTION_VERBS.some(v => result.toLowerCase().startsWith(v.toLowerCase()))) {
    const verb = randomFrom(ACTION_VERBS);
    result = result.charAt(0).toLowerCase() + result.slice(1);
    result = `${verb} ${result}`;
  }

  const techMatch = Object.entries(TECH_KEYWORDS).find(([key]) =>
    lower.includes(key)
  );

  if (techMatch && !result.includes(techMatch[1][0])) {
    const techPhrase = randomFrom(techMatch[1]);
    const techWords = ['React', 'TypeScript', 'Node.js', 'Supabase', 'Next.js', 'Python', 'AWS', 'Docker'];
    const tech = randomFrom(techWords);
    result = result.replace(/^(developed|built|made|created|engineered|designed)\s/i, `$1 `);
    if (!result.includes(tech)) {
      result = result.replace(/^(\w+)\s/, `$1 ${techPhrase} using ${tech} `);
    }
  }

  if (!/\d+%/.test(result)) {
    const metric = randomFrom(['manual effort', 'processing time', 'operational cost', 'response time', 'user engagement', 'system latency', 'deployment time', 'load time']);
    const percent = randomPercent();
    const template = randomFrom(IMPACT_TEMPLATES)
      .replace('{metric}', metric)
      .replace('{percent}', String(percent));
    result = `${result.replace(/\.$/, '')} that ${template}.`;
  }

  if (!result.endsWith('.')) result += '.';

  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function generateSummary(resume: ResumeData): string {
  const skills = resume.skills.slice(0, 4);
  const topSkill = skills[0] || 'software development';
  const yearsExp = resume.experience.length;
  const projectCount = resume.projects.length;

  const templates = [
    `Results-driven ${resume.title || 'professional'} with ${yearsExp}+ years of experience specializing in ${skills.join(', ') || topSkill}. Proven track record of delivering ${projectCount}+ high-impact projects with measurable outcomes. Adept at leveraging ${topSkill} to architect scalable solutions that drive operational excellence and business growth.`,
    `Dynamic ${resume.title || 'software engineer'} passionate about building innovative solutions using ${skills.join(', ') || topSkill}. ${yearsExp > 0 ? `With ${yearsExp}+ years of hands-on experience` : 'As an emerging talent'}, delivered ${projectCount}+ projects that optimized workflows and enhanced user experiences. Seeking to contribute technical acumen and problem-solving prowess to a forward-thinking organization.`,
    `Accomplished ${resume.title || 'professional'} with expertise in ${skills.join(', ') || topSkill}. Demonstrated ability to engineer robust systems across ${projectCount}+ projects, consistently achieving performance improvements and scalable architecture. Committed to continuous learning and delivering excellence through clean, maintainable code and best practices.`,
  ];

  return randomFrom(templates);
}

// ── ATS Auto-Fix: applies all enhancements to push score above 90 ──

export function fixResumeForATS(resume: ResumeData): { fixed: ResumeData; changes: string[] } {
  const changes: string[] = [];
  let fixed = { ...resume };

  // 1. Fix summary
  if (!fixed.summary || fixed.summary.length < 50) {
    fixed.summary = generateSummary(fixed);
    changes.push('Generated a professional summary with keywords and impact statements');
  } else if (!/\d/.test(fixed.summary)) {
    const enhanced = fixed.summary.trim();
    if (!enhanced.includes('%')) {
      fixed.summary = `${enhanced.replace(/\.$/, '')}, achieving 35% improvement in operational efficiency and delivering measurable results across ${fixed.projects.length || 3}+ key initiatives.`;
      changes.push('Added quantified metrics to professional summary');
    }
  }

  // 2. Fix experience bullets — enhance ALL bullets
  fixed.experience = fixed.experience.map(exp => {
    const enhancedBullets = exp.bullets.map(b => {
      if (!b.trim()) return b;
      const enhanced = enhanceBulletPoint(b);
      if (enhanced !== b) changes.push(`Enhanced: "${b.slice(0, 40)}..." → stronger action verb + metrics`);
      return enhanced;
    });
    return { ...exp, bullets: enhancedBullets };
  });

  // 3. Fix project descriptions
  fixed.projects = fixed.projects.map(p => {
    if (!p.description.trim()) return p;
    const enhanced = enhanceBulletPoint(p.description);
    if (enhanced !== p.description) changes.push(`Enhanced project "${p.name}" description with impact metrics`);
    return { ...p, description: enhanced };
  });

  // 4. Ensure enough skills
  const recommendedSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Git', 'REST APIs', 'SQL', 'PostgreSQL', 'CI/CD', 'Agile', 'Problem Solving'];
  const currentSkillLower = fixed.skills.map(s => s.toLowerCase());
  const missing = recommendedSkills.filter(s => !currentSkillLower.includes(s.toLowerCase()));
  if (fixed.skills.length < 12) {
    const toAdd = missing.slice(0, 12 - fixed.skills.length);
    fixed.skills = [...fixed.skills, ...toAdd];
    if (toAdd.length > 0) changes.push(`Added ${toAdd.length} ATS-optimized keywords to skills section`);
  }

  // 5. Ensure achievements have metrics
  fixed.achievements = fixed.achievements.map(a => {
    if (!a.trim()) return a;
    if (!/\d/.test(a)) {
      const enhanced = enhanceBulletPoint(a);
      changes.push(`Added quantified metrics to achievement: "${a.slice(0, 30)}..."`);
      return enhanced;
    }
    return a;
  });

  // 6. Ensure at least 2 achievements
  if (fixed.achievements.length < 2) {
    const templates = [
      'Delivered 40% improvement in system performance through strategic optimization initiatives',
      'Recognized as top performer among 50+ team members for consistent delivery excellence',
      'Reduced operational costs by 30% through process automation and efficiency improvements',
    ];
    while (fixed.achievements.length < 2) {
      fixed.achievements.push(randomFrom(templates));
    }
    changes.push('Added quantified achievements to boost ATS keyword density');
  }

  // 7. Ensure at least 2 experiences (don't fabricate, but note if missing)
  if (fixed.experience.length === 0) {
    changes.push('Warning: No work experience found. Add at least one role for a strong ATS score.');
  }

  // 8. Ensure education exists
  if (fixed.education.length === 0) {
    changes.push('Warning: No education entries. Add your degree for a complete ATS profile.');
  }

  return { fixed, changes };
}

export function generateAchievement(input: string): string {
  const enhanced = enhanceBulletPoint(input);
  return enhanced;
}

export function generateCoverLetter(
  resume: ResumeData,
  company: string,
  position: string
): string {
  const topSkills = resume.skills.slice(0, 5).join(', ');
  const summary = resume.summary || generateSummary(resume);

  return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${position} position at ${company}. With a strong foundation in ${topSkills} and a proven track record of delivering impactful solutions, I am confident in my ability to contribute meaningfully to your team.

${summary}

Throughout my career, I have consistently demonstrated the ability to tackle complex challenges head-on. My work on ${resume.projects[0]?.name || 'key initiatives'} showcases my commitment to excellence and innovation. I am particularly drawn to ${company}'s reputation for pushing boundaries and fostering a culture of continuous improvement.

I would welcome the opportunity to discuss how my technical proficiencies and collaborative approach align with ${company}'s strategic objectives. Thank you for considering my application — I look forward to the possibility of contributing to your team's continued success.

Sincerely,
${resume.name}`;
}

export function generateInterviewQuestions(resume: ResumeData): {
  category: 'technical' | 'hr' | 'behavioral' | 'company';
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedApproach: string;
}[] {
  const topSkill = resume.skills[0] || 'software development';
  const secondSkill = resume.skills[1] || 'databases';

  return [
    {
      category: 'technical',
      question: `Explain your approach to designing a scalable architecture using ${topSkill}. What trade-offs do you consider?`,
      difficulty: 'hard',
      suggestedApproach: 'Discuss horizontal vs vertical scaling, caching strategies, database sharding, and monitoring. Reference a specific project where you applied these concepts.',
    },
    {
      category: 'technical',
      question: `How would you optimize a slow query in ${secondSkill}? Walk me through your debugging process.`,
      difficulty: 'medium',
      suggestedApproach: 'Start with EXPLAIN plans, identify full table scans, discuss indexing strategy, query rewriting, and denormalization when appropriate.',
    },
    {
      category: 'technical',
      question: `Describe the system design for ${resume.projects[0]?.name || 'your most complex project'}. What would you do differently?`,
      difficulty: 'hard',
      suggestedApproach: 'Cover the full stack: data flow, API design, authentication, caching, error handling. Acknowledge what you learned and would improve.',
    },
    {
      category: 'hr',
      question: 'Tell me about yourself and what drew you to this role.',
      difficulty: 'easy',
      suggestedApproach: 'Present a concise narrative: current state → key achievements → why this role. Keep it under 90 seconds and tie to the job description.',
    },
    {
      category: 'hr',
      question: 'Where do you see yourself in five years, and how does this position align with that vision?',
      difficulty: 'medium',
      suggestedApproach: 'Show growth trajectory without sounding unrealistic. Connect the role\'s opportunities to your skill development goals.',
    },
    {
      category: 'behavioral',
      question: 'Describe a time you faced a significant technical challenge. How did you overcome it?',
      difficulty: 'medium',
      suggestedApproach: 'Use STAR format: Situation, Task, Action, Result. Quantify the impact and highlight your problem-solving methodology.',
    },
    {
      category: 'behavioral',
      question: 'Tell me about a conflict within your team and how you resolved it.',
      difficulty: 'medium',
      suggestedApproach: 'Focus on communication, empathy, and compromise. Avoid blaming others — emphasize what you learned about collaboration.',
    },
    {
      category: 'behavioral',
      question: 'Share an example of a project that failed. What did you learn?',
      difficulty: 'hard',
      suggestedApproach: 'Be honest but constructive. Show self-awareness, what you changed in your process, and how you applied those lessons subsequently.',
    },
    {
      category: 'company',
      question: `Why do you want to join our company specifically, and what do you know about our product?`,
      difficulty: 'medium',
      suggestedApproach: 'Research the company\'s mission, recent news, and product. Connect your skills to their specific challenges and show genuine enthusiasm.',
    },
    {
      category: 'company',
      question: 'How would you improve one of our existing features or products?',
      difficulty: 'hard',
      suggestedApproach: 'Demonstrate product thinking. Suggest a concrete improvement with reasoning, acknowledging constraints. Show you\'ve used or studied the product.',
    },
  ];
}

export function suggestCareers(resume: ResumeData): {
  role: string;
  match: number;
  reason: string;
  salaryRange: string;
}[] {
  const skills = resume.skills.map(s => s.toLowerCase());
  const careers: { role: string; match: number; reason: string; salaryRange: string; keywords: string[] }[] = [
    { role: 'Full-Stack Engineer', match: 0, reason: '', salaryRange: '$90K–$160K', keywords: ['react', 'node', 'javascript', 'typescript', 'full', 'stack', 'web'] },
    { role: 'Backend Engineer', match: 0, reason: '', salaryRange: '$85K–$155K', keywords: ['python', 'java', 'node', 'api', 'database', 'sql', 'backend', 'server'] },
    { role: 'AI / ML Engineer', match: 0, reason: '', salaryRange: '$110K–$200K', keywords: ['python', 'ml', 'ai', 'machine learning', 'tensorflow', 'pytorch', 'nlp', 'data'] },
    { role: 'Data Scientist', match: 0, reason: '', salaryRange: '$100K–$180K', keywords: ['python', 'data', 'statistics', 'pandas', 'numpy', 'analysis', 'sql', 'r'] },
    { role: 'DevOps Engineer', match: 0, reason: '', salaryRange: '$95K–$170K', keywords: ['docker', 'kubernetes', 'aws', 'ci/cd', 'jenkins', 'terraform', 'linux', 'cloud'] },
    { role: 'Frontend Engineer', match: 0, reason: '', salaryRange: '$75K–$140K', keywords: ['react', 'javascript', 'css', 'html', 'tailwind', 'ui', 'frontend', 'design'] },
    { role: 'Mobile App Developer', match: 0, reason: '', salaryRange: '$80K–$150K', keywords: ['flutter', 'react native', 'android', 'ios', 'kotlin', 'swift', 'mobile'] },
    { role: 'Cloud Solutions Architect', match: 0, reason: '', salaryRange: '$130K–$250K', keywords: ['aws', 'azure', 'gcp', 'cloud', 'architecture', 'kubernetes', 'terraform'] },
  ];

  return careers
    .map(career => {
      const matches = career.keywords.filter(k => skills.some(s => s.includes(k) || k.includes(s)));
      career.match = Math.min(95, 40 + matches.length * 12);
      career.reason = matches.length > 0
        ? `Your skills in ${matches.slice(0, 3).join(', ')} align strongly with this role.`
        : 'Consider developing skills in this area to expand your career options.';
      return career;
    })
    .sort((a, b) => b.match - a.match);
}

export function suggestMissingSkills(resume: ResumeData): string[] {
  const expectedByDomain: Record<string, string[]> = {
    'web': ['Docker', 'AWS', 'CI/CD', 'Testing', 'REST APIs', 'GitHub Actions', 'TypeScript', 'GraphQL'],
    'backend': ['Docker', 'Kubernetes', 'AWS', 'Redis', 'Microservices', 'API Design', 'Message Queues', 'PostgreSQL'],
    'frontend': ['TypeScript', 'Testing', 'CI/CD', 'GraphQL', 'Webpack', 'Accessibility', 'Performance', 'SEO'],
    'data': ['Docker', 'AWS', 'Airflow', 'Spark', 'MLflow', 'Statistics', 'SQL', 'Tableau'],
    'general': ['Docker', 'AWS', 'CI/CD', 'Testing', 'REST APIs', 'GitHub Actions', 'TypeScript', 'System Design'],
  };

  const skills = resume.skills.map(s => s.toLowerCase());
  const has = skills.join(' ');

  let domain = 'general';
  if (has.includes('react') || has.includes('frontend') || has.includes('css')) domain = 'frontend';
  else if (has.includes('node') || has.includes('api') || has.includes('backend') || has.includes('sql')) domain = 'backend';
  else if (has.includes('python') || has.includes('ml') || has.includes('data')) domain = 'data';
  else if (has.includes('web') || has.includes('javascript')) domain = 'web';

  return expectedByDomain[domain].filter(skill =>
    !skills.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))
  );
}

export function rewriteResumeStyle(
  text: string,
  style: 'professional' | 'executive' | 'google' | 'amazon' | 'microsoft'
): string {
  const styles: Record<string, (t: string) => string> = {
    professional: (t) => enhanceBulletPoint(t),
    executive: (t) => {
      let r = enhanceBulletPoint(t);
      r = r.replace(/^Developed/, 'Directed');
      r = r.replace(/^Built/, 'Architected');
      r = r.replace(/^Implemented/, 'Orchestrated');
      return r;
    },
    google: (t) => {
      let r = enhanceBulletPoint(t);
      if (!r.includes('scale')) r = r.replace(/\.$/, ' at Google scale.');
      return r;
    },
    amazon: (t) => {
      let r = enhanceBulletPoint(t);
      if (!r.includes('customer')) r = r.replace(/\.$/, ' improving customer experience.');
      return r;
    },
    microsoft: (t) => {
      let r = enhanceBulletPoint(t);
      if (!r.includes('enterprise')) r = r.replace(/\.$/, ' for enterprise-grade deployments.');
      return r;
    },
  };

  return styles[style]?.(text) || enhanceBulletPoint(text);
}

export function generateProjectIdeas(resume: ResumeData): {
  name: string;
  description: string;
  techStack: string[];
  difficulty: string;
}[] {
  const topSkill = resume.skills[0]?.toLowerCase() || 'javascript';
  const isWeb = topSkill.includes('react') || topSkill.includes('javascript') || topSkill.includes('web');

  return [
    {
      name: 'AI-Powered Knowledge Base',
      description: 'Build an intelligent knowledge management system with semantic search, auto-categorization, and collaborative editing. Integrate vector embeddings for contextual retrieval.',
      techStack: ['React', 'TypeScript', 'Supabase', 'OpenAI API', 'pgvector'],
      difficulty: 'Advanced',
    },
    {
      name: 'Real-Time Collaborative Whiteboard',
      description: 'Create a multiplayer whiteboard application with live cursor tracking, shape drawing, and conflict-free synchronization using CRDTs.',
      techStack: ['React', 'WebSocket', 'Canvas API', 'Yjs', 'Supabase'],
      difficulty: 'Advanced',
    },
    {
      name: 'Developer Portfolio CMS',
      description: 'Engineer a headless CMS for developers to manage project showcases, blog posts, and analytics with a beautiful, customizable interface.',
      techStack: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Recharts'],
      difficulty: 'Intermediate',
    },
    {
      name: 'Smart Expense Tracker',
      description: 'Develop a personal finance dashboard with automatic categorization, budget forecasting, and visual spending insights powered by ML.',
      techStack: ['React', 'Python', 'FastAPI', 'PostgreSQL', 'scikit-learn'],
      difficulty: 'Intermediate',
    },
    {
      name: 'Code Review Automation Bot',
      description: 'Build a GitHub bot that analyzes pull requests, suggests improvements, and auto-assigns reviewers based on code ownership and expertise.',
      techStack: ['TypeScript', 'GitHub API', 'OpenAI API', 'Supabase Edge Functions'],
      difficulty: 'Advanced',
    },
  ];
}

export function generateSkillRoadmap(missingSkills: string[]): {
  skill: string;
  steps: { phase: string; action: string }[];
}[] {
  const roadmapTemplates: Record<string, { phase: string; action: string }[]> = {
    Docker: [
      { phase: 'Fundamentals', action: 'Learn containerization concepts, Dockerfile syntax, and image layers' },
      { phase: 'Hands-On', action: 'Containerize an existing project and publish to Docker Hub' },
      { phase: 'Advanced', action: 'Master Docker Compose for multi-service orchestration' },
      { phase: 'Project', action: 'Deploy a microservices architecture using Docker Swarm' },
      { phase: 'Certificate', action: 'Earn the Docker Certified Associate certification' },
    ],
    AWS: [
      { phase: 'Fundamentals', action: 'Study core services: EC2, S3, RDS, Lambda, IAM' },
      { phase: 'Hands-On', action: 'Deploy a web application on EC2 with an RDS backend' },
      { phase: 'Advanced', action: 'Implement serverless architecture with Lambda + API Gateway' },
      { phase: 'Project', action: 'Build a scalable, auto-scaling infrastructure with CloudFormation' },
      { phase: 'Certificate', action: 'Earn the AWS Solutions Architect Associate certification' },
    ],
    'CI/CD': [
      { phase: 'Fundamentals', action: 'Understand continuous integration and deployment pipelines' },
      { phase: 'Hands-On', action: 'Set up GitHub Actions for automated testing and deployment' },
      { phase: 'Advanced', action: 'Implement blue-green deployments and canary releases' },
      { phase: 'Project', action: 'Build a complete CI/CD pipeline with automated rollbacks' },
      { phase: 'Certificate', action: 'Complete the GitHub Actions certification or Jenkins certification' },
    ],
    Testing: [
      { phase: 'Fundamentals', action: 'Learn unit, integration, and end-to-end testing concepts' },
      { phase: 'Hands-On', action: 'Write comprehensive tests using Jest and React Testing Library' },
      { phase: 'Advanced', action: 'Master test-driven development and behavior-driven development' },
      { phase: 'Project', action: 'Achieve 90%+ code coverage on an existing project' },
      { phase: 'Certificate', action: 'Earn the ISTQB Foundation Level certification' },
    ],
  };

  return missingSkills.slice(0, 5).map(skill => ({
    skill,
    steps: roadmapTemplates[skill] || [
      { phase: 'Fundamentals', action: `Study core concepts of ${skill}` },
      { phase: 'Hands-On', action: `Build a small project using ${skill}` },
      { phase: 'Advanced', action: `Master advanced patterns and best practices for ${skill}` },
      { phase: 'Project', action: `Integrate ${skill} into a production-grade application` },
      { phase: 'Certificate', action: `Earn a recognized certification in ${skill}` },
    ],
  }));
}

export function extractKeywords(text: string): { word: string; count: number }[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'as', 'from', 'my', 'your', 'our', 'their']);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}
