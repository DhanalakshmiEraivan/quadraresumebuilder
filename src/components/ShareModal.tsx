import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResumeData } from '@/lib/types';
import type { TemplateDef } from '@/lib/templateData';
import { ResumeRenderer } from '@/components/ResumeRenderer';
import {
  downloadResumeAsPDF, printResume, downloadResumeAsHTML,
  downloadResumeAsText, shareViaEmail, shareViaWhatsApp,
  shareViaTelegram, copyResumeToClipboard, copyResumeLink,
} from '@/lib/exportUtils';
import {
  X, Download, Printer, Mail, MessageCircle, Send, Copy,
  FileText, FileType, Link as LinkIcon, Check, FileDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ShareModalProps {
  resume: ResumeData;
  resumeId?: string;
  title: string;
  template: TemplateDef;
  onClose: () => void;
}

interface ExportOption {
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  action: () => void;
  loading?: boolean;
}

export function ShareModal({ resume, resumeId, title, template, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'share'>('download');

  const containerId = 'share-modal-resume';

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadResumeAsPDF(containerId, title);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyResumeToClipboard(resume);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (resumeId) {
      copyResumeLink(resumeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadOptions: ExportOption[] = [
    { label: 'Download PDF', desc: 'ATS-friendly, print-ready', icon: FileDown, color: 'from-red-500 to-rose-500', action: handleDownloadPDF, loading: downloading },
    { label: 'Print Resume', desc: 'Open print dialog', icon: Printer, color: 'from-blue-500 to-cyan-500', action: () => printResume(containerId, title) },
    { label: 'Download HTML', desc: 'Self-contained file', icon: FileType, color: 'from-orange-500 to-amber-500', action: () => downloadResumeAsHTML(containerId, title) },
    { label: 'Download Text', desc: 'Plain text version', icon: FileText, color: 'from-slate-500 to-slate-600', action: () => downloadResumeAsText(resume, title) },
  ];

  const shareOptions: ExportOption[] = [
    { label: 'Share via Email', desc: 'Opens your mail app', icon: Mail, color: 'from-blue-500 to-blue-600', action: () => shareViaEmail(resume, title) },
    { label: 'Share via WhatsApp', desc: 'Send formatted resume', icon: MessageCircle, color: 'from-green-500 to-emerald-500', action: () => shareViaWhatsApp(resume, title) },
    { label: 'Share via Telegram', desc: 'Send to a chat', icon: Send, color: 'from-sky-500 to-blue-500', action: () => shareViaTelegram(resume, title) },
    { label: 'Copy Resume Text', desc: 'Paste anywhere', icon: Copy, color: 'from-violet-500 to-purple-500', action: handleCopy },
  ];

  const options = activeTab === 'download' ? downloadOptions : shareOptions;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-lg text-slate-800">Export & Share</h2>
            <p className="text-xs text-slate-400">{title} — {template.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 mx-6 mt-4 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('download')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'download' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'share' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Send className="w-4 h-4" /> Share
          </button>
        </div>

        <div className="flex gap-6 p-6 flex-1 min-h-0">
          {/* Left: Options */}
          <div className="w-80 flex-shrink-0 space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                {options.map((opt, i) => {
                  const Icon = opt.icon;
                  return (
                    <motion.button
                      key={opt.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 3 }}
                      onClick={opt.action}
                      disabled={opt.loading}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all text-left disabled:opacity-50"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-slate-700 block">{opt.label}</span>
                        <span className="text-xs text-slate-400">{opt.desc}</span>
                      </div>
                      {opt.loading && <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />}
                    </motion.button>
                  );
                })}

                {activeTab === 'share' && resumeId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <LinkIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-slate-700 block">Copy Share Link</span>
                      <span className="text-xs text-slate-400">Shareable resume URL</span>
                    </div>
                    <button onClick={handleCopyLink} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    </button>
                  </motion.div>
                )}

                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-emerald-600 font-medium pl-2"
                  >
                    <Check className="w-4 h-4" /> Copied to clipboard!
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Resume Preview (used as render target for export) */}
          <div className="flex-1 min-w-0 bg-slate-100 rounded-xl overflow-auto">
            <div className="p-4 flex justify-center">
              <div
                id={containerId}
                className="bg-white shadow-xl"
                style={{ width: '210mm', minHeight: '297mm' }}
              >
                <ResumeRenderer template={template} data={resume} photoUrl={resume.photoUrl} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
