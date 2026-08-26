import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge, ScoreRing } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { calculateATSScore } from '@/lib/atsScorer';
import { suggestMissingSkills } from '@/lib/aiEngine';
import { Eye, FileText, Zap, CheckCircle2, XCircle, User, ThumbsUp, ThumbsDown } from 'lucide-react';

export function RecruiterSim({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [result, setResult] = useState<{ shortlist: boolean; probability: number; reasons: { positive: string[]; negative: string[] } } | null>(null);
  const [simulating, setSimulating] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const simulate = () => {
    if (!selected) return;
    setSimulating(true);
    setTimeout(() => {
      const { scores } = calculateATSScore(selected.data);
      const missing = suggestMissingSkills(selected.data);
      const data = selected.data;

      const positive: string[] = [];
      const negative: string[] = [];

      if (data.projects.length >= 2) positive.push(`Strong project portfolio with ${data.projects.length} projects`);
      else negative.push('Limited project showcase — add more to demonstrate practical skills');

      if (scores.actionVerbs >= 70) positive.push('Excellent use of action verbs in descriptions');
      else negative.push('Weak action verb usage — descriptions feel passive');

      if (data.skills.length >= 10) positive.push(`Comprehensive skills section (${data.skills.length} skills)`);
      else negative.push(`Skills section is thin (${data.skills.length} skills) — expand for better matching`);

      if (data.summary.length > 50) positive.push('Clear professional summary provides context');
      else negative.push('Missing or weak professional summary');

      if (scores.keywordOptimization >= 60) positive.push('Good keyword density for ATS parsing');
      else negative.push('Low keyword density — resume may not surface in searches');

      if (missing.length > 0) negative.push(`Missing in-demand skills: ${missing.slice(0, 3).join(', ')}`);
      if (data.experience.length >= 2) positive.push(`${data.experience.length} relevant experience entries`);
      else if (data.experience.length === 0) negative.push('No work experience listed');

      const prob = Math.min(95, Math.max(20,
        40 + scores.atsCompatibility * 0.3 + positive.length * 8 - negative.length * 6
      ));

      setResult({
        shortlist: prob >= 60,
        probability: Math.round(prob),
        reasons: { positive, negative },
      });
      setSimulating(false);
    }, 1500);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="Recruiter Simulation" subtitle="See your resume through a recruiter's eyes" icon={<Eye className="w-6 h-6 text-white" />} />
        <Card className="p-8"><EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to run the recruiter simulation." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Recruiter Simulation" subtitle="See your resume through a recruiter's eyes" icon={<Eye className="w-6 h-6 text-white" />}
        action={selected && <Button onClick={simulate} disabled={simulating}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {simulating ? 'Simulating...' : 'Run Simulation'}</span></Button>}
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button key={r.id} onClick={() => { setSelectedId(r.id); setResult(null); }} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedId === r.id ? 'bg-gradient-to-r from-[#04042c] to-[#3047ff] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              <FileText className="w-4 h-4" />{r.title}
            </button>
          ))}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {simulating ? (
          <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-16 flex flex-col items-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <Eye className="w-12 h-12 text-[#3047ff]" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500">A recruiter is reviewing your resume...</p>
            </Card>
          </motion.div>
        ) : result ? (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card className="p-8 flex flex-col items-center">
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${result.shortlist ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {result.shortlist ? '✓ WOULD SHORTLIST' : '✗ WOULD NOT SHORTLIST'}
              </div>
              <ScoreRing score={result.probability} size={180} label="Shortlist Probability" />
              <p className="text-sm text-slate-500 mt-4 text-center max-w-md">
                {result.shortlist
                  ? 'A recruiter would likely shortlist your resume for an interview. Here\'s what they saw:'
                  : 'A recruiter would likely pass on this resume. Here\'s what concerned them:'}
              </p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-slate-700">What Impressed the Recruiter</h3>
                </div>
                <div className="space-y-2">
                  {result.reasons.positive.length > 0 ? result.reasons.positive.map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{r}</p>
                    </motion.div>
                  )) : <p className="text-xs text-slate-400">No standout positives detected.</p>}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-semibold text-slate-700">What Concerned the Recruiter</h3>
                </div>
                <div className="space-y-2">
                  {result.reasons.negative.length > 0 ? result.reasons.negative.map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-2 p-3 rounded-lg bg-red-50">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{r}</p>
                    </motion.div>
                  )) : <p className="text-xs text-slate-400">No major concerns detected!</p>}
                </div>
              </Card>
            </div>

            {/* Recruiter View */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#3047ff]" />
                <h3 className="text-sm font-semibold text-slate-700">How a Recruiter Scans Your Resume (6-Second Test)</h3>
              </div>
              <div className="p-5 bg-slate-50 rounded-xl">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">1</div>
                    <p className="text-sm text-slate-600"><strong>Skills First:</strong> Recruiter scans your skills section — {selected?.data.skills.length || 0} skills found</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">2</div>
                    <p className="text-sm text-slate-600"><strong>Projects:</strong> Quick scan of project relevance — {selected?.data.projects.length || 0} projects</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">3</div>
                    <p className="text-sm text-slate-600"><strong>Experience:</strong> Role and company names — {selected?.data.experience.length || 0} entries</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-500 text-white text-xs font-bold flex items-center justify-center">4</div>
                    <p className="text-sm text-slate-600"><strong>Education:</strong> Degree and institution — {selected?.data.education.length || 0} entries</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-[#3047ff]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Recruiter Simulation</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Our AI pretends to be a recruiter reviewing your resume in 6 seconds. Get a shortlist verdict, probability score, and specific feedback on what works and what doesn't.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
