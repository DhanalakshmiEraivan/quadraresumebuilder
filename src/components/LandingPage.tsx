import { motion } from 'framer-motion';
import {
  ArrowRight, BarChart3, BrainCircuit, Briefcase, Check, FileText,
  LockKeyhole, Menu, Sparkles, Target, Wand2, X,
} from 'lucide-react';
import { useState } from 'react';

type PublicPage = 'home' | 'about' | 'features' | 'pricing' | 'contact';

const images = {
  hero: '/media/ai-resume-hero.svg',
  builder: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85',
  career: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85',
  interview: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85',
};

export function LandingPage({ onEnterBuilder, onNavigatePage }: {
  onEnterBuilder: () => void;
  onNavigatePage: (page: PublicPage) => void;
}) {
  const [open, setOpen] = useState(false);
  const nav = (page: PublicPage) => { setOpen(false); onNavigatePage(page); };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#04042c]">
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#e7e9f0]">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <button onClick={() => nav('home')} className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#04042c] text-white flex items-center justify-center"><Sparkles size={18} /></div>
            <div><b className="font-extrabold">QuadraResume</b><span className="block text-[9px] uppercase tracking-[.2em] text-[#8b91a3]">by QuadraFroyn Solutions</span></div>
          </button>
          <div className="hidden lg:flex items-center gap-7 text-sm font-bold text-[#697086]">
            <button onClick={() => nav('about')}>About Us</button>
            <button onClick={() => nav('features')}>Features</button>
            <button onClick={() => nav('pricing')}>Pricing</button>
            <button onClick={() => nav('contact')}>Contact Us</button>
            <button onClick={onEnterBuilder} className="text-[#3047ff]">AI Resume Builder</button>
          </div>
          <button onClick={onEnterBuilder} className="btn btn-primary hidden sm:flex">AI Resume Builder <ArrowRight size={15} /></button>
          <button className="lg:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="lg:hidden px-5 pb-5 space-y-3 text-sm font-bold bg-white">
            <button className="block" onClick={() => nav('about')}>About Us</button>
            <button className="block" onClick={() => nav('features')}>Features</button>
            <button className="block" onClick={() => nav('pricing')}>Pricing</button>
            <button className="block" onClick={() => nav('contact')}>Contact Us</button>
            <button onClick={onEnterBuilder} className="btn btn-primary w-full">AI Resume Builder</button>
          </div>
        )}
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-5 pt-14 md:pt-24 pb-24 grid lg:grid-cols-[.92fr_1.08fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e3e6ef] text-xs font-extrabold"><span className="w-2 h-2 rounded-full bg-[#3047ff]" /> AI career intelligence platform</span>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black leading-[.94] mt-6">Create a resume that <span className="text-[#3047ff]">gets noticed.</span></motion.h1>
            <p className="text-lg text-[#697086] max-w-xl mt-7 leading-8">A premium AI workspace for building resumes from a clean canvas, improving ATS performance, tailoring applications and turning your career profile into a reusable system.</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8"><button onClick={onEnterBuilder} className="btn btn-primary px-6 py-3.5">Start AI Resume Builder <ArrowRight size={16} /></button><button onClick={() => nav('features')} className="btn btn-soft px-6 py-3.5">Explore features</button></div>
            <div className="grid sm:grid-cols-3 gap-3 mt-9"><Metric value="50+" label="premium templates" /><Metric value="AI" label="career intelligence" /><Metric value="5" label="free actions / month" /></div>
          </div>
          <div className="relative">
            <div className="absolute -inset-5 rounded-[40px] bg-[#3047ff]/10 blur-2xl" />
            <div className="relative rounded-[34px] overflow-hidden border border-white shadow-2xl bg-white">
              <img src={images.hero} alt="Modern professional workspace for career planning" className="w-full h-[500px] object-cover" />
              <div className="absolute left-5 right-5 bottom-5 rounded-2xl bg-[#04042c]/95 backdrop-blur-xl border border-white/10 p-5 text-white">
                <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-white/45">Quadra AI</p><p className="text-lg font-extrabold mt-1">Build. Optimize. Apply.</p></div><span className="px-3 py-1.5 rounded-full bg-[#3047ff] text-[10px] font-extrabold">LIVE WORKSPACE</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-y border-[#e7e9f0]"><div className="max-w-7xl mx-auto px-5 py-16 grid md:grid-cols-4 gap-4">
          {[
            ['01', 'Clean canvas', 'Start without importing a previous resume.'],
            ['02', 'AI guidance', 'Improve every section with role-aware suggestions.'],
            ['03', 'Live design', 'Switch among 50+ layouts and see changes instantly.'],
            ['04', 'Career tools', 'ATS, job match, letters, interviews and more.'],
          ].map(([n, t, d]) => <div className="rounded-2xl bg-[#f8f9fc] border border-[#e7e9f0] p-5" key={n}><p className="text-xs font-black text-[#3047ff]">{n}</p><h3 className="font-extrabold mt-5">{t}</h3><p className="text-xs text-[#697086] mt-2 leading-5">{d}</p></div>)}
        </div></section>

        <section className="max-w-7xl mx-auto px-5 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-[30px] overflow-hidden shadow-xl"><img src={images.builder} alt="Laptop showing a modern digital workspace" className="w-full h-[440px] object-cover" /></div>
          <div><p className="eyebrow">AI Resume Builder</p><h2 className="text-4xl md:text-5xl font-black mt-3">A cleaner way to build from the first line.</h2><p className="text-[#697086] leading-7 mt-5">No confusing import-first workflow. Open the builder, start with a clean profile, choose a visual direction and let AI help you write stronger content without taking control away from you.</p>
            <div className="space-y-4 mt-8">{['Smart section completion','AI summary and bullet improvement','Live ATS score and recommendations','Automatic cloud saving','Instant PDF and print-ready export'].map(x => <div key={x} className="flex gap-3 items-center"><div className="w-7 h-7 rounded-full bg-[#eef0ff] text-[#3047ff] flex items-center justify-center"><Check size={14} /></div><span className="text-sm font-bold">{x}</span></div>)}</div>
            <button onClick={onEnterBuilder} className="btn btn-primary mt-8">Open AI Resume Builder <ArrowRight size={15} /></button>
          </div>
        </section>

        <section className="bg-[#04042c] text-white"><div className="max-w-7xl mx-auto px-5 py-24 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div><p className="text-xs uppercase tracking-[.2em] text-white/40 font-bold">One career profile</p><h2 className="text-4xl md:text-5xl font-black mt-3">Every tool gets smarter from the same structured profile.</h2><p className="text-white/55 leading-7 mt-5 max-w-2xl">Use the resume you build as the foundation for ATS scoring, job matching, cover letters, interview preparation, LinkedIn optimization, recruiter simulation, skill-gap analysis and career planning.</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-8">{[["ATS intelligence", FileText], ["Job matching", Briefcase], ["Career copilot", BrainCircuit], ["Salary insights", BarChart3]].map(([label, Icon]) => <div className="rounded-2xl bg-white/7 border border-white/10 p-4 flex gap-3 items-center" key={String(label)}><Icon size={18} /><span className="font-bold text-sm">{String(label)}</span></div>)}</div>
          </div><img src={images.career} alt="Professionals collaborating on career goals" className="rounded-[30px] h-[440px] w-full object-cover" />
        </div></section>

        <section className="max-w-7xl mx-auto px-5 py-24"><div className="flex flex-col md:flex-row md:items-end justify-between gap-6"><div><p className="eyebrow">Premium templates</p><h2 className="text-4xl md:text-5xl font-black mt-3">Choose the look before you write.</h2><p className="text-[#697086] mt-4 max-w-2xl leading-7">Editorial, executive, technical, academic, creative and ATS-first layouts with real visual previews. No text-only template picker.</p></div><button onClick={onEnterBuilder} className="btn btn-soft">Browse in builder <ArrowRight size={15} /></button></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">{[['Executive','#111827'],['ATS First','#1d4ed8'],['Creative','#7c3aed'],['Technical','#075985']].map(([name, color]) => <div className="rounded-3xl border border-[#e7e9f0] bg-white p-4 shadow-sm" key={name}><div className="h-48 rounded-2xl overflow-hidden bg-[#f3f4f6] relative"><div className="absolute left-0 top-0 bottom-0 w-[28%]" style={{ background: color }} /><div className="absolute left-[36%] right-5 top-7"><div className="h-3 w-3/5 rounded" style={{ background: color }} /><div className="h-1.5 w-2/5 rounded bg-slate-300 mt-2" /><div className="space-y-2 mt-7">{[1,2,3,4].map(i => <div key={i} className="h-1.5 rounded bg-slate-200" style={{ width: `${92-i*8}%` }} />)}</div></div></div><p className="font-extrabold mt-4">{name}</p><p className="text-xs text-[#697086] mt-1">Live visual preview</p></div>)}</div>
        </section>

        <section className="bg-white border-y border-[#e7e9f0]"><div className="max-w-7xl mx-auto px-5 py-24 grid lg:grid-cols-2 gap-12 items-center"><div><p className="eyebrow">Designed for confidence</p><h2 className="text-4xl md:text-5xl font-black mt-3">Make every application feel intentional.</h2><p className="text-[#697086] leading-7 mt-5">Your workspace keeps the design polished while AI helps you focus on evidence, outcomes and role relevance. Every change stays editable and reviewable.</p><div className="grid sm:grid-cols-2 gap-3 mt-8"><Feature icon={Target} title="Evidence-first writing" /><Feature icon={Wand2} title="Role-aware AI suggestions" /><Feature icon={LockKeyhole} title="Private workspace" /><Feature icon={BrainCircuit} title="Connected career tools" /></div></div><img src={images.interview} alt="Professional team preparing for an interview" className="rounded-[30px] h-[430px] w-full object-cover" /></div></section>

        <section className="max-w-7xl mx-auto px-5 py-24"><div className="rounded-[32px] bg-[#eef0ff] border border-[#dfe3ff] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between"><div><p className="eyebrow">Ready to build?</p><h2 className="text-3xl md:text-4xl font-black mt-3">Start your AI resume from a clean canvas.</h2><p className="text-sm text-[#697086] mt-3 max-w-2xl">Create your profile, choose a template, improve it with AI and save it securely in your account.</p></div><button onClick={onEnterBuilder} className="btn btn-primary shrink-0">Launch AI Resume Builder <ArrowRight size={15} /></button></div></section>
      </main>

      <footer className="border-t border-[#e7e9f0] bg-white"><div className="max-w-7xl mx-auto px-5 py-12 grid md:grid-cols-4 gap-8"><div><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-[#04042c] text-white flex items-center justify-center"><Sparkles size={16} /></div><b>QuadraResume</b></div><p className="text-xs text-[#8b91a3] leading-5 mt-4">AI resume creation and career intelligence by QuadraFroyn Solutions.</p></div><FooterLinks title="Company" links={[["About Us",'about'],['Features','features'],['Pricing','pricing'],['Contact Us','contact']]} onNavigate={nav} /><div><p className="font-extrabold text-sm">Product</p><div className="space-y-2 mt-4 text-xs text-[#697086]"><button onClick={onEnterBuilder} className="block hover:text-[#3047ff]">AI Resume Builder</button></div></div><div><p className="font-extrabold text-sm">Trust</p><p className="text-xs text-[#697086] mt-4 leading-6">Private account workspace · Supabase security · automatic saving · reviewable AI assistance.</p></div></div><div className="max-w-7xl mx-auto px-5 py-5 border-t border-[#e7e9f0] text-xs text-[#8b91a3] flex justify-between"><span>© 2026 QuadraFroyn Solutions</span><span>Built for ambitious careers.</span></div></footer>
    </div>
  );
}
function Metric({ value, label }: { value: string; label: string }) { return <div className="card p-4"><p className="text-2xl font-black">{value}</p><p className="text-xs text-[#697086] mt-1">{label}</p></div>; }
function Feature({ icon: Icon, title }: { icon: any; title: string }) { return <div className="rounded-2xl bg-[#f8f9fc] border border-[#e7e9f0] p-4 flex gap-3 items-center"><Icon size={18} className="text-[#3047ff]" /><span className="text-sm font-bold">{title}</span></div>; }
function FooterLinks({ title, links, onNavigate }: { title: string; links: [string,string][]; onNavigate: (page: PublicPage) => void }) { return <div><p className="font-extrabold text-sm">{title}</p><div className="space-y-2 mt-4 text-xs text-[#697086]">{links.map(([label, page]) => <button key={label} onClick={() => onNavigate(page as PublicPage)} className="block hover:text-[#3047ff]">{label}</button>)}</div></div>; }
