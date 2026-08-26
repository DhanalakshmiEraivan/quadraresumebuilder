import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { generateCoverLetter } from '@/lib/aiEngine';
import { supabase } from '@/lib/supabase';
import { Mail, FileText, Zap, Building2, Briefcase, Save, Copy, Check } from 'lucide-react';

export function CoverLetter({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const generate = () => {
    if (!selected || !company.trim() || !position.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const letter = generateCoverLetter(selected.data, company, position);
      setContent(letter);
      setGenerating(false);
    }, 1000);
  };

  const save = async () => {
    if (!selected || !content) return;
    await supabase.from('cover_letters').insert({
      resume_id: selected.id,
      company,
      position,
      content,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="AI Cover Letter Generator" subtitle="Generate company-specific, ATS-optimized cover letters" icon={<Mail className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to generate a tailored cover letter." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="AI Cover Letter Generator"
        subtitle="Generate company-specific, ATS-optimized cover letters"
        icon={<Mail className="w-6 h-6 text-white" />}
        action={
          <Button onClick={generate} disabled={generating || !company.trim() || !position.trim()}>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {generating ? 'Generating...' : 'Generate'}</span>
          </Button>
        }
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setContent(''); }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Cover Letter Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                <Building2 className="w-3.5 h-3.5 inline mr-1" /> Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={e => { setCompany(e.target.value); setContent(''); }}
                placeholder="e.g., Google, Microsoft, Amazon"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 inline mr-1" /> Position
              </label>
              <input
                type="text"
                value={position}
                onChange={e => { setPosition(e.target.value); setContent(''); }}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            {content && (
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" onClick={copy} className="flex-1">
                  <span className="flex items-center gap-2">{copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy'}</span>
                </Button>
                <Button variant="secondary" onClick={save} className="flex-1">
                  <span className="flex items-center gap-2">{saved ? <Check className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />} {saved ? 'Saved!' : 'Save'}</span>
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-16 flex flex-col items-center justify-center min-h-[400px]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Mail className="w-10 h-10 text-blue-500" />
                  </motion.div>
                  <p className="mt-4 text-sm text-slate-500">Crafting your personalized cover letter...</p>
                </Card>
              </motion.div>
            ) : content ? (
              <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-8 min-h-[400px]">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge color="blue">{company}</Badge>
                    <Badge color="green">{position}</Badge>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {content.split('\n').map((line, i) => (
                      <p key={i} className={`text-sm leading-relaxed text-slate-700 ${line.trim() === '' ? 'h-3' : 'mb-3'} ${line.startsWith('Dear') || line.startsWith('Sincerely') ? 'font-medium' : ''}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-12 flex flex-col items-center text-center min-h-[400px] justify-center">
                  <Mail className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700">Ready to Generate</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm">
                    Enter a company name and position, then click "Generate" to create a tailored, ATS-optimized cover letter.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
