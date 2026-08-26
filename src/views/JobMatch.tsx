import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge, ScoreRing } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { calculateJobMatch } from '@/lib/atsScorer';
import { Briefcase, FileText, Zap, CheckCircle2, XCircle, TrendingUp, AlertCircle } from 'lucide-react';

export function JobMatch({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateJobMatch> | null>(null);
  const [calculating, setCalculating] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const runMatch = () => {
    if (!selected || !jobDescription.trim()) return;
    setCalculating(true);
    setTimeout(() => {
      const matchResult = calculateJobMatch(selected.data, jobDescription);
      setResult(matchResult);
      setCalculating(false);
    }, 1200);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="Job Description Match" subtitle="Compare your resume against any job description" icon={<Briefcase className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes to match" message="Create a resume first, then paste a job description to see how well you match." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Job Description Match"
        subtitle="Compare your resume against any job description"
        icon={<Briefcase className="w-6 h-6 text-white" />}
        action={
          <Button onClick={runMatch} disabled={calculating || !jobDescription.trim()}>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {calculating ? 'Matching...' : 'Run Match'}</span>
          </Button>
        }
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setResult(null); }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <label className="block text-xs font-medium text-slate-600 mb-2">Paste Job Description</label>
          <textarea
            value={jobDescription}
            onChange={e => { setJobDescription(e.target.value); setResult(null); }}
            placeholder="Paste the full job description here..."
            className="w-full min-h-[300px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
          />
          <p className="text-xs text-slate-400 mt-2">{jobDescription.length} characters</p>
        </Card>

        <AnimatePresence mode="wait">
          {calculating ? (
            <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="p-16 flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-12 h-12 border-3 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                <p className="mt-4 text-sm text-slate-500">Comparing skills and keywords...</p>
              </Card>
            </motion.div>
          ) : result ? (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card className="p-6 flex flex-col items-center">
                <h3 className="text-sm font-semibold text-slate-600 mb-4 self-start">Match Score</h3>
                <ScoreRing score={result.matchScore} size={140} label="Job Match" />
                <div className="flex gap-2 mt-4">
                  <Badge color="blue">Exp: {result.experienceMatch}%</Badge>
                  <Badge color="green">{result.matchedSkills.length} Matched</Badge>
                  <Badge color="red">{result.missingSkills.length} Missing</Badge>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-12 flex flex-col items-center text-center min-h-[300px] justify-center">
                <Briefcase className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400">Paste a job description and click "Run Match" to see your compatibility score.</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-700">Matched Skills</h3>
              <Badge color="green">{result.matchedSkills.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.matchedSkills.length > 0 ? result.matchedSkills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium">
                  {skill}
                </span>
              )) : <p className="text-sm text-slate-400">No matched skills found.</p>}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-semibold text-slate-700">Missing Skills</h3>
              <Badge color="red">{result.missingSkills.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.length > 0 ? result.missingSkills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
                  {skill}
                </span>
              )) : <p className="text-sm text-slate-400">No missing skills — great match!</p>}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-700">Strong Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.strongKeywords.length > 0 ? result.strongKeywords.map(kw => (
                <span key={kw} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium">
                  {kw}
                </span>
              )) : <p className="text-sm text-slate-400">No strong keywords identified.</p>}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-700">Weak / Missing Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.weakKeywords.length > 0 ? result.weakKeywords.map(kw => (
                <span key={kw} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium">
                  {kw}
                </span>
              )) : <p className="text-sm text-slate-400">All keywords covered!</p>}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
