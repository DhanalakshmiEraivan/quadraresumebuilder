import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { suggestCareers } from '@/lib/aiEngine';
import { TrendingUp, FileText, Zap, Briefcase, IndianRupee, ArrowRight, Sparkles } from 'lucide-react';

export function CareerSuggestions({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [careers, setCareers] = useState<ReturnType<typeof suggestCareers>>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const selected = resumes.find(r => r.id === selectedId);

  const analyze = () => {
    if (!selected) return;
    setAnalyzing(true);
    setTimeout(() => {
      setCareers(suggestCareers(selected.data));
      setAnalyzing(false);
    }, 1000);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="AI Career Suggestions" subtitle="Discover career paths aligned with your skills and experience" icon={<TrendingUp className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to get personalized career suggestions." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="AI Career Suggestions"
        subtitle="Discover career paths aligned with your skills and experience"
        icon={<TrendingUp className="w-6 h-6 text-white" />}
        action={selected && <Button onClick={analyze} disabled={analyzing}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'Suggest Careers'}</span></Button>}
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setCareers([]); }}
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
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-10 h-10 text-blue-500" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500">Analyzing your skills to find the best career paths...</p>
            </Card>
          </motion.div>
        ) : careers.length > 0 ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {careers.map((career, i) => (
              <motion.div
                key={career.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="p-5 card-lift cursor-pointer" >
                  <div onClick={() => setExpanded(expanded === i ? null : i)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        i === 0 ? 'bg-[#04042c]' :
                        i === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                        'bg-gradient-to-br from-slate-400 to-slate-500'
                      }`}>
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-800">{career.role}</h3>
                          {i === 0 && <Badge color="green">Best Match</Badge>}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{career.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-slate-700">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span className="text-sm font-semibold">{career.salaryRange}</span>
                        </div>
                        <div className="mt-1">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${career.match}%` }}
                                transition={{ duration: 0.8, delay: i * 0.06 }}
                                className="h-full bg-[#04042c] rounded-full"
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{career.match}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Career Path Discovery</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Our AI analyzes your skills and experience to recommend the best career paths, complete with match scores and salary estimates.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
