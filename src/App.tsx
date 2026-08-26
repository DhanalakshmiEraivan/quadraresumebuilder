
import {useState} from 'react';
import {supabase} from '@/lib/supabase';
import {Sparkles} from 'lucide-react';
import {AnimatePresence,motion} from 'framer-motion';
import {AuthProvider,useAuth} from '@/context/AuthContext';
import {ResumeProvider} from '@/context/ResumeContext';
import {AuthScreen} from '@/components/AuthScreen';
import {LandingPage} from '@/components/LandingPage';
import {Sidebar,type ViewKey} from '@/components/Sidebar';
import {Dashboard} from '@/views/Dashboard';
import {Workspace} from '@/views/Workspace';
import {ResumeBuilder} from '@/views/ResumeBuilder';
import {Settings} from '@/views/Settings';
import {Pricing} from '@/views/Pricing';
import {AdminDashboard} from '@/views/AdminDashboard';
import {ResumeAnalyzer} from '@/views/ResumeAnalyzer';
import {ATSScore} from '@/views/ATSScore';
import {JobMatch} from '@/views/JobMatch';
import {CoverLetter} from '@/views/CoverLetter';
import {InterviewPrep} from '@/views/InterviewPrep';
import {SkillGap} from '@/views/SkillGap';
import {LinkedInOptimizer} from '@/views/LinkedInOptimizer';
import {CareerSuggestions} from '@/views/CareerSuggestions';
import {AIChat} from '@/views/AIChat';
import {ResumeHistory} from '@/views/ResumeHistory';
import {Templates} from '@/views/Templates';
import {RecruiterSim} from '@/views/RecruiterSim';
import {ResumeHeatmap} from '@/views/ResumeHeatmap';
import {SalaryPredictor} from '@/views/SalaryPredictor';
import {KeywordCloud} from '@/views/KeywordCloud';
import {ResumeRewrite} from '@/views/ResumeRewrite';
import {AboutPage, FeaturesPage, PublicPricingPage, ContactPage} from '@/views/PublicPages';

function Content(){const{user,loading,profile}=useAuth();const[entered,setEntered]=useState(false);const[view,setView]=useState<ViewKey>('dashboard');const[publicPage,setPublicPage]=useState<'home'|'about'|'features'|'pricing'|'contact'>('home');const [creditBusy,setCreditBusy]=useState(false);const resetFlow=new URLSearchParams(window.location.search).get('reset')==='1';
 const toolViews:ViewKey[]=['builder','analyzer','ats','jobmatch','coverletter','interview','skillgap','linkedin','careers','chat','recruiter','heatmap','salary','keywords','rewrite'];
 const navigate=async(next:ViewKey)=>{if(next===view)return;if(user&&profile?.plan==='free'&&toolViews.includes(next)&&!creditBusy){setCreditBusy(true);try{const{data,error}=await supabase.rpc('consume_credit',{p_tool:String(next),p_kind:'tool'});if(error){alert('Credit service is unavailable. Run the latest Supabase migration.');return}if(!data?.allowed){alert('You have used all 5 free tool actions for this month. Upgrade to Unlimited for ₹199.');setView('pricing');return}}finally{setCreditBusy(false)}}setView(next)};
 if(loading)return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]"><div className="w-10 h-10 border-4 border-[#dfe2ff] border-t-[#3047ff] rounded-full animate-spin"/></div>;
 if(resetFlow)return <AuthScreen/>;
 if(!user&&!entered){
   const startBuilder=()=>{setView('builder');setEntered(true)};
   if(publicPage==='about')return <AboutPage onHome={()=>setPublicPage('home')} onEnterBuilder={startBuilder}/>;
   if(publicPage==='features')return <FeaturesPage onHome={()=>setPublicPage('home')} onEnterBuilder={startBuilder}/>;
   if(publicPage==='pricing')return <PublicPricingPage onHome={()=>setPublicPage('home')} onEnterBuilder={startBuilder}/>;
   if(publicPage==='contact')return <ContactPage onHome={()=>setPublicPage('home')} onEnterBuilder={startBuilder}/>;
   return <LandingPage onEnterBuilder={startBuilder} onNavigatePage={setPublicPage}/>;
 }
 if(!user)return <AuthScreen/>;const props={onNavigate:navigate};
 const render=()=>{switch(view){
 case'dashboard':return <Dashboard {...props}/>;case'workspace':return <Workspace {...props}/>;case'builder':return <ResumeBuilder {...props}/>;case'settings':return <Settings/>;case'pricing':return <Pricing/>;case'admin':return <AdminDashboard/>;
 case'analyzer':return <ResumeAnalyzer {...props}/>;case'ats':return <ATSScore {...props}/>;case'jobmatch':return <JobMatch {...props}/>;case'coverletter':return <CoverLetter {...props}/>;case'interview':return <InterviewPrep {...props}/>;case'skillgap':return <SkillGap {...props}/>;case'linkedin':return <LinkedInOptimizer {...props}/>;case'careers':return <CareerSuggestions {...props}/>;case'chat':return <AIChat {...props}/>;case'history':return <ResumeHistory {...props}/>;case'templates':return <Templates {...props} onUseTemplate={()=>setView('builder')}/>;case'recruiter':return <RecruiterSim {...props}/>;case'heatmap':return <ResumeHeatmap {...props}/>;case'salary':return <SalaryPredictor {...props}/>;case'keywords':return <KeywordCloud {...props}/>;case'rewrite':return <ResumeRewrite {...props}/>;default:return <Dashboard {...props}/>}
 };
 return <div className="min-h-screen bg-[#f8f9fc] noise"><Sidebar current={view} onNavigate={navigate}/><div className="lg:hidden sticky top-0 z-30 bg-[#04042c] text-white px-4 py-3 flex items-center justify-between"><div className="flex items-center gap-2 font-extrabold"><Sparkles size={16}/> QuadraResume</div><select value={view} onChange={e=>navigate(e.target.value as ViewKey)} className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs"><option value="dashboard">Dashboard</option><option value="builder">AI Resume Builder</option><option value="workspace">Workspace</option><option value="pricing">Plans</option><option value="settings">Settings</option></select></div><main className="lg:ml-[250px] min-h-screen"><div className="max-w-[1450px] mx-auto p-4 sm:p-6 lg:p-8"><AnimatePresence mode="wait"><motion.div key={view} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.18}}>{render()}</motion.div></AnimatePresence></div></main></div>
}
export default function App(){return <AuthProvider><ResumeProvider><Content/></ResumeProvider></AuthProvider>}
