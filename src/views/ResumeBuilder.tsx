
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {AnimatePresence,motion} from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Crown,
  Download,
  Eye,
  ImagePlus,
  Loader2,
  Plus,
  Printer,
  Save,
  Share2,
  Sparkles,
  Trash2,
  Wand2,
  X
} from 'lucide-react';
import {useResumes} from '@/context/ResumeContext';
import {useAuth} from '@/context/AuthContext';
import type {ResumeData,ExperienceItem,ProjectItem,EducationItem} from '@/lib/types';
import {calculateATSScore} from '@/lib/atsScorer';
import {TEMPLATES} from '@/lib/templateData';
import {ResumeRenderer} from '@/components/ResumeRenderer';
import {enhanceBulletPoint} from '@/lib/aiEngine';
import {downloadResumeAsPDF,printResume} from '@/lib/exportUtils';
import {supabase,uploadResumePhoto,getResumePhotoUrl,removeResumePhoto} from '@/lib/supabase';
import type {ViewKey} from '@/components/Sidebar';

const empty:ResumeData={name:'',title:'',email:'',phone:'',location:'',website:'',linkedin:'',summary:'',experience:[],projects:[],education:[],skills:[],achievements:[],certificates:[],languages:[]};
type Tab='personal'|'summary'|'experience'|'projects'|'education'|'skills'|'extra';
const tabs:[Tab,string][]=[['personal','Personal'],['summary','Summary'],['experience','Experience'],['projects','Projects'],['education','Education'],['skills','Skills'],['extra','More']];

