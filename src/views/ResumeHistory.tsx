import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button, Badge } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { History, FileText, Trash2, Eye, TrendingUp, Calendar, Plus, Share2, X } from 'lucide-react';
import { ShareModal } from '@/components/ShareModal';
import { TEMPLATES } from '@/lib/templateData';

export function ResumeHistory({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, deleteResume, setCurrent } = useResumes();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [shareResumeId, setShareResumeId] = useState<string | null>(null);

  const previewResume = resumes.find(r => r.id === previewId);
  const shareResume = resumes.find(r => r.id === shareResumeId);
  const shareTemplate = shareResume ? (TEMPLATES.find(t => t.id === shareResume.template) || TEMPLATES[0]) : null;

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="Resume History" subtitle="Track the evolution of your resumes over time" icon={<History className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes yet" message="Your resume history will appear here once you create your first resume." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  const sorted = [...resumes].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <div>
      <PageHeader
        title="Resume History"
        subtitle="Track the evolution of your resumes over time"
        icon={<History className="w-6 h-6 text-white" />}
        action={<Button onClick={() => onNavigate('builder')}><span className="flex items-center gap-2"><Plus className="w-4 h-4" /> New Resume</span></Button>}
      />

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-emerald-200 to-transparent" />

        <div className="space-y-4">
          {sorted.map((resume, i) => {
            const score = resume.ats_score || 0;
            const prevScore = i < sorted.length - 1 ? sorted[i + 1].ats_score || 0 : score;
            const scoreDelta = score - prevScore;

            return (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative pl-16"
              >
                <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 ${
                  score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`} />

                <Card className="p-5 card-lift">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#eef0ff] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-700 truncate">{resume.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <p className="text-xs text-slate-400">
                            {new Date(resume.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge color={score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red'}>
                        ATS {score}
                      </Badge>
                      {i < sorted.length - 1 && scoreDelta !== 0 && (
                        <div className={`flex items-center gap-0.5 text-xs font-medium ${scoreDelta > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          <TrendingUp className={`w-3 h-3 ${scoreDelta < 0 ? 'rotate-180' : ''}`} />
                          {Math.abs(scoreDelta)}
                        </div>
                      )}
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setCurrent(resume); setPreviewId(resume.id); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShareResumeId(resume.id)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Export & Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(resume.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge color="slate">{resume.data.experience.length} Experience</Badge>
                    <Badge color="slate">{resume.data.projects.length} Projects</Badge>
                    <Badge color="slate">{resume.data.skills.length} Skills</Badge>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewResume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="font-semibold text-lg">{previewResume.title}</h2>
                <button onClick={() => setPreviewId(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">✕</button>
              </div>
              <div className="p-8">
                <ResumeDocument resume={previewResume.data} templateId={previewResume.template} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Delete this resume?</h3>
              <p className="text-sm text-slate-500 mt-1">This action cannot be undone. All associated data will be permanently removed.</p>
              <div className="flex gap-2 mt-6">
                <Button variant="secondary" onClick={() => setConfirmDelete(null)} className="flex-1">Cancel</Button>
                <Button onClick={async () => { await deleteResume(confirmDelete); setConfirmDelete(null); }} className="flex-1 !bg-gradient-to-r !from-red-500 !to-red-600">
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export & Share Modal */}
      <AnimatePresence>
        {shareResume && shareTemplate && (
          <ShareModal
            resume={shareResume.data}
            resumeId={shareResume.id}
            title={shareResume.title}
            template={shareTemplate}
            onClose={() => setShareResumeId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


