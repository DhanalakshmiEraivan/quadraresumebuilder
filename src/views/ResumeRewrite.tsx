import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { rewriteResumeStyle } from '@/lib/aiEngine';
import { Wand2, FileText, Zap, Copy, Check, RefreshCw } from 'lucide-react';

const STYLES = [
  { id: 'professional' as const, name: 'Professional', desc: 'Clean, polished, universally appropriate', color: 'from-blue-500 to-blue-600' },
  { id: 'executive' as const, name: 'Executive', desc: 'Leadership-focused with authoritative tone', color: 'from-slate-600 to-slate-700' },
  { id: 'google' as const, name: 'Google Style', desc: 'Data-driven, scale-focused, impact-heavy', color: 'from-red-500 to-yellow-500' },
  { id: 'amazon' as const, name: 'Amazon Style', desc: 'Customer-centric with leadership principles', color: 'from-amber-500 to-orange-600' },
  { id: 'microsoft' as const, name: 'Microsoft Style', desc: 'Enterprise-grade, collaborative, growth-mindset', color: 'from-cyan-500 to-blue-600' },
];

export function ResumeRewrite({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [selectedStyle, setSelectedStyle] = useState<typeof STYLES[0]['id'] | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [rewriting, setRewriting] = useState(false);
  const [copied, setCopied] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const rewrite = (style: typeof STYLES[0]['id']) => {
    if (!selected) return;
    setSelectedStyle(style);
    setRewriting(true);
    setTimeout(() => {
      const data = selected.data;
      const bullets = [
        ...data.experience.flatMap(e => e.bullets),
        ...data.projects.map(p => p.description),
        ...data.achievements,
      ].filter(Boolean);
      const rewritten = bullets.map(b => rewriteResumeStyle(b, style));
      setOutput(rewritten.length > 0 ? rewritten : ['No bullet points found to rewrite. Add experience or projects first!']);
      setRewriting(false);
    }, 1200);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(output.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="AI Resume Rewrite" subtitle="Transform your resume into different professional styles" icon={<Wand2 className="w-6 h-6 text-white" />} />
        <Card className="p-8"><EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to use the AI rewrite feature." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} /></Card>
      </div>
    );
  }

  const originalBullets = selected ? [
    ...selected.data.experience.flatMap(e => e.bullets),
    ...selected.data.projects.map(p => p.description),
    ...selected.data.achievements,
  ].filter(Boolean) : [];

  return (
    <div>
      <PageHeader title="AI Resume Rewrite" subtitle="Transform your resume into different professional styles" icon={<Wand2 className="w-6 h-6 text-white" />} />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button key={r.id} onClick={() => { setSelectedId(r.id); setOutput([]); setSelectedStyle(null); }} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedId === r.id ? 'bg-gradient-to-r from-[#04042c] to-[#3047ff] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              <FileText className="w-4 h-4" />{r.title}
            </button>
          ))}
        </div>
      </Card>

      {/* Style Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {STYLES.map(style => (
          <motion.button
            key={style.id}
            whileHover={{ y: -3 }}
            onClick={() => rewrite(style.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedStyle === style.id ? 'border-[#3047ff] bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${style.color} flex items-center justify-center mb-2`}>
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-slate-800">{style.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{style.desc}</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {rewriting ? (
          <motion.div key="rewriting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-16 flex flex-col items-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw className="w-10 h-10 text-[#3047ff]" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500">Rewriting your resume in {STYLES.find(s => s.id === selectedStyle)?.name} style...</p>
            </Card>
          </motion.div>
        ) : output.length > 0 ? (
          <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">
                  Rewritten Content — {STYLES.find(s => s.id === selectedStyle)?.name} Style
                </h3>
                <Button variant="secondary" onClick={copyAll}>
                  <span className="flex items-center gap-2">{copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy All'}</span>
                </Button>
              </div>
              <div className="space-y-3">
                {output.map((bullet, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {originalBullets[i] && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Original</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{originalBullets[i]}</p>
                      </div>
                    )}
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-semibold text-[#3047ff] uppercase mb-1">Rewritten</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{bullet}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8 text-[#3047ff]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">AI Resume Rewrite</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Transform your bullet points into different professional styles. Choose from Professional, Executive, Google, Amazon, or Microsoft styles. See before/after comparisons instantly.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
