import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, ScoreRing, ScoreBar, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { calculateATSScore } from '@/lib/atsScorer';
import type { AnalysisScores, AnalysisInsight } from '@/lib/types';
import {
  BarChart3, FileText, CheckCircle2, AlertTriangle, Lightbulb,
  ChevronDown, ChevronUp, Zap, Target,
} from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export function ResumeAnalyzer({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume, setCurrent } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [results, setResults] = useState<{ scores: AnalysisScores; insights: AnalysisInsight[] } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const runAnalysis = () => {
    if (!selected) return;
    setAnalyzing(true);
    setTimeout(() => {
      const { scores, insights } = calculateATSScore(selected.data);
      setResults({ scores, insights });
      setAnalyzing(false);
    }, 1200);
  };

  const scoreEntries = results
    ? Object.entries(results.scores).map(([key, value]) => ({ key, value }))
    : [];

  const radarData = results
    ? [
        { name: 'ATS', value: results.scores.atsCompatibility, fill: '#1c6df5' },
        { name: 'Keywords', value: results.scores.keywordOptimization, fill: '#04042c' },
        { name: 'Format', value: results.scores.formatting, fill: '#f59e0b' },
        { name: 'Grammar', value: results.scores.grammar, fill: '#8b5cf6' },
        { name: 'Professional', value: results.scores.professionalism, fill: '#ec4899' },
        { name: 'Projects', value: results.scores.projects, fill: '#06b6d4' },
        { name: 'Skills', value: results.scores.skills, fill: '#10b981' },
        { name: 'Readability', value: results.scores.readability, fill: '#f97316' },
      ]
    : [];

  const strengths = results?.insights.filter(i => i.type === 'strength') || [];
  const weaknesses = results?.insights.filter(i => i.type === 'weakness') || [];
  const suggestions = results?.insights.filter(i => i.type === 'suggestion') || [];

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="Resume Analyzer" subtitle="Multi-dimensional resume scoring with AI insights" icon={<BarChart3 className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes to analyze" message="Create a resume first, then come back to get detailed multi-dimensional scoring." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Resume Analyzer"
        subtitle="Multi-dimensional resume scoring with AI insights"
        icon={<BarChart3 className="w-6 h-6 text-white" />}
        action={selected && <Button onClick={runAnalysis} disabled={analyzing}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'Run Analysis'}</span></Button>}
      />

      {/* Resume Selector */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setResults(null); setCurrent(r); }}
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
            <Card className="p-16 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-100 rounded-full" />
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
                <Target className="w-8 h-8 text-blue-500 absolute inset-0 m-auto" />
              </div>
              <p className="mt-6 text-sm font-medium text-slate-600">Analyzing your resume across 12 dimensions...</p>
              <div className="flex gap-1.5 mt-3">
                {['ATS', 'Keywords', 'Grammar', 'Skills', 'Projects'].map((label, i) => (
                  <motion.span
                    key={label}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, delay: i * 0.2, duration: 0.6 }}
                    className="text-xs text-slate-400"
                  >
                    {label}
                  </motion.span>
                ))}
              </div>
            </Card>
          </motion.div>
        ) : results ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Overall Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-slate-600 mb-4 self-start">Overall ATS Score</h3>
                <ScoreRing score={results.scores.atsCompatibility} size={180} label="ATS Compatibility" />
                <p className="text-xs text-slate-400 mt-4 text-center">
                  {results.scores.atsCompatibility >= 80 ? 'Excellent ATS compatibility!' : results.scores.atsCompatibility >= 60 ? 'Good — some areas to improve' : 'Needs significant improvement'}
                </p>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h3 className="text-sm font-semibold text-slate-600 mb-4">Dimension Radar</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadialBarChart innerRadius="20%" outerRadius="100%" data={radarData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {radarData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      <span className="text-[10px] text-slate-500">{d.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Detailed Scores */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-600 mb-5">Detailed Score Breakdown</h3>
              <div className="space-y-3">
                {scoreEntries.map((entry, i) => (
                  <ScoreBar key={entry.key} label={formatScoreLabel(entry.key)} score={entry.value} delay={i * 0.05} />
                ))}
              </div>
            </Card>

            {/* Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <InsightColumn title="Strengths" icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} insights={strengths} color="emerald" />
              <InsightColumn title="Weaknesses" icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} insights={weaknesses} color="amber" />
              <InsightColumn title="Suggestions" icon={<Lightbulb className="w-5 h-5 text-blue-500" />} insights={suggestions} color="blue" />
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Ready to Analyze</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Click "Run Analysis" to score your resume across 12 dimensions including ATS compatibility, keyword optimization, formatting, and more.
              </p>
              {selected && (
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <Badge color="blue">{selected.data.experience.length} Experience entries</Badge>
                  <Badge color="green">{selected.data.projects.length} Projects</Badge>
                  <Badge color="amber">{selected.data.skills.length} Skills</Badge>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatScoreLabel(key: string): string {
  const labels: Record<string, string> = {
    atsCompatibility: 'ATS Compatibility',
    keywordOptimization: 'Keyword Optimization',
    formatting: 'Formatting',
    grammar: 'Grammar',
    professionalism: 'Professionalism',
    achievements: 'Achievements',
    projects: 'Projects',
    skills: 'Skills',
    education: 'Education',
    readability: 'Readability',
    actionVerbs: 'Action Verbs',
    overallImpression: 'Overall Impression',
  };
  return labels[key] || key;
}

function InsightColumn({ title, icon, insights, color }: {
  title: string;
  icon: React.ReactNode;
  insights: AnalysisInsight[];
  color: 'emerald' | 'amber' | 'blue';
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <Badge color="slate">{insights.length}</Badge>
      </div>
      <div className="space-y-2">
        {insights.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No items</p>
        ) : (
          insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl border p-3 cursor-pointer ${colors[color]}`}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">{insight.title}</p>
                {expanded === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
              <AnimatePresence>
                {expanded === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-slate-600 mt-2 leading-relaxed"
                  >
                    {insight.detail}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}
