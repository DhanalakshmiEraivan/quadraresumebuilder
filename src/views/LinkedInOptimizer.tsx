import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge, ScoreBar } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { generateSummary, extractKeywords } from '@/lib/aiEngine';
import { Zap, FileText, Lightbulb, TrendingUp, Eye, Sparkles } from 'lucide-react';

export function LinkedInOptimizer({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [analyzed, setAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const analyze = () => {
    if (!selected) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1200);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="LinkedIn Optimizer" subtitle="Optimize your LinkedIn profile based on your resume" icon={<Zap className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to optimize your LinkedIn profile." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  const data = selected?.data;
  const headline = data ? `${data.title || 'Professional'} | ${data.skills.slice(0, 3).join(' • ') || 'Specialist'}` : '';
  const aboutText = data ? generateSummary(data) : '';
  const keywords = data ? extractKeywords([data.summary, ...data.experience.flatMap(e => e.bullets), data.skills.join(' ')].join(' ')) : [];
  const recruiterScore = data ? Math.min(95, 40 + data.skills.length * 4 + data.experience.length * 8 + data.projects.length * 5) : 0;

  const scores = [
    { label: 'Headline Impact', score: data?.title ? 85 : 40 },
    { label: 'About Section', score: data?.summary ? 80 : 30 },
    { label: 'Skills Coverage', score: Math.min(100, (data?.skills.length || 0) * 8) },
    { label: 'Experience Depth', score: Math.min(100, (data?.experience.length || 0) * 25) },
    { label: 'Project Showcase', score: Math.min(100, (data?.projects.length || 0) * 30) },
    { label: 'Keyword Density', score: Math.min(100, keywords.length * 5) },
  ];

  return (
    <div>
      <PageHeader
        title="LinkedIn Optimizer"
        subtitle="Optimize your LinkedIn profile based on your resume"
        icon={<Zap className="w-6 h-6 text-white" />}
        action={selected && <Button onClick={analyze} disabled={analyzing}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'Optimize Profile'}</span></Button>}
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setAnalyzed(false); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                selectedId === r.id ? 'bg-[#04042c] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              {r.title}
            </button>
          ))}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-16 flex flex-col items-center">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Zap className="w-10 h-10 text-blue-500" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500">Optimizing your LinkedIn profile...</p>
            </Card>
          </motion.div>
        ) : analyzed && data ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Recruiter Score */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#04042c] flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-700">Recruiter View Score</h3>
                  <p className="text-sm text-slate-400">How recruiters perceive your profile</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold gradient-text">{recruiterScore}</p>
                  <p className="text-xs text-slate-400">out of 100</p>
                </div>
              </div>
            </Card>

            {/* Scores */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-5">Profile Section Scores</h3>
              <div className="space-y-3">
                {scores.map((s, i) => <ScoreBar key={s.label} label={s.label} score={s.score} delay={i * 0.05} />)}
              </div>
            </Card>

            {/* Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Suggested Headline</h3>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm font-medium text-slate-700">{headline}</p>
                </div>
                <div className="flex items-center gap-2 mt-4 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Suggested About Section</h3>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-slate-600 leading-relaxed">{aboutText}</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Top Keywords for LinkedIn</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {keywords.slice(0, 15).map((kw, i) => (
                    <motion.span
                      key={kw.word}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="px-3 py-1.5 bg-[#f7f8ff] text-slate-700 border border-slate-200 rounded-lg text-sm font-medium"
                      style={{ fontSize: `${Math.min(14, 10 + kw.count)}px` }}
                    >
                      {kw.word}
                    </motion.span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Banner Suggestions</h3>
                </div>
                <div className="space-y-2">
                  {[
                    'Use a professional headshot banner with your tech stack overlay',
                    'Include a tagline matching your headline',
                    'Add relevant certifications or achievement badges',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50">
                      <span className="text-emerald-500 font-bold text-xs">{i + 1}.</span>
                      <p className="text-xs text-slate-600">{tip}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recruiter View Simulation */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">How a Recruiter Sees Your Profile</h3>
              <div className="p-5 bg-slate-50 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#3047ff] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {data.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{data.name || 'Your Name'}</h4>
                    <p className="text-sm text-blue-600 font-medium">{headline}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{data.location || 'Location'} • {data.experience.length} experience entries</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {data.skills.slice(0, 8).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-600">{s}</span>
                      ))}
                    </div>
                  </div>
                  <Badge color={recruiterScore >= 80 ? 'green' : 'amber'}>Match {recruiterScore}%</Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">LinkedIn Optimizer</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Generate an optimized LinkedIn headline, about section, keyword cloud, and banner suggestions based on your resume.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
