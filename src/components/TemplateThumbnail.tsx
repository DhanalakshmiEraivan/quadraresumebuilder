import type { ResumeData } from '@/lib/types';
import type { TemplateDef } from '@/lib/templateData';
import { ResumeRenderer } from '@/components/ResumeRenderer';

const SAMPLE_DATA: ResumeData = {
  photoUrl: '',
  name: 'Alex Morgan',
  title: 'Senior Product Designer',
  email: 'alex.morgan@email.com',
  phone: '+1 555 234 5678',
  location: 'San Francisco, CA',
  website: 'alexmorgan.dev',
  linkedin: 'linkedin.com/in/alexmorgan',

  summary:
    'Product designer focused on creating clear, accessible and high-converting digital experiences across web and mobile products.',

  experience: [
    {
      id: 'exp-1',
      role: 'Senior Product Designer',
      company: 'Northstar Technologies',
      startDate: '2022',
      endDate: 'Present',
      description: '',
      bullets: [
        'Led end-to-end product design for a SaaS platform used by 250K+ users.',
        'Improved onboarding completion by 32% through research-driven redesign.',
        'Built a reusable design system used across 12 product teams.',
      ],
    },
    {
      id: 'exp-2',
      role: 'Product Designer',
      company: 'Vertex Labs',
      startDate: '2019',
      endDate: '2022',
      description: '',
      bullets: [
        'Designed web and mobile experiences for multiple high-growth products.',
        'Partnered with engineering and product teams from discovery to launch.',
      ],
    },
  ],

  projects: [
    {
      id: 'project-1',
      name: 'AI Career Platform',
      techStack: ['Figma', 'React', 'AI'],
      description:
        'Designed an AI-powered career platform that helps candidates build stronger applications.',
      link: '',
    },
    {
      id: 'project-2',
      name: 'Hiring Analytics',
      techStack: ['UX Research', 'Product Design'],
      description:
        'Created a recruiter analytics experience that simplified candidate evaluation.',
      link: '',
    },
  ],

  education: [
    {
      id: 'edu-1',
      degree: 'B.Des. Interaction Design',
      institution: 'California Design Institute',
      startDate: '2015',
      endDate: '2019',
      grade: '3.8',
    },
  ],

  skills: [
    'Product Design',
    'UX Research',
    'Figma',
    'Design Systems',
    'Prototyping',
    'Interaction Design',
    'Usability Testing',
    'AI Products',
  ],

  achievements: [
    'Led design system adoption across 12 product teams.',
    'Winner — Product Design Excellence Award 2024.',
  ],

  certificates: [
    'Google UX Design Professional Certificate',
    'Advanced Product Strategy',
  ],

  languages: [
    'English — Native',
    'Spanish — Professional',
  ],
};

export function TemplateThumbnail({
  template,
  className = '',
  data = SAMPLE_DATA,
}: {
  template: TemplateDef;
  className?: string;
  data?: ResumeData;
}) {
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#e9ebf1] ${className}`}
    >
      {/* A4 shadow */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 w-[78%] h-[90%] bg-black/10 blur-xl rounded-sm" />

      {/* COMPLETE RESUME CANVAS */}
      <div
        className="absolute left-1/2 top-3 bg-white overflow-hidden"
        style={{
          width: '210mm',
          height: '297mm',
          transform: 'translateX(-50%) scale(0.31)',
          transformOrigin: 'top center',
        }}
      >
        <ResumeRenderer
          template={template}
          data={data}
          photoUrl={data.photoUrl}
        />
      </div>

      {/* bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#e9ebf1] to-transparent pointer-events-none" />
    </div>
  );
}