export function ResumeBuilder({onNavigate}:{onNavigate:(v:ViewKey)=>void}){
 const {currentResume,createResume,updateResume,setCurrent}=useResumes();const{user,profile}=useAuth();
 const[data,setData]=useState<ResumeData>(currentResume?.data||empty);
 const [title,setTitle]=useState(currentResume?.title||'My Resume');const[tab,setTab]=useState<Tab>('personal');const[template,setTemplate]=useState(currentResume?.template||'quadra-classic');
 const [busy,setBusy]=useState(false);const[templatePicker,setTemplatePicker]=useState(false);const[notice,setNotice]=useState('');const[preview,setPreview]=useState(false);
 const previewId='resume-preview';
 const hydratedResumeIdRef=useRef<string|null>(currentResume?.id||null);
 const lastSavedRef=useRef('');
 const saveTimerRef=useRef<number|undefined>(undefined);
 const saveAgainRef=useRef<null|(()=>void)>(null);
 const savingRef=useRef(false);
 const dirtyRef=useRef(false);
 useEffect(()=>{
   if(!currentResume) return;
   if(hydratedResumeIdRef.current===currentResume.id) return;
   hydratedResumeIdRef.current=currentResume.id;
   setData(currentResume.data);
   setTitle(currentResume.title);
   setTemplate(currentResume.template||'quadra-classic');
   lastSavedRef.current=JSON.stringify({data:currentResume.data,title:currentResume.title,template:currentResume.template||'quadra-classic'});
   dirtyRef.current=false;
   if(currentResume.data.photoPath){
     getResumePhotoUrl(currentResume.data.photoPath).then(url=>url&&setData(d=>({...d,photoUrl:url})));
   }
 },[currentResume?.id]);
 useEffect(()=>{
   if(!user) return;
   const snapshot=JSON.stringify({data,title,template});
   if(!lastSavedRef.current){lastSavedRef.current=snapshot;return;}
   if(snapshot===lastSavedRef.current)return;
   dirtyRef.current=true;
   if(saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
   saveAgainRef.current=async()=>{
     if(savingRef.current||!dirtyRef.current)return;
     savingRef.current=true;
     try{
       if(!currentResume){
         const created=await createResume(title,data,template);
         if(!created) throw new Error('Could not create the resume draft.');
       }else{
         await updateResume(currentResume.id,data,calculateATSScore(data).scores.atsCompatibility,title,template,false);
       }
       lastSavedRef.current=JSON.stringify({data,title,template});
       dirtyRef.current=false;
     }catch(err){setNotice(err instanceof Error?err.message:'Auto-save failed')}finally{savingRef.current=false;}
   };
   saveTimerRef.current=window.setTimeout(()=>saveAgainRef.current?.(),700);
   return()=>{if(saveTimerRef.current)window.clearTimeout(saveTimerRef.current)};
 },[data,title,template,currentResume?.id,user,updateResume,createResume]);
 const score=useMemo(()=>calculateATSScore(data).scores.atsCompatibility,[data]);
 const patch=(p:Partial<ResumeData>)=>setData(d=>({...d,...p}));
 const persist=async(next=data)=>{if(!user)return;setBusy(true);try{let id=currentResume?.id;if(!id){const r=await createResume(title,next,template);id=r?.id;if(id)setCurrent(r)}if(id){lastSavedRef.current=JSON.stringify({data:next,title,template});await updateResume(id,next,calculateATSScore(next).scores.atsCompatibility,title,template,true);}setNotice('Saved to your dashboard');setTimeout(()=>setNotice(''),2200)}catch(e){setNotice(e instanceof Error?e.message:'Could not save')}finally{setBusy(false)}};
 const enhanceSummary=()=>{if(!data.summary)return;patch({summary:data.summary.replace(/\s+/g,' ').trim()+' Driven by measurable outcomes, cross-functional collaboration and continuous improvement.'})};
 const addExp=()=>patch({experience:[...data.experience,{id:crypto.randomUUID(),role:'',company:'',startDate:'',endDate:'',description:'',bullets:['']}]});
 const addProj=()=>patch({projects:[...data.projects,{id:crypto.randomUUID(),name:'',techStack:[],description:'',link:''}]});
 const addEdu=()=>patch({education:[...data.education,{id:crypto.randomUUID(),degree:'',institution:'',startDate:'',endDate:'',grade:''}]});
 const improveBullets=()=>patch({experience:data.experience.map(e=>({...e,bullets:e.bullets.map(b=>b.trim()?enhanceBulletPoint(b):b)}))});
 const updateExp=(id:string,p:Partial<ExperienceItem>)=>patch({experience:data.experience.map(x=>x.id===id?{...x,...p}:x)});
 const updateProj=(id:string,p:Partial<ProjectItem>)=>patch({projects:data.projects.map(x=>x.id===id?{...x,...p}:x)});
 const updateEdu=(id:string,p:Partial<EducationItem>)=>patch({education:data.education.map(x=>x.id===id?{...x,...p}:x)});
 const download=()=>downloadResumeAsPDF(previewId,title);
 const field=(label:string,key:keyof ResumeData,placeholder='')=><label className="text-xs font-bold text-[#5f6678] block">{label}<input className="field mt-1.5" value={String(data[key]||'')} placeholder={placeholder} onChange={e=>patch({[key]:e.target.value} as any)}/></label>;
 return <div className="space-y-4">
  <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-3"><div><button onClick={()=>{setCurrent(null);onNavigate('dashboard')}} className="text-xs text-[#697086] flex items-center gap-1 mb-2"><ArrowLeft size={14}/> Back to dashboard</button><div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#04042c] text-white rounded-xl flex items-center justify-center"><Sparkles size={18}/></div><div><input value={title} onChange={e=>setTitle(e.target.value)} className="font-extrabold text-lg bg-transparent outline-none w-72"/><p className="text-xs text-[#8b91a3]">Live editor · {score}/100 ATS · {profile?.plan==='free'?Math.max(0,5-(profile?.monthly_tool_used||0))+' free credits left':'Unlimited plan'}</p></div></div></div>
  <div className="flex flex-wrap gap-2"><button className="btn btn-soft" onClick={()=>setPreview(true)}><Eye size={15}/> Preview</button><button className="btn btn-soft" onClick={()=>download()}><Download size={15}/> PDF</button><button className="btn btn-soft" onClick={()=>printResume(previewId,title)}><Printer size={15}/> Print</button><button className="btn btn-soft" onClick={async()=>{const url=window.location.origin+(currentResume?.id?`?resume=${currentResume.id}`:'');if(navigator.share)await navigator.share({title, text:`My resume — ${data.name||title}`, url});else{await navigator.clipboard.writeText(url);setNotice('Share link copied')}}}><Share2 size={15}/> Share</button><button className="btn btn-primary" disabled={busy} onClick={()=>persist()}>{busy?<Loader2 className="animate-spin" size={15}/>:<Save size={15}/>} Save</button></div></header>
  <div className="card p-4 border border-[#dfe3ff] bg-gradient-to-r from-[#f7f8ff] to-white flex flex-col md:flex-row md:items-center justify-between gap-4"><div><p className="text-sm font-extrabold flex items-center gap-2"><Sparkles size={15} className="text-[#3047ff]"/> Start from a clean AI resume canvas</p><p className="text-xs text-[#697086] mt-1">Build your resume section-by-section with AI assistance, live ATS scoring, automatic saving and instant template switching.</p></div><button className="btn btn-soft text-xs" onClick={()=>setData(empty)}><Trash2 size={14}/> Clear canvas</button></div>
  <div className="grid xl:grid-cols-[minmax(480px,1fr)_minmax(420px,560px)] gap-4 items-start">
   <section className="card overflow-hidden"><div className="p-3 border-b border-[#eceef4] flex gap-1 overflow-x-auto">{tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${tab===k?'bg-[#04042c] text-white':'text-[#697086] hover:bg-[#f5f6fa]'}`}>{l}</button>)}</div>
   <div className="p-5 space-y-5 max-h-[calc(100vh-190px)] overflow-y-auto">
   {tab==='personal'&&<div className="space-y-4"><div className="grid sm:grid-cols-2 gap-3">{field('Full name','name','Jane Doe')}{field('Professional title','title','Product Designer')}{field('Email','email','you@example.com')}{field('Phone','phone','+91 98765 43210')}{field('Location','location','Chennai, India')}{field('Website','website','https://...')}{field('LinkedIn','linkedin','https://linkedin.com/in/...')}</div><label className="text-xs font-bold text-[#5f6678]">Profile photo<div className="mt-2 flex items-center gap-3">{data.photoUrl?<img src={data.photoUrl} className="w-16 h-16 rounded-full object-cover border"/>:<div className="w-16 h-16 rounded-full bg-[#f1f3f8] flex items-center justify-center"><ImagePlus size={18}/></div>}<input type="file" accept="image/jpeg,image/png,image/webp" className="field flex-1" onChange={async e=>{const f=e.target.files?.[0];if(!f||!user)return;if(f.size>5*1024*1024){setNotice('Profile photo must be under 5 MB');return}setBusy(true);try{let id=currentResume?.id;if(!id){const r=await createResume(title,data,template);id=r?.id;if(id)setCurrent(r)}if(id){const old=data.photoPath;const up=await uploadResumePhoto(user.id,id,f);const next={...data,photoPath:up.path,photoUrl:up.signedUrl,photoUpdatedAt:new Date().toISOString()};patch(next);await updateResume(id,next,calculateATSScore(next).scores.atsCompatibility,title,template,true);if(old&&old!==up.path)await removeResumePhoto(old);setNotice('Profile photo saved successfully')}}catch(err){setNotice(err instanceof Error?err.message:'Photo upload failed')}finally{setBusy(false)}}}/></div><span className="text-[11px] text-[#8b91a3]">JPG, PNG or WebP · max 5 MB</span></label></div>}
   {tab==='summary'&&<div><div className="flex justify-between"><label className="text-xs font-bold">Professional summary</label><button className="text-xs font-bold text-[#3047ff] flex gap-1" onClick={enhanceSummary}><Wand2 size={13}/> Improve with AI</button></div><textarea className="field mt-2 min-h-48 resize-y" value={data.summary} onChange={e=>patch({summary:e.target.value})} placeholder="Write a concise, outcome-focused summary…"/></div>}
   {tab==='experience'&&<Section title="Experience" onAdd={addExp}><div className="flex justify-end -mt-2"><button className="text-xs text-[#3047ff] font-bold flex gap-1" onClick={improveBullets}><Wand2 size={13}/> AI improve all bullets</button></div>{data.experience.map(x=><div className="border border-[#e7e9f0] rounded-xl p-4 space-y-3" key={x.id}><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs font-bold">Role<input className="field mt-1" value={x.role} onChange={e=>updateExp(x.id,{role:e.target.value})}/></label><label className="text-xs font-bold">Company<input className="field mt-1" value={x.company} onChange={e=>updateExp(x.id,{company:e.target.value})}/></label><label className="text-xs font-bold">Start<input className="field mt-1" value={x.startDate} onChange={e=>updateExp(x.id,{startDate:e.target.value})}/></label><label className="text-xs font-bold">End<input className="field mt-1" value={x.endDate} onChange={e=>updateExp(x.id,{endDate:e.target.value})}/></label></div><label className="text-xs font-bold">Achievement bullets<textarea className="field mt-1 min-h-24" value={x.bullets.join('\n')} onChange={e=>updateExp(x.id,{bullets:e.target.value.split('\n')})}/></label><button className="text-xs text-red-600 font-bold flex gap-1" onClick={()=>patch({experience:data.experience.filter(y=>y.id!==x.id)})}><Trash2 size={13}/> Remove</button></div>)}</Section>}
   {tab==='projects'&&<Section title="Projects" onAdd={addProj}>{data.projects.map(x=><div className="border border-[#e7e9f0] rounded-xl p-4 space-y-3" key={x.id}><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs font-bold">Project<input className="field mt-1" value={x.name} onChange={e=>updateProj(x.id,{name:e.target.value})}/></label><label className="text-xs font-bold">Tech stack<input className="field mt-1" value={x.techStack.join(', ')} onChange={e=>updateProj(x.id,{techStack:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/></label></div><textarea className="field min-h-24" value={x.description} onChange={e=>updateProj(x.id,{description:e.target.value})} placeholder="What did you build and what changed?"/><button className="text-xs text-red-600 font-bold" onClick={()=>patch({projects:data.projects.filter(y=>y.id!==x.id)})}>Remove</button></div>)}</Section>}
   {tab==='education'&&<Section title="Education" onAdd={addEdu}>{data.education.map(x=><div className="border border-[#e7e9f0] rounded-xl p-4 space-y-3" key={x.id}><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs font-bold">Degree<input className="field mt-1" value={x.degree} onChange={e=>updateEdu(x.id,{degree:e.target.value})}/></label><label className="text-xs font-bold">Institution<input className="field mt-1" value={x.institution} onChange={e=>updateEdu(x.id,{institution:e.target.value})}/></label><label className="text-xs font-bold">Start<input className="field mt-1" value={x.startDate} onChange={e=>updateEdu(x.id,{startDate:e.target.value})}/></label><label className="text-xs font-bold">End<input className="field mt-1" value={x.endDate} onChange={e=>updateEdu(x.id,{endDate:e.target.value})}/></label></div><button className="text-xs text-red-600 font-bold" onClick={()=>patch({education:data.education.filter(y=>y.id!==x.id)})}>Remove</button></div>)}</Section>}
   {tab==='skills'&&<div className="space-y-3"><label className="text-xs font-bold">Skills <span className="font-normal text-[#8b91a3]">press Enter, comma, semicolon or paste a list</span></label><TagInput values={data.skills} onChange={v=>patch({skills:v})} placeholder="Add skill…"/><p className="text-[11px] text-[#8b91a3]">Each skill is stored as an individual value, so ATS analysis and templates can use them reliably.</p></div>}
   {tab==='extra'&&<div className="space-y-4"><label className="text-xs font-bold">Achievements<textarea className="field mt-2 min-h-28" value={data.achievements.join('\n')} onChange={e=>patch({achievements:e.target.value.split('\n')})}/></label><label className="text-xs font-bold">Certificates<textarea className="field mt-2 min-h-28" value={data.certificates.join('\n')} onChange={e=>patch({certificates:e.target.value.split('\n')})}/></label><div><label className="text-xs font-bold">Languages</label><TagInput values={data.languages} onChange={v=>patch({languages:v})} placeholder="Add language…"/><p className="text-[11px] text-[#8b91a3] mt-1">Add as many languages as needed; each language is saved independently.</p></div></div>}
   <div className="flex justify-end pt-2"><button className="btn btn-primary" onClick={()=>persist()}><Save size={14}/> Save section</button></div>
   </div></section>
   <section className="card sticky top-3 overflow-hidden"><div className="p-3 border-b border-[#eceef4] flex items-center justify-between"><div><p className="font-extrabold text-sm">Live document</p><p className="text-[11px] text-[#8b91a3]">Template: {TEMPLATES.find(t=>t.id===template)?.name||template}</p></div><button className="btn btn-soft text-xs" onClick={()=>setTemplatePicker(true)}>Browse 50+ templates <Wand2 size={14}/></button></div><div className="bg-[#e9ebf2] p-4 overflow-auto"><div id={previewId} className="bg-white w-[210mm] min-h-[297mm] mx-auto shadow-xl origin-top transform scale-[.56] md:scale-[.63] xl:scale-[.55] -mb-[330px]"><ResumeRenderer template={TEMPLATES.find(t=>t.id===template)||TEMPLATES[0]} data={data}/></div></div></section>
  </div>
  <AnimatePresence>{preview&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-[#04042c]/70 backdrop-blur-md p-4 md:p-8"><div className="bg-white rounded-2xl h-full overflow-auto relative"><button onClick={()=>setPreview(false)} className="absolute top-4 right-4 z-10 btn btn-primary"><X size={16}/></button><div className="py-8 flex justify-center"><div id="preview-full" className="w-[210mm] min-h-[297mm] shadow-2xl"><ResumeRenderer template={TEMPLATES.find(t=>t.id===template)||TEMPLATES[0]} data={data}/></div></div></div></motion.div>}</AnimatePresence>
  {notice&&<div className="fixed bottom-5 right-5 z-50 bg-[#04042c] text-white rounded-xl px-4 py-3 text-sm shadow-2xl flex gap-2 items-center"><Check size={16}/>{notice}</div>}<AnimatePresence>
  {templatePicker && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-[#04042c]/70 backdrop-blur-md p-3 sm:p-5 md:p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.985 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[28px] h-full w-full max-w-[1500px] mx-auto overflow-hidden flex flex-col shadow-[0_30px_100px_rgba(0,0,0,.28)]"
      >

        {/* HEADER */}
        <div className="shrink-0 bg-white border-b border-[#e7e9f0] px-5 md:px-7 py-5 flex items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#04042c] text-white flex items-center justify-center">
                <Wand2 size={19} />
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-black text-[#04042c]">
                  Choose your resume template
                </h2>

                <p className="text-xs md:text-sm text-[#697086] mt-1">
                  {TEMPLATES.length}+ premium designs · full-page visual previews · ATS-aware layouts
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setTemplatePicker(false)}
            className="shrink-0 h-11 px-4 rounded-xl border border-[#e3e6ef] bg-white hover:bg-[#f7f8fc] text-[#04042c] font-bold text-sm flex items-center gap-2 transition"
          >
            <X size={17} />
            Close
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="shrink-0 px-5 md:px-7 py-4 bg-[#f8f9fc] border-b border-[#e7e9f0]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#3047ff]">
                Live template gallery
              </p>

              <p className="text-xs text-[#697086] mt-1">
                Scroll through the complete resume canvases and click any design to apply it instantly.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#e3e6ef]">
              <span className="w-2 h-2 rounded-full bg-[#3047ff] animate-pulse" />
              <span className="text-[11px] font-bold text-[#697086]">
                {TEMPLATES.length} templates
              </span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE TEMPLATE GALLERY */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain bg-[#eef0f5] px-4 sm:px-6 md:px-8 py-7"
          style={{
            scrollbarWidth: 'thin',
          }}
        >
          <div className="max-w-[1380px] mx-auto">

            {/* RESPONSIVE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">

              {TEMPLATES.map((t, index) => (
                <motion.button
                  key={t.id}
                  type="button"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index * 0.012, 0.25),
                  }}
                  onClick={() => {
                    setTemplate(t.id);
                    setTemplatePicker(false);
                  }}
                  className={[
                    'group text-left rounded-[22px] overflow-hidden bg-white',
                    'border transition-all duration-200',
                    'hover:-translate-y-1 hover:shadow-2xl',
                    template === t.id
                      ? 'border-[#3047ff] ring-4 ring-[#3047ff]/10 shadow-xl'
                      : 'border-[#dfe3eb] shadow-sm',
                  ].join(' ')}
                >

                  {/* TEMPLATE NAME */}
                  <div className="px-4 py-3.5 border-b border-[#edf0f5] bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-sm text-[#04042c] truncate">
                          {t.name}
                        </p>

                        <p className="text-[10px] text-[#8b91a3] mt-1">
                          {t.category}
                          {t.tags?.length
                            ? ` · ${t.tags.slice(0, 2).join(' · ')}`
                            : ''}
                        </p>
                      </div>

                      {t.premium && (
  <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-full bg-[#04042c] text-white text-[8px] font-black tracking-wide">
    PRO
  </span>
)}
                    </div>
                  </div>

                  {/* COMPLETE A4 CANVAS */}
                  <div className="relative h-[405px] overflow-hidden bg-[#e9ebf1]">

                    {/* Canvas shadow */}
                    <div className="absolute inset-x-5 top-5 bottom-0 rounded-sm bg-black/10 blur-xl" />

                    {/* Actual resume */}
                    <div
                      className="absolute left-1/2 top-4 bg-white overflow-hidden"
                      style={{
                        width: '210mm',
                        height: '297mm',
                        transform: 'translateX(-50%) scale(0.365)',
                        transformOrigin: 'top center',
                      }}
                    >
                      <ResumeRenderer
                        template={t}
                        data={data}
                        photoUrl={data.photoUrl}
                      />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#04042c]/0 group-hover:bg-[#04042c]/8 transition-all pointer-events-none" />

                    <div className="absolute left-1/2 bottom-4 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <span className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-[#04042c] text-white text-xs font-black shadow-xl">
                        Use this template
                      </span>
                    </div>

                    {/* Selected */}
                    {template === t.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-9 h-9 rounded-full bg-[#3047ff] text-white flex items-center justify-center shadow-lg">
                          <Check size={17} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FOOTER */}
                  <div className="px-4 py-3 bg-white flex items-center justify-between">
                    <span className="text-[10px] text-[#8b91a3]">
                      Full-page preview
                    </span>

                    <span className="text-[10px] font-black text-[#3047ff] group-hover:underline">
                      Select →
                    </span>
                  </div>
                </motion.button>
              ))}

            </div>

            {/* BOTTOM MESSAGE */}
            <div className="py-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#dfe3eb] shadow-sm">
                <Wand2 size={14} className="text-[#3047ff]" />
                <span className="text-xs font-bold text-[#697086]">
                  You've reached the end · {TEMPLATES.length} complete resume designs
                </span>
              </div>
            </div>

          </div>
        </div>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
 </div>
}
function Section({title,onAdd,children}:{title:string;onAdd:()=>void;children:ReactNode}){return <div className="space-y-3"><div className="flex justify-between items-center"><div><h2 className="font-extrabold">{title}</h2><p className="text-xs text-[#8b91a3]">Keep entries concise and outcome-focused.</p></div><button className="btn btn-soft py-2" onClick={onAdd}><Plus size={14}/> Add</button></div>{children}</div>}

function TagInput({values,onChange,placeholder}:{values:string[];onChange:(v:string[])=>void;placeholder:string}){const [input,setInput]=useState('');const add=(raw:string)=>{const parts=raw.split(/[,;|\n]+/).map(x=>x.trim()).filter(Boolean);if(!parts.length)return;onChange(Array.from(new Set([...values,...parts])));setInput('')};return <div className="field mt-2 min-h-[48px] flex flex-wrap gap-2 items-center">{values.map(v=><span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eef0ff] text-[#3047ff] text-xs font-semibold">{v}<button type="button" onClick={()=>onChange(values.filter(x=>x!==v))}><X size={12}/></button></span>)}<input className="flex-1 min-w-[150px] outline-none bg-transparent text-sm" value={input} placeholder={placeholder} onChange={e=>{if(/[,;|\n]/.test(e.target.value))add(e.target.value);else setInput(e.target.value)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===','||e.key===';'){e.preventDefault();add(input)}}} onPaste={e=>{const t=e.clipboardData.getData('text');if(/[,;|\n]/.test(t)){e.preventDefault();add(t)}}} onBlur={()=>input.trim()&&add(input)}/></div>}
