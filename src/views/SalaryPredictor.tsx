import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { suggestCareers } from '@/lib/aiEngine';
import { IndianRupee, TrendingUp, FileText, Zap, Briefcase, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function SalaryPredictor({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [result, setResult] = useState<{ career: string; current: number; range: [number, number]; growth: number; demand: string; factors: string[] } | null>(null);
  const [calculating, setCalculating] = useState(false);

  const selected = resumes.find(r => r.id === selectedId);

  const predict = () => {
    if (!selected) return;
    setCalculating(true);
    setTimeout(() => {
      const careers = suggestCareers(selected.data);
      const top = careers[0];
      const skills = selected.data.skills.length;
      const exp = selected.data.experience.length;
      const projects = selected.data.projects.length;

      const baseLow = 6 + exp * 2 + skills * 0.3;
      const baseHigh = baseLow + 8 + projects * 1.5;
      const current = Math.round((baseLow + baseHigh) / 2);
      const growth = Math.min(35, 12 + skills * 0.8 + exp * 2);

      setResult({
        career: top.role,
        current,
        range: [Math.round(baseLow), Math.round(baseHigh)],
        growth: Math.round(growth),
        demand: skills > 12 ? 'Very High' : skills > 8 ? 'High' : skills > 5 ? 'Moderate' : 'Growing',
        factors: [
          `${skills} technical skills detected`,
          `${exp} years of experience`,
          `${projects} projects in portfolio`,
          `${top.match}% career match for ${top.role}`,
        ],
      });
      setCalculating(false);
    }, 1200);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="AI Salary Prediction" subtitle="Estimate your market value with AI-driven analysis" icon={<IndianRupee className="w-6 h-6 text-white" />} />
        <Card className="p-8"><EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to get salary predictions." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} /></Card>
      </div>
    );
  }

  const growthData = result ? Array.from({ length: 5 }, (_, i) => ({
    year: `Year ${i + 1}`,
    salary: Math.round(result.current * Math.pow(1 + result.growth / 100, i)),
  })) : [];

  return (
    <div>
      <PageHeader title="AI Salary Prediction" subtitle="Estimate your market value with AI-driven analysis" icon={<IndianRupee className="w-6 h-6 text-white" />}
        action={selected && <Button onClick={predict} disabled={calculating}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {calculating ? 'Predicting...' : 'Predict Salary'}</span></Button>}
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
        {calculating ? (
          <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-16 flex flex-col items-center">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <IndianRupee className="w-10 h-10 text-[#3047ff]" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500">Analyzing market data and your profile...</p>
            </Card>
          </motion.div>
        ) : result ? (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 flex flex-col items-center justify-center">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Estimated Current Salary</p>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-7 h-7 text-[#3047ff]" />
                  <span className="text-4xl font-extrabold">{result.current}</span>
                  <span className="text-sm text-slate-400">LPA</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge color="green">Range: ₹{result.range[0]}–{result.range[1]} LPA</Badge>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Expected Annual Growth</p>
                    <p className="text-2xl font-bold text-slate-800">+{result.growth}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Market Demand</p>
                    <p className="text-lg font-bold text-slate-800">{result.demand}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Best-Fit Role</p>
                    <p className="text-sm font-bold text-slate-800">{result.career}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Prediction Factors</h3>
                <div className="space-y-2">
                  {result.factors.map((f, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3047ff]" />
                      <p className="text-xs text-slate-600">{f}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Growth Chart */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">5-Year Salary Growth Projection</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3047ff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#04042c" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`₹${v} LPA`, 'Salary']} />
                  <Area type="monotone" dataKey="salary" stroke="#3047ff" strokeWidth={2} fill="url(#salaryGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eef0ff] flex items-center justify-center mb-4">
                <IndianRupee className="w-8 h-8 text-[#3047ff]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">AI Salary Prediction</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Get an AI-driven salary estimate based on your skills, experience, and projects. See your market value, growth potential, and a 5-year salary projection.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
