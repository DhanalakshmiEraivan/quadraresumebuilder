
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock3, FileText, MoreHorizontal, Plus, Search, Sparkles, Trash2, Edit3, Copy, ArrowRight, Settings, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { useResumes } from '@/context/ResumeContext';
import { useAuth } from '@/context/AuthContext';
import type { ViewKey } from '@/components/Sidebar';
import { calculateATSScore } from '@/lib/atsScorer';
import { supabase } from '@/lib/supabase';

export function Dashboard({onNavigate}:{onNavigate:(v:ViewKey)=>void}){
 const {resumes,loading,deleteResume,setCurrent}=useResumes(); const {profile,user}=useAuth();
 const [q,setQ]=useState(''); const [menu,setMenu]=useState<string|null>(null);
 const filtered=useMemo(()=>resumes.filter(r=>r.title.toLowerCase().includes(q.toLowerCase())||(r.data.name||'').toLowerCase().includes(q.toLowerCase())),[resumes,q]);
 const create=()=>{setCurrent(null);onNavigate('builder')};
 const duplicate=async(r:any)=>{await supabase.from('resumes').insert({title:`${r.title} Copy`,data:r.data,template:r.template,ats_score:r.ats_score});setMenu(null)};
 return <div className="space-y-7 reveal">
  <header className="flex flex-col md:flex-row md:items-end justify-between gap-5">
   <div><p className="text-sm text-[#6b7083]">Good to see you, {profile?.full_name||user?.email?.split('@')[0]||'there'}.</p><h1 className="text-3xl font-extrabold mt-1">Your career workspace.</h1><p className="text-sm text-[#697086] mt-2">Create, manage and improve every version from one calm dashboard.</p></div>
   <button className="btn btn-primary" onClick={create}><Plus size={17}/> Create new resume</button>
  </header>
  <section className="dark-glass rounded-[24px] overflow-hidden relative min-h-[170px] text-white"><img src="/media/career-hero.svg" alt="QuadraResume career intelligence" className="absolute inset-0 w-full h-full object-cover opacity-30"/><div className="relative p-6 md:p-7 max-w-2xl"><span className="text-[10px] uppercase tracking-[.22em] text-white/45 font-extrabold">Career command center</span><h2 className="text-2xl md:text-3xl font-extrabold mt-2">Your resume is only the beginning.</h2><p className="text-xs md:text-sm text-white/60 mt-2 leading-6">Use the same trusted resume data across ATS analysis, job matching, LinkedIn, cover letters and interview preparation.</p><button onClick={()=>onNavigate('workspace')} className="btn bg-white text-[#04042c] mt-4">Open AI workspace <ArrowRight size={14}/></button></div></section>
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
   {[
    ['Resumes',resumes.length,FileText,'All your saved versions'],
    ['Avg. ATS',resumes.length?Math.round(resumes.reduce((a,r)=>a+r.ats_score,0)/resumes.length):0,BarChart3,'Across saved resumes'],
    ['Plan',profile?.plan||'free',CreditCard,'Current subscription'],
    ['Free actions',profile?.plan==='free'?`${Math.max(0,5-(profile?.monthly_tool_used||0))}/5`:'∞',Sparkles,'Renews monthly']
   ].map(([label,val,Icon,sub],i)=><motion.div whileHover={{y:-3}} key={String(label)} className="card p-5">
    <div className="flex justify-between"><div className="w-10 h-10 rounded-xl bg-[#f0f1ff] flex items-center justify-center"><Icon size={18} className="text-[#3047ff]"/></div><span className="text-[10px] uppercase tracking-widest text-[#9aa0b2]">{i===2?'status':'live'}</span></div>
    <p className="text-2xl font-extrabold mt-5 capitalize">{val}</p><p className="text-sm font-semibold mt-1">{label}</p><p className="text-xs text-[#8b91a3] mt-1">{sub}</p>
   </motion.div>)}
  </div>
  <section className="card overflow-hidden">
   <div className="p-5 border-b border-[#eceef4] flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
    <div><h2 className="font-extrabold">Created resumes</h2><p className="text-xs text-[#8b91a3] mt-1">View, edit, duplicate or delete from your history.</p></div>
    <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0b2]"/><input value={q} onChange={e=>setQ(e.target.value)} className="field pl-9 py-2 text-sm w-64" placeholder="Search resumes"/></div>
   </div>
   {loading?<div className="p-10 text-center text-sm text-[#8b91a3]">Loading your resumes…</div>:filtered.length===0?<div className="p-14 text-center"><div className="w-14 h-14 rounded-2xl bg-[#f0f1ff] mx-auto flex items-center justify-center"><FileText className="text-[#3047ff]"/></div><h3 className="font-extrabold mt-4">Your resume library is empty</h3><p className="text-sm text-[#8b91a3] mt-1">Start from scratch or import an existing resume.</p><button onClick={create} className="btn btn-primary mt-5"><Plus size={16}/> Build my first resume</button></div>:
   <div className="divide-y divide-[#eceef4]">{filtered.map(r=>{const score=r.ats_score||calculateATSScore(r.data).scores.atsCompatibility;return <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-[#fbfbfe]">
    <div className="w-12 h-14 rounded-lg bg-[#04042c] text-white flex items-center justify-center"><FileText size={19}/></div>
    <div className="flex-1 min-w-0"><h3 className="font-bold truncate">{r.title}</h3><p className="text-xs text-[#8b91a3] mt-1">{r.data.name||'No name yet'} · Updated {new Date(r.updated_at).toLocaleDateString()}</p></div>
    <div className="flex items-center gap-2"><div className="text-right mr-2"><p className="text-xs text-[#8b91a3]">ATS</p><p className="font-extrabold">{score}/100</p></div>
     <button className="btn btn-soft px-3" onClick={()=>{setCurrent(r);onNavigate('builder')}}><Edit3 size={15}/> Edit</button>
     <div className="relative"><button className="btn btn-soft px-2.5" onClick={()=>setMenu(menu===r.id?null:r.id)}><MoreHorizontal size={16}/></button>{menu===r.id&&<div className="absolute right-0 top-11 z-20 w-44 bg-white border border-[#e4e6ef] shadow-xl rounded-xl p-1.5">
       <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm flex gap-2" onClick={()=>duplicate(r)}><Copy size={14}/> Duplicate</button>
       <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-sm flex gap-2" onClick={()=>{deleteResume(r.id);setMenu(null)}}><Trash2 size={14}/> Delete</button>
     </div>}</div>
    </div>
   </div>})}</div>}
  </section>
  <div className="grid md:grid-cols-3 gap-4">
   <button onClick={()=>onNavigate('workspace')} className="card p-5 text-left hover:shadow-xl transition"><Zap className="text-[#3047ff]"/><h3 className="font-extrabold mt-4">AI Career Workspace</h3><p className="text-xs text-[#7d8396] mt-1">ATS, job matching, LinkedIn, cover letters and more.</p><span className="text-xs font-bold mt-4 inline-flex items-center gap-1">Open workspace <ArrowRight size={13}/></span></button>
   <button onClick={()=>onNavigate('settings')} className="card p-5 text-left hover:shadow-xl transition"><Settings className="text-[#3047ff]"/><h3 className="font-extrabold mt-4">Personal settings</h3><p className="text-xs text-[#7d8396] mt-1">Profile, preferences, privacy and account controls.</p></button>
   <button onClick={()=>onNavigate('pricing')} className="dark-glass text-white rounded-[18px] p-5 text-left hover:-translate-y-1 transition"><ShieldCheck/><h3 className="font-extrabold mt-4">Unlock unlimited</h3><p className="text-xs text-white/60 mt-1">Unlimited AI career tools for ₹199/month after admin approval.</p></button>
  </div>
 </div>
}
