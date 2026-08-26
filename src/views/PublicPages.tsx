import { ArrowRight, BarChart3, BrainCircuit, Briefcase, Check, FileText, LockKeyhole, Mail, MessageSquare, Send, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, type ComponentType, type ReactNode, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

type Props = { onHome: () => void; onEnterBuilder: () => void };
const img = {
  about: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1500&q=90',
  features: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1500&q=90',
  pricing: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1500&q=90',
  contact: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1500&q=90',
};

function Shell({ children, onHome, onEnterBuilder }: { children: ReactNode; onHome: () => void; onEnterBuilder: () => void }) {
  return <div className="min-h-screen bg-[#f7f8fc] text-[#04042c]"><nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#e7e9f0]"><div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4"><button onClick={onHome} className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#04042c] text-white flex items-center justify-center"><Sparkles size={18} /></div><div><b>QuadraResume</b><span className="block text-[9px] uppercase tracking-[.2em] text-[#8b91a3]">QuadraFroyn Solutions</span></div></button><div className="flex items-center gap-3"><button onClick={onHome} className="btn btn-soft hidden sm:flex">Home</button><button onClick={onEnterBuilder} className="btn btn-primary">AI Resume Builder <ArrowRight size={15} /></button></div></div></nav>{children}<footer className="border-t border-[#e7e9f0] bg-white py-8"><div className="max-w-7xl mx-auto px-5 text-xs text-[#8b91a3] flex justify-between"><span>© 2026 QuadraFroyn Solutions</span><span>AI-powered career intelligence</span></div></footer></div>;
}

export function AboutPage(p: Props) {
  return <Shell {...p}><main><Hero label="ABOUT US" title="A smarter career workspace built around your real goals." text="QuadraResume brings resume creation, AI assistance, ATS intelligence and career preparation into one connected product." image={img.about} /><section className="max-w-7xl mx-auto px-5 py-20 grid lg:grid-cols-3 gap-5">{[['Purpose','Make professional resume creation simpler, faster and more deliberate.'],['Principle','AI should accelerate your thinking while keeping every important decision editable.'],['Vision','Build a career operating system that grows with every application and every role.']].map(([t,d]) => <div className="card p-7" key={t}><p className="text-xs font-black text-[#3047ff] uppercase tracking-[.18em]">{t}</p><h2 className="text-2xl font-black mt-4">{t === 'Purpose' ? 'Less friction.' : t === 'Principle' ? 'AI with control.' : 'One profile. More possibilities.'}</h2><p className="text-sm text-[#697086] leading-6 mt-3">{d}</p></div>)}</section><section className="bg-[#04042c] text-white"><div className="max-w-7xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-10"><div><p className="eyebrow text-white/70">Our product philosophy</p><h2 className="text-4xl font-black mt-3">Structured data. Beautiful documents. Useful intelligence.</h2></div><div className="space-y-5 text-sm text-white/60 leading-7"><p>QuadraResume is designed so your resume is not a static document. It becomes a structured career profile that can power ATS analysis, job matching, cover letters, interviews, LinkedIn optimization and career planning.</p><p>Security, automatic saving and human-reviewable AI are part of the product experience rather than afterthoughts.</p></div></div></section></main></Shell>;
}

export function FeaturesPage(p: Props) {
  const cards: Array<[string, ComponentType<any>, string]> = [['AI Resume Builder',FileText,'Clean-canvas editor, live preview, ATS scoring, AI writing assistance and automatic saving.'],['ATS Intelligence',BarChart3,'Understand keyword coverage, structure, readability and role alignment.'],['Job Match',Briefcase,'Compare your profile against a job description and surface actionable gaps.'],['Career Copilot',BrainCircuit,'Ask career questions and turn your resume data into personalized next steps.'],['AI Rewrite',Wand2,'Improve summaries, bullets and achievements while keeping your voice editable.'],['Private Workspace',LockKeyhole,'Account-scoped data, Supabase authentication and protected resume assets.']];
  return <Shell {...p}><main><Hero label="FEATURES" title="A complete AI career toolkit, not just a resume editor." text="Build once, improve continuously and use the same structured profile across the entire application journey." image={img.features} /><section className="max-w-7xl mx-auto px-5 py-20"><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{cards.map(([t,I,d]) => <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="card p-7" key={t}><I size={23} className="text-[#3047ff]" /><h3 className="text-xl font-black mt-6">{t}</h3><p className="text-sm text-[#697086] leading-6 mt-3">{d}</p></motion.div>)}</div></section><section className="max-w-7xl mx-auto px-5 pb-20"><div className="rounded-[30px] bg-white border border-[#e7e9f0] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"><div><p className="eyebrow">Built to compound</p><h2 className="text-3xl font-black mt-3">Every improvement becomes reusable career intelligence.</h2></div><button onClick={p.onEnterBuilder} className="btn btn-primary">Start building <ArrowRight size={15} /></button></div></section></main></Shell>;
}

export function PublicPricingPage(p: Props) {
  return <Shell {...p}><main><Hero label="PRICING" title="Start free, then scale when your career search gets serious." text="One simple free allowance for the entire platform, with an unlimited option for users who need more." image={img.pricing} /><section className="max-w-5xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-5"><Plan title="Free" price="₹0" items={['5 total tool actions every month','AI Resume Builder','Premium template previews','ATS and career intelligence','Secure saved workspace']} onClick={p.onEnterBuilder} /><Plan dark title="Unlimited" price="₹199 / month" items={['Unlimited tool actions','All premium templates','Full AI career toolkit','Priority workflows','Admin-verified activation']} onClick={p.onEnterBuilder} /></section><section className="max-w-5xl mx-auto px-5 pb-20 text-center"><p className="text-xs text-[#8b91a3]">Free usage is shared across all tools: the 5 monthly actions are not 5 per tool.</p></section></main></Shell>;
}

export function ContactPage(p: Props) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 5) {
      setError('Please enter your name, a valid email address and a message.');
      return;
    }
    setSending(true);
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim() || 'General enquiry', message: form.message.trim(),
    });
    setSending(false);
    if (insertError) { setError(insertError.message); return; }
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return <Shell {...p}><main>
    <Hero label="CONTACT US" title="Tell us what you need. We'll route it to the right person." text="Questions about QuadraResume, partnerships, billing, product feedback or support? Send a message and our admin console will receive it immediately." image={img.contact} />
    <section className="max-w-7xl mx-auto px-5 pb-24 grid lg:grid-cols-[.75fr_1.25fr] gap-7">
      <div className="p-7 bg-[#04042c] text-white h-fit rounded-3xl border border-white/10 shadow-2xl">
  <p className="text-xs uppercase tracking-[.2em] text-white/60 font-black">
    Support channel
  </p>

  <h2 className="text-3xl font-black mt-4 text-white">
    A real conversation, not a generic form.
  </h2>

  <p className="text-sm text-white/70 leading-7 mt-4">
    Every submitted message is stored securely in the QuadraResume contact
    center. The admin can read it, mark it as read, reply and close the
    conversation.
  </p>

  <div className="mt-8 space-y-4">

    <div className="flex gap-3 items-center text-white">
      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
        <MessageSquare size={17} className="text-white" />
      </div>

      <div>
        <p className="text-sm font-bold text-white">
          Product support
        </p>
        <p className="text-xs text-white/50 mt-0.5">
          Help with your resume and tools
        </p>
      </div>
    </div>

    <div className="flex gap-3 items-center text-white">
      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
        <Mail size={17} className="text-white" />
      </div>

      <div>
        <p className="text-sm font-bold text-white">
          Partnerships & business
        </p>
        <p className="text-xs text-white/50 mt-0.5">
          Business and partnership enquiries
        </p>
      </div>
    </div>

    <div className="flex gap-3 items-center text-white">
      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
        <Send size={17} className="text-white" />
      </div>

      <div>
        <p className="text-sm font-bold text-white">
          Admin replies & follow-up
        </p>
        <p className="text-xs text-white/50 mt-0.5">
          Track your conversation with our team
        </p>
      </div>
    </div>

  </div>
