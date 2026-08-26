import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id:string; full_name:string; avatar_url?:string; phone:string; location:string; job_title:string;
  role:'user'|'admin'; plan:'free'|'unlimited'|'business'; monthly_ai_used:number; monthly_tool_used:number;
  credits_month:string; preferences?:{notifications?:Record<string,boolean>;privacy?:Record<string,boolean>}
}
interface AuthContextType {
  session:Session|null; user:User|null; profile:Profile|null; loading:boolean;
  signIn:(e:string,p:string)=>Promise<{error:string|null}>;
  signUp:(e:string,p:string,n?:string)=>Promise<{error:string|null}>;
  signInWithGoogle:()=>Promise<{error:string|null}>;
  sendPasswordReset:(email:string)=>Promise<{error:string|null}>;
  updatePassword:(password:string)=>Promise<{error:string|null}>;
  signOut:()=>Promise<void>; updateProfile:(p:Partial<Profile>)=>Promise<void>
}
const C=createContext<AuthContextType|undefined>(undefined);

export function AuthProvider({children}:{children:ReactNode}){
 const[session,setSession]=useState<Session|null>(null);const[user,setUser]=useState<User|null>(null);const[profile,setProfile]=useState<Profile|null>(null);const[loading,setLoading]=useState(true);
 const loadProfile=async(uid:string)=>{await supabase.rpc('refresh_monthly_credits');let {data}=await supabase.from('profiles').select('*').eq('id',uid).maybeSingle();if(!data){await new Promise(r=>setTimeout(r,500));({data}=await supabase.from('profiles').select('*').eq('id',uid).maybeSingle())}setProfile(data as Profile|null)};
 useEffect(()=>{supabase.auth.getSession().then(async({data})=>{setSession(data.session);setUser(data.session?.user??null);if(data.session?.user)await loadProfile(data.session.user.id);setLoading(false)});const{data:l}=supabase.auth.onAuthStateChange(async(_,s)=>{setSession(s);setUser(s?.user??null);if(s?.user)await loadProfile(s.user.id);else setProfile(null);setLoading(false)});return()=>l.subscription.unsubscribe()},[]);
 const signIn=async(e:string,p:string)=>{const{error}=await supabase.auth.signInWithPassword({email:e,password:p});return{error:error?.message??null}};
 const signUp=async(e:string,p:string,n?:string)=>{const{error}=await supabase.auth.signUp({email:e,password:p,options:{data:{full_name:n||''}}});return{error:error?.message??null}};
 const signInWithGoogle=async()=>{const{error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});return{error:error?.message??null}};
 const sendPasswordReset=async(email:string)=>{const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}?reset=1`});return{error:error?.message??null}};
 const updatePassword=async(password:string)=>{const{error}=await supabase.auth.updateUser({password});return{error:error?.message??null}};
 const signOut=async()=>{await supabase.auth.signOut()};
 const updateProfile=async(p:Partial<Profile>)=>{if(!user)return;const{data,error}=await supabase.from('profiles').update({...p,updated_at:new Date().toISOString()}).eq('id',user.id).select().single();if(error)throw error;setProfile(data as Profile)};
 return <C.Provider value={{session,user,profile,loading,signIn,signUp,signInWithGoogle,sendPasswordReset,updatePassword,signOut,updateProfile}}>{children}</C.Provider>
}
export function useAuth(){const c=useContext(C);if(!c)throw Error('useAuth must be used within AuthProvider');return c}
