import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import type { ResumeData } from '@/lib/types';
import { TEMPLATES, TEMPLATE_CATEGORIES, type TemplateDef } from '@/lib/templateData';
import { ResumeRenderer } from '@/components/ResumeRenderer';
import { TemplateThumbnail } from '@/components/TemplateThumbnail';
import { printResume, downloadResumeAsHTML, shareViaEmail, shareViaWhatsApp } from '@/lib/exportUtils';
import { PHOTO_URLS } from '@/lib/templateData';
import {
  Plus, Check, X, Crown, Eye, Printer, Download,
  Mail, MessageCircle, Search,
} from 'lucide-react';

export function Templates({ onNavigate, onUseTemplate }: { onNavigate: (view: ViewKey) => void; onUseTemplate?: (templateId: string) => void }) {
  const { resumes, createResume, currentResume } = useResumes();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<TemplateDef | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const sampleData: ResumeData = currentResume?.data || {
    photoUrl: PHOTO_URLS.man1,
    name: 'ALEX MORGAN', title: 'Senior Software Engineer',
    email: 'alex.morgan@email.com', phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA', website: 'alexmorgan.dev', linkedin: 'linkedin.com/in/alexm',
    summary: 'Results-driven software engineer with 6+ years building scalable web applications. Passionate about clean architecture, performance optimization, and mentoring teams. Proven track record of delivering high-impact projects that drive business growth.',
    experience: [
      { id: '1', role: 'Senior Software Engineer', company: 'TechCorp Inc.', startDate: 'Jan 2022', endDate: 'Present', description: '', bullets: ['Architected microservices platform serving 2M+ daily users, reducing latency by 45%', 'Led migration from monolith to microservices, improving deployment frequency by 300%', 'Mentored 5 junior engineers and established code review best practices'] },
      { id: '2', role: 'Full-Stack Developer', company: 'StartupXYZ', startDate: 'Jun 2019', endDate: 'Dec 2021', description: '', bullets: ['Built real-time analytics dashboard processing 1M events/second', 'Implemented CI/CD pipeline reducing deployment time by 80%', 'Developed RESTful API serving 100K+ daily requests'] },
    ],
    projects: [
      { id: 'p1', name: 'CloudFlow Dashboard', techStack: ['React', 'TypeScript', 'AWS'], description: 'Real-time cloud infrastructure monitoring tool used by 200+ teams', link: '' },
      { id: 'p2', name: 'DevPulse API', techStack: ['Node.js', 'PostgreSQL', 'Redis'], description: 'High-performance API gateway handling 10K req/sec with 99.9% uptime', link: '' },
    ],
    education: [{ id: 'e1', degree: 'B.Tech Computer Science', institution: 'Stanford University', startDate: '2015', endDate: '2019', grade: '3.8' }],
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'GraphQL', 'Redis'],
    achievements: ['AWS Solutions Architect Certified', 'Speaker at ReactConf 2023', 'Open source contributor (5K+ GitHub stars)'],
    certificates: ['AWS Certified Solutions Architect', 'Google Cloud Professional Developer'],
    languages: ['English (Native)', 'Spanish (B2)'],
  };

  const filtered = TEMPLATES.filter(t => {
    const matchCat = filter === 'All' || t.category === filter;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const useTemplate = async (template: TemplateDef) => {
    setCreating(true);
    if (onUseTemplate) {
      onUseTemplate(template.id);
    } else {
      const emptyData: ResumeData = {
        name: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '',
        summary: '', experience: [], projects: [], education: [], skills: [],
        achievements: [], certificates: [], languages: [],
      };
      const data = currentResume?.data || emptyData;
      await createResume(`${template.name} Resume`, data, template.id);
      onNavigate('builder');
    }
    setCreating(false);
  };

  const handlePrint = () => {
    printResume('resume-print-area', selected?.name || 'Resume');
  };

  const handleDownload = () => {
    downloadResumeAsHTML('resume-print-area', selected?.name || 'Resume');
  };

  return (
    <div>
      <PageHeader title="Resume Templates" subtitle={`${TEMPLATES.length} premium templates — pick one and start building`} icon={<Plus className="w-6 h-6 text-white" />} />

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates by name, category, or tag..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3047ff] transition-all" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {TEMPLATE_CATEGORIES.map(cat => {
          const count = cat === 'All' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === cat).length;
          if (count === 0) return null;
          return (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${filter === cat ? 'bg-[#04042c] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {cat} <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-slate-500 mb-4">{filtered.length} templates found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((template, i) => (
          <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="cursor-pointer group" onClick={() => { setSelected(template); setPreviewData(sampleData); }}>
            <div className="relative overflow-hidden rounded-xl border-2 border-slate-200 group-hover:border-[#3047ff] transition-all shadow-sm group-hover:shadow-lg bg-white" style={{ height: 340 }}>
              <TemplateThumbnail template={template} className="absolute inset-0"/>
              {template.premium && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><Crown className="w-2.5 h-2.5" /> PREMIUM</span>
                </div>
              )}
              <div className="absolute inset-0 bg-[#04042c]/0 group-hover:bg-[#04042c]/8 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-xs font-semibold text-white bg-[#04042c] px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg"><Eye className="w-4 h-4" /> Preview & Use</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#04042c]">{template.name}</p>
                <p className="text-[10px] text-slate-400">{template.category}</p>
              </div>
              <div className="flex gap-1">
                {template.tags.slice(0, 2).map(tag => <span key={tag} className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{tag}</span>)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && <Card className="p-12 mt-4"><EmptyState icon={<Plus className="w-8 h-8" />} title="No templates found" message="Try a different search term or category filter." /></Card>}

      {/* Full Preview Modal */}
      <AnimatePresence>
        {selected && previewData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto">
              {/* Modal Header with Actions */}
              <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#04042c]">{selected.name}</h2>
                    <p className="text-xs text-slate-400">{selected.category} — {selected.description}</p>
                  </div>
                  {selected.premium && <Badge color="amber"><Crown className="w-3 h-3" /> Premium</Badge>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="secondary" onClick={handlePrint} className="text-xs"><span className="flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" /> Print</span></Button>
                  <Button variant="secondary" onClick={handleDownload} className="text-xs"><span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Download</span></Button>
                  <Button variant="secondary" onClick={() => shareViaEmail(previewData, selected.name)} className="text-xs"><span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span></Button>
                  <Button variant="secondary" onClick={() => shareViaWhatsApp(previewData, selected.name)} className="text-xs"><span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</span></Button>
                  <button onClick={() => setSelected(null)} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
              </div>
              {/* Resume Preview — A4 sized */}
              <div className="p-6 bg-slate-100 flex justify-center">
                <div id="resume-print-area" className="bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm', maxWidth: '100%' }}>
                  <ResumeRenderer template={selected} data={previewData} photoUrl={previewData.photoUrl} />
                </div>
              </div>
              {/* Use Template Button */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-center">
                <Button onClick={() => useTemplate(selected)} disabled={creating} className="w-full max-w-xs">
                  <span className="flex items-center justify-center gap-2">
                    {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    {creating ? 'Creating...' : `Use This Template`}
                  </span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
