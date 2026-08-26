import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { generateInterviewQuestions } from '@/lib/aiEngine';
import { MessageSquare, FileText, Zap, Code, User, Users, Building } from 'lucide-react';

const CATEGORY_CONFIG = {
  technical: { label: 'Technical', icon: Code, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  hr: { label: 'HR', icon: User, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  behavioral: { label: 'Behavioral', icon: Users, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  company: { label: 'Company-Specific', icon: Building, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

const DIFFICULTY_COLORS = {
  easy: 'green',
  medium: 'amber',
  hard: 'red',
} as const;

export function InterviewPrep({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [questions, setQuestions] = useState<ReturnType<typeof generateInterviewQuestions>>([]);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'technical' | 'hr' | 'behavioral' | 'company'>('all');

  const selected = resumes.find(r => r.id === selectedId);

  const generate = () => {
    if (!selected) return;
    setGenerating(true);
    setTimeout(() => {
      setQuestions(generateInterviewQuestions(selected.data));
      setGenerating(false);
    }, 1000);
  };

  const filtered = filter === 'all' ? questions : questions.filter(q => q.category === filter);

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="AI Interview Preparation" subtitle="Generate personalized interview questions based on your resume" icon={<MessageSquare className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to generate personalized interview questions." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="AI Interview Preparation"
        subtitle="Generate personalized interview questions based on your resume"
        icon={<MessageSquare className="w-6 h-6 text-white" />}
        action={selected && <Button onClick={generate} disabled={generating}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {generating ? 'Generating...' : 'Generate Questions'}</span></Button>}
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setQuestions([]); }}
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
        {generating ? (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-16 flex flex-col items-center">
              <div className="w-12 h-12 border-3 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500">Generating personalized interview questions...</p>
            </Card>
          </motion.div>
        ) : questions.length > 0 ? (
          <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'technical', 'hr', 'behavioral', 'company'] as const).map(f => {
                const count = f === 'all' ? questions.length : questions.filter(q => q.category === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filter === f ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f === 'all' ? 'All' : CATEGORY_CONFIG[f].label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {filtered.map((q, i) => {
                const config = CATEGORY_CONFIG[q.category];
                const Icon = config.icon;
                const isExpanded = expanded === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={`p-5 cursor-pointer border-l-4 ${config.border.replace('border-', 'border-l-')}`} >
                      <div onClick={() => setExpanded(isExpanded ? null : i)}>
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
                              <Badge color={DIFFICULTY_COLORS[q.difficulty]}>{q.difficulty}</Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-700">{q.question}</p>
                          </div>
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 ml-12"
                            >
                              <div className={`p-3 rounded-xl ${config.bg}`}>
                                <p className="text-xs font-semibold text-slate-600 mb-1">Suggested Approach:</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{q.suggestedApproach}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Interview Prep Ready</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Generate technical, HR, behavioral, and company-specific interview questions tailored to your resume and experience.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <div key={key} className={`p-4 rounded-xl ${config.bg} border ${config.border}`}>
                      <Icon className={`w-5 h-5 ${config.text} mx-auto mb-2`} />
                      <p className={`text-xs font-medium ${config.text}`}>{config.label}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
