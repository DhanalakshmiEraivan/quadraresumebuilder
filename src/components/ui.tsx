import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between mb-8 flex-wrap gap-4"
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-[#04042c] flex items-center justify-center shadow-lg shadow-blue-500/20">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-sm text-[#697086] mt-1">{subtitle}</p>
        </div>
      </div>
      {action}
    </motion.div>
  );
}

export function Card({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`bg-white rounded-[18px] border border-[#e7e9f0] shadow-[0_10px_35px_rgba(4,4,44,.045)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function ScoreRing({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#04042c' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          className="progress-ring__circle"
        />
      </svg>
      <div className="relative z-10 text-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        {label && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>}
      </div>
    </div>
  );
}

export function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const color = score >= 80 ? 'from-emerald-400 to-emerald-500' : score >= 60 ? 'from-amber-400 to-amber-500' : 'from-red-400 to-red-500';

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-600 w-40 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
        />
      </div>
      <span className="text-sm font-semibold text-slate-700 w-12 text-right">{score}%</span>
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function Badge({ children, color = 'blue' }: { children: ReactNode; color?: 'blue' | 'green' | 'amber' | 'red' | 'slate' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled }: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-[#04042c] text-white shadow-lg shadow-[#04042c]/15 hover:bg-[#0a0a45]',
    secondary: 'bg-white text-[#04042c] border border-[#e7e9f0] hover:bg-[#f7f8fb]',
    ghost: 'text-[#697086] hover:bg-[#f4f5f8]',
  };
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