</div>
      <form onSubmit={submit} className="card p-7 bg-white">
        <div className="grid sm:grid-cols-2 gap-4"><label className="text-xs font-bold">Name<input className="field mt-1.5" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Your name" /></label><label className="text-xs font-bold">Email<input type="email" className="field mt-1.5" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@example.com" /></label></div>
        <label className="text-xs font-bold block mt-4">Subject<input className="field mt-1.5" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="How can we help?" /></label>
        <label className="text-xs font-bold block mt-4">Message<textarea className="field mt-1.5 min-h-44 resize-y" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Tell us what you need..." /></label>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        {sent && <p className="text-sm text-emerald-700 mt-3">Message sent successfully. Our admin team can now review and reply to you.</p>}
        <button disabled={sending} className="btn btn-primary mt-5">{sending ? 'Sending…' : 'Send message'} <Send size={15}/></button>
      </form>
    </section>
  </main></Shell>;
}

function Plan({title,price,items,dark,onClick}:{title:string;price:string;items:string[];dark?:boolean;onClick:()=>void}){return <div className={`rounded-[28px] p-8 border ${dark?'bg-[#04042c] text-white border-[#04042c]':'bg-white border-[#e7e9f0]'}`}><p className="font-black text-lg">{title}</p><p className="text-4xl font-black mt-6">{price}</p><ul className="space-y-3 mt-8">{items.map(x => <li key={x} className="flex gap-2 text-sm"><Check size={16} className={dark?'text-white':'text-[#3047ff]'} /><span className={dark?'text-white/70':'text-[#697086]'}>{x}</span></li>)}</ul><button onClick={onClick} className={`btn w-full mt-9 ${dark?'bg-white text-[#04042c]':'btn-primary'}`}>Get started <ArrowRight size={15} /></button></div>}
function Hero({label,title,text,image}:{label:string;title:string;text:string;image:string}){return <section className="max-w-7xl mx-auto px-5 py-16 md:py-24 grid lg:grid-cols-[.9fr_1.1fr] gap-12 items-center"><div><p className="eyebrow">{label}</p><h1 className="text-5xl md:text-6xl font-black leading-[.98] mt-3">{title}</h1><p className="text-lg text-[#697086] leading-8 mt-6 max-w-xl">{text}</p></div><img src={image} alt="QuadraResume professional workspace" className="rounded-[32px] w-full h-[390px] object-cover shadow-xl" /></section>}
