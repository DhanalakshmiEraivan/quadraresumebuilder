import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { suggestMissingSkills, generateSkillRoadmap, generateProjectIdeas } from '@/lib/aiEngine';
import { TrendingUp, FileText, Zap, BookOpen, Rocket, Award, Map, Lightbulb } from 'lucide-react';

export function SkillGap({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [view, setView] = useState<'gap' | 'roadmap' | 'projects'>('gap');
  const [analyzing, setAnalyzing] = useState(false);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<ReturnType<typeof generateSkillRoadmap>>([]);
  const [projectIdeas, setProjectIdeas] = useState<ReturnType<typeof generateProjectIdeas>>([]);

  const selected = resumes.find(r => r.id === selectedId);

  const analyze = () => {
    if (!selected) return;
    setAnalyzing(true);
    setTimeout(() => {
      const missing = suggestMissingSkills(selected.data);
      setMissingSkills(missing);
      setRoadmap(generateSkillRoadmap(missing));
      setProjectIdeas(generateProjectIdeas(selected.data));
      setAnalyzing(false);
    }, 1000);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="Skill Gap Analysis" subtitle="Identify missing skills and get personalized learning roadmaps" icon={<TrendingUp className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to analyze your skill gaps." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Skill Gap Analysis"
        subtitle="Identify missing skills and get personalized learning roadmaps"
        icon={<TrendingUp className="w-6 h-6 text-white" />}
        action={selected && <Button onClick={analyze} disabled={analyzing}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'Analyze Skills'}</span></Button>}
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setMissingSkills([]); setRoadmap([]); setProjectIdeas([]); }}
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
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <TrendingUp className="w-10 h-10 text-blue-500" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500">Analyzing your skills against industry expectations...</p>
            </Card>
          </motion.div>
        ) : missingSkills.length > 0 ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* View Switcher */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
              {([
                { key: 'gap', label: 'Missing Skills', icon: AlertTriangle },
                { key: 'roadmap', label: 'Learning Roadmap', icon: Map },
                { key: 'projects', label: 'Project Ideas', icon: Rocket },
              ] as const).map(v => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.key}
                    onClick={() => setView(v.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      view === v.key ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {view === v.key && (
                      <motion.div layoutId="skillGapTab" className="absolute inset-0 bg-[#04042c] rounded-lg shadow-md" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{v.label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {view === 'gap' && (
                <motion.div key="gap" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <h3 className="text-sm font-semibold text-slate-700">Skills Recruiters Expect (That You're Missing)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {missingSkills.map((skill, i) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-red-50 border border-amber-200"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{skill}</p>
                            <p className="text-xs text-slate-400">Industry expected</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {view === 'roadmap' && (
                <motion.div key="roadmap" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  {roadmap.map((item, i) => (
                    <Card key={item.skill} delay={i * 0.05} className="p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-[#04042c] flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-700">{item.skill}</h3>
                        <Badge color="blue">{item.steps.length} steps</Badge>
                      </div>
                      <div className="space-y-3">
                        {item.steps.map((step, si) => (
                          <motion.div
                            key={si}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 + si * 0.08 }}
                            className="flex gap-4"
                          >
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                si === 0 ? 'bg-blue-500 text-white' :
                                si === item.steps.length - 1 ? 'bg-emerald-500 text-white' :
                                'bg-slate-200 text-slate-600'
                              }`}>
                                {si + 1}
                              </div>
                              {si < item.steps.length - 1 && <div className="w-0.5 h-8 bg-slate-200 mt-1" />}
                            </div>
                            <div className="pb-3">
                              <p className="text-sm font-medium text-slate-700">{step.phase}</p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.action}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </motion.div>
              )}

              {view === 'projects' && (
                <motion.div key="projects" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectIdeas.map((proj, i) => (
                    <motion.div key={proj.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <Card className="p-6 card-lift h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-white" />
                          </div>
                          <Badge color={proj.difficulty === 'Advanced' ? 'red' : 'amber'}>{proj.difficulty}</Badge>
                        </div>
                        <h3 className="text-base font-semibold text-slate-800 mb-2">{proj.name}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">{proj.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.techStack.map(tech => (
                            <span key={tech} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">{tech}</span>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Skill Gap Analysis</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Our AI compares your skills against what recruiters expect for your domain, then generates a personalized learning roadmap and project ideas to close the gap.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlertTriangle({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.732 0 2.815-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}
