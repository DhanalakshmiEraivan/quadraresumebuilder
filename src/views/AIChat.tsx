import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes } from '@/context/ResumeContext';
import { PageHeader, Card, EmptyState, Button } from '@/components/ui';
import type { ViewKey } from '@/components/Sidebar';
import { calculateATSScore } from '@/lib/atsScorer';
import { suggestMissingSkills, suggestCareers, generateSummary } from '@/lib/aiEngine';
import { MessageSquare, FileText, Send, Sparkles, User, Bot } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export function AIChat({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { resumes, currentResume } = useResumes();
  const [selectedId, setSelectedId] = useState<string | null>(currentResume?.id || resumes[0]?.id || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = resumes.find(r => r.id === selectedId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const generateResponse = (question: string): string => {
    if (!selected) return 'Please select a resume first.';
    const data = selected.data;
    const { scores } = calculateATSScore(data);
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('ats') || lowerQ.includes('score')) {
      return `Your current ATS score is ${scores.atsCompatibility}/100. Here's the breakdown:\n\n• Keyword Optimization: ${scores.keywordOptimization}%\n• Action Verbs: ${scores.actionVerbs}%\n• Skills Coverage: ${scores.skills}%\n• Projects: ${scores.projects}%\n• Professionalism: ${scores.professionalism}%\n\n${scores.atsCompatibility >= 80 ? 'Excellent! Your resume is well-optimized.' : scores.atsCompatibility >= 60 ? 'Good progress. Focus on improving keyword density and adding more action verbs.' : 'Your resume needs significant improvement. Try adding more quantified achievements and industry keywords.'}`;
    }

    if (lowerQ.includes('improve') || lowerQ.includes('better')) {
      const missing = suggestMissingSkills(data);
      const tips: string[] = [];
      if (data.summary.length < 50) tips.push('• Add a compelling professional summary at the top');
      if (data.skills.length < 10) tips.push(`• Expand your skills section (currently ${data.skills.length}, aim for 15+)`);
      if (data.projects.length < 2) tips.push('• Add more projects to showcase hands-on experience');
      if (missing.length > 0) tips.push(`• Add these in-demand skills: ${missing.slice(0, 5).join(', ')}`);
      if (!/\d+%/.test(data.experience.flatMap(e => e.bullets).join(' '))) tips.push('• Add quantified metrics to your experience (e.g., "improved performance by 40%")');
      return `Here are personalized ways to improve your resume:\n\n${tips.join('\n')}\n\nWould you like me to help with any specific area?`;
    }

    if (lowerQ.includes('remove') || lowerQ.includes('delete') && lowerQ.includes('project')) {
      return `When deciding which projects to keep or remove, consider these criteria:\n\n1. Relevance to your target role\n2. Technical complexity and impact\n3. Quantifiable results or metrics\n4. Recency of the project\n\nYour current projects: ${data.projects.map(p => p.name).join(', ') || 'None yet'}\n\nKeep the 2-3 most relevant and impactful ones. Quality over quantity!`;
    }

    if (lowerQ.includes('rewrite') || lowerQ.includes('experience')) {
      if (data.experience.length === 0) return 'You don\'t have any experience entries yet. Add some in the Resume Builder!';
      const exp = data.experience[0];
      return `Here's how I'd suggest improving your first experience entry:\n\nCurrent: ${exp.bullets[0] || 'No description yet'}\n\nTips:\n• Start with a strong action verb\n• Include quantified metrics\n• Mention the tech stack used\n• Focus on impact, not just tasks\n\nUse the AI Enhance button in the Resume Builder to automatically improve your bullet points!`;
    }

    if (lowerQ.includes('career') || lowerQ.includes('job') || lowerQ.includes('role')) {
      const careers = suggestCareers(data).slice(0, 3);
      return `Based on your skills, here are the top career paths for you:\n\n${careers.map(c => `• ${c.role} — ${c.match}% match (${c.salaryRange})`).join('\n')}\n\nVisit the Career Suggestions page for more details!`;
    }

    if (lowerQ.includes('summary') || lowerQ.includes('about')) {
      const summary = generateSummary(data);
      return `Here's a suggested professional summary for you:\n\n"${summary}"\n\nYou can use this in your resume or LinkedIn profile. Would you like me to adjust the tone or focus?`;
    }

    if (lowerQ.includes('skill') || lowerQ.includes('missing')) {
      const missing = suggestMissingSkills(data);
      return `Based on your profile, recruiters would expect these skills:\n\n${missing.map(s => `• ${s}`).join('\n')}\n\nAdding these to your resume and actually learning them will significantly boost your job prospects!`;
    }

    return `I can help you with:\n\n• Analyzing your ATS score and explaining why it's low\n• Suggesting improvements for your resume\n• Rewriting experience descriptions\n• Recommending career paths\n• Identifying missing skills\n• Generating a professional summary\n\nWhat would you like to know about your resume?`;
  };

  const send = () => {
    if (!input.trim() || !selected) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const response = generateResponse(userMsg.content);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      setThinking(false);
    }, 800 + Math.random() * 600);
  };

  if (resumes.length === 0) {
    return (
      <div>
        <PageHeader title="AI Resume Chat" subtitle="Ask questions about your resume and get instant AI insights" icon={<MessageSquare className="w-6 h-6 text-white" />} />
        <Card className="p-8">
          <EmptyState icon={<FileText className="w-8 h-8" />} title="No resumes available" message="Create a resume first to start chatting with the AI assistant." action={<Button onClick={() => onNavigate('builder')}>Create Resume</Button>} />
        </Card>
      </div>
    );
  }

  const suggestions = [
    'How can I improve my resume?',
    'Why is my ATS score low?',
    'What skills am I missing?',
    'Suggest a career path for me',
  ];

  return (
    <div>
      <PageHeader
        title="AI Resume Chat"
        subtitle="Ask questions about your resume and get instant AI insights"
        icon={<MessageSquare className="w-6 h-6 text-white" />}
      />

      <Card className="p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setMessages([]); }}
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

      <Card className="flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#04042c] flex items-center justify-center mb-4 pulse-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Ask me anything about your resume</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mb-6">I can analyze your score, suggest improvements, rewrite content, and more.</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-sm font-medium transition-all border border-slate-200 hover:border-blue-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-[#04042c] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-sm'
                  : 'bg-slate-50 text-slate-700 rounded-tl-sm'
              }`}>
                {msg.content.split('\n').map((line, li) => (
                  <p key={li} className={line.trim() === '' ? 'h-2' : 'mb-1'}>{line}</p>
                ))}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </motion.div>
          ))}

          {thinking && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#04042c] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about your resume..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <Button onClick={send} disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
