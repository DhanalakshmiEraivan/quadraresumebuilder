import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { calculateATSScore } from '@/lib/atsScorer';
import { Grid3x3, FileText, Zap } from 'lucide-react';

export function ResumeHeatmap({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const generate = () => {
    if (!selected) return;
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1000);
  };

  const getHeatColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-white', label: 'Strong', emoji: '🟢' };
    if (score >= 60) return { bg: 'bg-amber-400', text: 'text-white', label: 'Moderate', emoji: '🟡' };
    return { bg: 'bg-red-500', text: 'text-white', label: 'Weak', emoji: '🔴' };
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="Resume Heatmap" subtitle="Visual strength map of your resume sections" icon={<Grid3x3 className="w-6 h-6 text-white" />} />
        <Card className="p-8"><EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to generate a heatmap." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} /></Card>
      </div>
    );
  }

  const data = selected?.data;
  const { scores } = data ? calculateATSScore(data) : { scores: null };
  if (!data || !scores) return null;

  const sections = [
    { name: 'Summary', score: data.summary.length > 50 ? 85 : 30, icon: '📝' },
    { name: 'Projects', score: scores.projects, icon: '🚀' },
    { name: 'Experience', score: scores.professionalism, icon: '💼' },
    { name: 'Skills', score: scores.skills, icon: '⚡' },
    { name: 'Education', score: scores.education, icon: '🎓' },
    { name: 'Achievements', score: scores.achievements, icon: '🏆' },
    { name: 'Action Verbs', score: scores.actionVerbs, icon: 'verbs' },
    { name: 'Keywords', score: scores.keywordOptimization, icon: '🔑' },
    { name: 'Formatting', score: scores.formatting, icon: '📋' },
    { name: 'Grammar', score: scores.grammar, icon: '✓' },
    { name: 'Readability', score: scores.readability, icon: '📖' },
    { name: 'ATS Score', score: scores.atsCompatibility, icon: '🎯' },
  ];

  return (
    <div>
      <PageHeader title="Resume Heatmap" subtitle="Visual strength map of your resume sections" icon={<Grid3x3 className="w-6 h-6 text-white" />}
        action={selected && <Button onClick={generate} disabled={generating}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {generating ? 'Generating...' : 'Generate Heatmap'}</span></Button>}
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
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Grid3x3 className="w-10 h-10 text-[#3047ff]" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500">Generating visual heatmap...</p>
            </Card>
          </motion.div>
        ) : generated ? (
          <motion.div key="heatmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Heatmap Grid */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-5">Section Strength Heatmap</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sections.map((section, i) => {
                  const heat = getHeatColor(section.score);
                  return (
                    <motion.div
                      key={section.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className={`${heat.bg} rounded-xl p-4 ${heat.text} relative overflow-hidden`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{typeof section.icon === 'string' && section.icon.length <= 2 ? section.icon : section.icon}</span>
                        <span className="text-2xl font-bold">{section.score}</span>
                      </div>
                      <p className="text-xs font-semibold opacity-90">{section.name}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{heat.label}</p>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${section.score}%` }} transition={{ delay: i * 0.06 + 0.3, duration: 0.8 }} className="h-full bg-white/40" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            {/* Legend */}
            <Card className="p-5">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500" />
                  <span className="text-xs text-slate-600">🟢 Strong (80+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-400" />
                  <span className="text-xs text-slate-600">🟡 Moderate (60-79)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-xs text-slate-600">🔴 Weak (&lt;60)</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <Grid3x3 className="w-8 h-8 text-[#3047ff]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Resume Heatmap</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Visualize the strength of each resume section with a color-coded heatmap. Green = strong, yellow = moderate, red = weak.
              </p>
              <div className="flex gap-3 mt-6">
                <div className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium">🟢 Strong</div>
                <div className="px-4 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">🟡 Moderate</div>
                <div className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-medium">🔴 Weak</div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
