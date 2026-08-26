import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, ScoreRing, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import type { ResumeData } from '@/lib/types';
import { calculateATSScore, type FixSuggestion } from '@/lib/atsScorer';
import { fixResumeForATS } from '@/lib/aiEngine';
import { ShareModal } from '@/components/ShareModal';
import { TEMPLATES } from '@/lib/templateData';
import {
  Target, FileText, Zap, Info, TrendingUp, Wand2, Check,
  AlertTriangle, Lightbulb, ArrowRight, RefreshCw, Share2,
} from 'lucide-react';

export function ATSScore({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume, updateResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [result, setResult] = useState<{
    total: number;
    breakdown: { category: string; points: number; maxPoints: number; suggestions?: FixSuggestion[] }[];
    insights: { category: string; type: string; title: string; detail: string }[];
  } | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixChanges, setFixChanges] = useState<string[] | null>(null);
  const [showShare, setShowShare] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const calculate = () => {
    if (!selected) return;
    setCalculating(true);
    setTimeout(() => {
      const { scores, insights, breakdown } = calculateATSScore(selected.data);
      setResult({ total: scores.atsCompatibility, breakdown, insights });
      setCalculating(false);
    }, 1500);
  };

  const handleFixWithAI = async () => {
    if (!selected) return;
    setFixing(true);
    setTimeout(async () => {
      const { fixed, changes } = fixResumeForATS(selected.data);
      await updateResume(selected.id, fixed);
      setFixChanges(changes);
      setFixing(false);
      const { scores, insights, breakdown } = calculateATSScore(fixed);
      setResult({ total: scores.atsCompatibility, breakdown, insights });
    }, 2000);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="ATS Score Calculator" subtitle="Rule-based ATS compatibility scoring with detailed breakdown" icon={<Target className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes to score" message="Create a resume first to calculate its ATS compatibility score." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  const allSuggestions = result?.breakdown.flatMap(b => b.suggestions || []) || [];

  return (
    <div>
      <PageHeader
        title="ATS Score Calculator"
        subtitle="AI-powered ATS analysis with actionable fix suggestions"
        icon={<Target className="w-6 h-6 text-white" />}
        action={
          <div className="flex gap-2">
            {selected && (
              <Button variant="secondary" onClick={() => setShowShare(true)}>
                <span className="flex items-center gap-2"><Share2 className="w-4 h-4" /> Export</span>
              </Button>
            )}
            {result && result.total < 90 && (
              <Button variant="secondary" onClick={handleFixWithAI} disabled={fixing}>
                <span className="flex items-center gap-2">
                  {fixing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {fixing ? 'Fixing...' : 'Fix with AI'}
                </span>
              </Button>
            )}
            <Button onClick={calculate} disabled={calculating}>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {calculating ? 'Calculating...' : 'Calculate Score'}
              </span>
            </Button>
          </div>
        }
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setResult(null); setFixChanges(null); }}
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

      {/* AI Fix Results Banner */}
      <AnimatePresence>
        {fixChanges && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card className="p-5 bg-[#f7f8ff] border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#04042c] flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">AI Applied {fixChanges.length} Fixes to Your Resume</span>
                </div>
                <button onClick={() => setFixChanges(null)} className="text-slate-400 hover:text-slate-600 text-sm">Dismiss</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {fixChanges.map((change, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-white/60 rounded-lg p-2.5">
                    <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{change}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Button variant="secondary" onClick={() => onNavigate('builder')} className="text-xs">
                  <span className="flex items-center gap-1.5">View in Builder <ArrowRight className="w-3.5 h-3.5" /></span>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {calculating ? (
          <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-16 flex flex-col items-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <motion.circle
                    cx="48" cy="48" r="40" fill="none" stroke="#1c6df5" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={251.3}
                    initial={{ strokeDashoffset: 251.3 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-sm font-medium text-slate-600">Computing ATS score using rule-based analysis...</p>
            </Card>
          </motion.div>
        ) : result ? (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Score + Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-slate-600 mb-4 self-start">Final ATS Score</h3>
                <ScoreRing score={result.total} size={180} label="Out of 100" />
                <div className="mt-4 flex flex-col items-center gap-2">
                  <Badge color={result.total >= 80 ? 'green' : result.total >= 60 ? 'amber' : 'red'}>
                    {result.total >= 80 ? 'Excellent' : result.total >= 60 ? 'Good' : 'Needs Work'}
                  </Badge>
                  {result.total < 90 && (
                    <p className="text-xs text-slate-400 text-center mt-1">Use "Fix with AI" to push above 90</p>
                  )}
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h3 className="text-sm font-semibold text-slate-600 mb-5">Score Breakdown by Category</h3>
                <div className="space-y-3">
                  {result.breakdown.map((item, i) => {
                    const pct = Math.round((item.points / item.maxPoints) * 100);
                    const hasIssues = item.suggestions && item.suggestions.length > 0;
                    return (
                      <motion.div
                        key={item.category}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">{item.category}</span>
                            {hasIssues && item.suggestions![0].severity === 'critical' && (
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            )}
                            {hasIssues && item.suggestions![0].severity === 'warning' && (
                              <Info className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{item.points} / {item.maxPoints} pts</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.08 }}
                            className={`h-full rounded-full ${
                              pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                        {/* Inline fix suggestions */}
                        {hasIssues && (
                          <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-slate-100">
                            {item.suggestions!.map((sug, si) => (
                              <div key={si} className="flex items-start gap-2 text-xs">
                                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  sug.severity === 'critical' ? 'bg-red-100' : sug.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                                }`}>
                                  {sug.severity === 'critical' ? <AlertTriangle className="w-2.5 h-2.5 text-red-600" /> : <Lightbulb className="w-2.5 h-2.5 text-amber-600" />}
                                </div>
                                <div>
                                  <span className="text-slate-600 font-medium">{sug.issue}</span>
                                  <span className="text-slate-400"> — {sug.fix}</span>
                                  <span className="text-emerald-600 font-semibold ml-1">(+{sug.pointsRecovered} pts)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Why this score */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-700">Why This Score?</h3>
              </div>
              <div className="space-y-3">
                {result.insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 p-3 rounded-xl bg-slate-50"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      insight.type === 'strength' ? 'bg-emerald-100' : insight.type === 'weakness' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      {insight.type === 'strength' ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : insight.type === 'weakness' ? <Info className="w-4 h-4 text-amber-600" /> : <Lightbulb className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{insight.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{insight.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* All Fix Suggestions Summary */}
            {allSuggestions.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Recommended Fixes ({allSuggestions.length})</h3>
                  </div>
                  {result.total < 90 && (
                    <Button onClick={handleFixWithAI} disabled={fixing} className="text-xs">
                      <span className="flex items-center gap-1.5">
                        {fixing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        {fixing ? 'Fixing...' : 'Fix All with AI'}
                      </span>
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {allSuggestions
                    .sort((a, b) => b.pointsRecovered - a.pointsRecovered)
                    .map((sug, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          sug.severity === 'critical' ? 'bg-red-100' : sug.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                        }`}>
                          {sug.severity === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Lightbulb className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">{sug.issue}</span>
                            <Badge color={sug.severity === 'critical' ? 'red' : 'amber'}>+{sug.pointsRecovered} pts</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{sug.fix}</p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">ATS Score Calculator</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md">
                Our AI engine evaluates your resume across 8 weighted categories — sections, skills, action verbs, formatting, keywords, experience, education, and metrics — to compute a real ATS compatibility score with actionable fix suggestions.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 w-full max-w-lg">
                {[
                  { label: 'Sections', pts: '20 pts' },
                  { label: 'Skills Match', pts: '20 pts' },
                  { label: 'Keyword Density', pts: '20 pts' },
                  { label: 'Action Verbs', pts: '10 pts' },
                  { label: 'Formatting', pts: '10 pts' },
                  { label: 'Experience', pts: '10 pts' },
                  { label: 'Education', pts: '5 pts' },
                  { label: 'Metrics', pts: '5 pts' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-medium text-slate-600">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.pts}</p>
                  </div>
                ))}
              </div>
              <Button onClick={calculate} className="mt-6">
                <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Calculate Now</span>
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {showShare && selected && (
        <ShareModal
          resume={selected.data}
          resumeId={selected.id}
          title={selected.title}
          template={TEMPLATES.find(t => t.id === selected.template) || TEMPLATES[0]}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
