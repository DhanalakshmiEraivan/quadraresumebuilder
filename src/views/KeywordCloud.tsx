import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { extractKeywords, suggestMissingSkills } from '@/lib/aiEngine';
import { Cloud, FileText, Zap } from 'lucide-react';

export function KeywordCloud({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const generate = () => {
    if (!selected) return;
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 800);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="Resume Keyword Cloud" subtitle="Visualize your keyword density and gaps" icon={<Cloud className="w-6 h-6 text-white" />} />
        <Card className="p-8"><EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to generate a keyword cloud." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} /></Card>
      </div>
    );
  }

  const data = selected?.data;
  const allText = data ? [data.summary, ...data.experience.flatMap(e => [...e.bullets, e.description]), ...data.projects.map(p => p.description), data.skills.join(' '), ...data.achievements].join(' ') : '';
  const keywords = data ? extractKeywords(allText) : [];
  const missing = data ? suggestMissingSkills(data) : [];
  const repeated = keywords.filter(k => k.count >= 3).slice(0, 8);
  const maxCount = keywords[0]?.count || 1;

  return (
    <div>
      <PageHeader title="Resume Keyword Cloud" subtitle="Visualize your keyword density and gaps" icon={<Cloud className="w-6 h-6 text-white" />}
        action={selected && <Button onClick={generate} disabled={generating}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {generating ? 'Generating...' : 'Generate Cloud'}</span></Button>}
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button key={r.id} onClick={() => { setSelectedId(r.id); setGenerated(false); }} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedId === r.id ? 'bg-gradient-to-r from-[#04042c] to-[#3047ff] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              <FileText className="w-4 h-4" />{r.title}
            </button>
          ))}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {generating ? (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-16 flex flex-col items-center">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Cloud className="w-10 h-10 text-[#3047ff]" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500">Extracting and analyzing keywords...</p>
            </Card>
          </motion.div>
        ) : generated ? (
          <motion.div key="cloud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Main Cloud */}
            <Card className="p-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Your Keyword Cloud</h3>
              <div className="flex flex-wrap items-center justify-center gap-2 py-8">
                {keywords.map((kw, i) => {
                  const size = 12 + (kw.count / maxCount) * 24;
                  const opacity = 0.4 + (kw.count / maxCount) * 0.6;
                  return (
                    <motion.span
                      key={kw.word}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity, scale: 1 }}
                      transition={{ delay: i * 0.02, type: 'spring' }}
                      className="font-bold cursor-pointer hover:scale-110 transition-transform"
                      style={{ fontSize: `${size}px`, color: i < 3 ? '#3047ff' : i < 8 ? '#04042c' : '#3d4d63' }}
                    >
                      {kw.word}
                    </motion.span>
                  );
                })}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Keywords */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Keywords</h3>
                <div className="space-y-2">
                  {keywords.slice(0, 10).map((kw, i) => (
                    <motion.div key={kw.word} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{kw.word}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(kw.count / maxCount) * 100}%` }} transition={{ delay: i * 0.05 + 0.3 }} className="h-full bg-[#3047ff] rounded-full" />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-6">{kw.count}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Repeated Keywords */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Repeated Keywords</h3>
                {repeated.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {repeated.map(kw => (
                      <Badge key={kw.word} color="amber">{kw.word} ({kw.count}x)</Badge>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400">No significantly repeated keywords — good variety!</p>}
                <p className="text-xs text-slate-400 mt-4 leading-relaxed">Repeating keywords 3+ times may feel redundant. Consider using synonyms or varying your language.</p>
              </Card>

              {/* Missing Keywords */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {missing.length > 0 ? missing.map(kw => (
                    <Badge key={kw} color="red">{kw}</Badge>
                  )) : <p className="text-xs text-slate-400">No critical missing keywords!</p>}
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed">These are industry-standard keywords recruiters and ATS systems expect to see in your resume.</p>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <Cloud className="w-8 h-8 text-[#3047ff]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Keyword Cloud</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                See a visual cloud of your most-used keywords, identify repeated terms, and discover missing industry keywords that recruiters search for.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
