import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ResumeData } from '@/lib/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export interface SavedResume {
  id: string;
  user_id?: string;
  title: string;
  data: ResumeData;
  ats_score: number;
  template: string;
  created_at: string;
  updated_at: string;
}

interface ResumeContextType {
  resumes: SavedResume[];
  currentResume: SavedResume | null;
  loading: boolean;
  refresh: () => Promise<void>;
  createResume: (title: string, data: ResumeData, template?: string) => Promise<SavedResume | null>;
  updateResume: (id: string, data: Partial<ResumeData>, atsScore?: number, title?: string, template?: string, createVersion?: boolean) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  setCurrent: (resume: SavedResume | null) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [currentResume, setCurrentResume] = useState<SavedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const resumesRef = useRef<SavedResume[]>([]);
  const currentResumeRef = useRef<SavedResume | null>(null);
  useEffect(() => { resumesRef.current = resumes; }, [resumes]);
  useEffect(() => { currentResumeRef.current = currentResume; }, [currentResume]);

  const refresh = useCallback(async () => {
    if (!user) {
      setResumes([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (!error && data) setResumes(data as unknown as SavedResume[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setResumes([]);
      setCurrentResume(null);
      setLoading(false);
      return;
    }

    void refresh();
    const channel = supabase
      .channel(`resume-sync-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resumes', filter: `user_id=eq.${user.id}` }, () => {
        // Realtime refresh updates the dashboard list only. It intentionally does not
        // replace currentResume, because doing that while an input is focused causes
        // controlled fields/cursors to jump and appear to fluctuate while typing.
        void refresh();
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [user, refresh]);

  const createResume = useCallback(async (title: string, data: ResumeData, template = 'quadra-classic') => {
    if (!user) return null;
    const { data: result, error } = await supabase
      .from('resumes')
      .insert({ user_id: user.id, title, data, template, ats_score: 0 })
      .select('*')
      .single();
    if (error) throw error;
    if (!result) return null;

    const saved = result as unknown as SavedResume;
    setCurrentResume(saved);
    setResumes(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    return saved;
  }, [user]);

  const updateResume = useCallback(async (
    id: string,
    data: Partial<ResumeData>,
    atsScore?: number,
    title?: string,
    template?: string,
    createVersion = false,
  ) => {
    const existing = resumesRef.current.find(r => r.id === id)?.data || currentResumeRef.current?.data || {} as ResumeData;
    const mergedData = { ...existing, ...data } as ResumeData;
    const updates: Record<string, unknown> = {
      data: mergedData,
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (template !== undefined) updates.template = template;
    if (mergedData.photoPath) updates.photo_path = mergedData.photoPath;
    if (atsScore !== undefined) updates.ats_score = atsScore;

    const { data: savedRow, error } = await supabase
      .from('resumes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user?.id || '')
      .select('*')
      .single();
    if (error) throw error;

    const saved = savedRow as unknown as SavedResume;
    // Update React state locally instead of fetching/replacing the entire resume.
    // This keeps text inputs stable during rapid typing.
    setCurrentResume(prev => prev?.id === id ? saved : prev);
    setResumes(prev => prev.map(r => r.id === id ? saved : r));

    if (createVersion) {
      const latest = await supabase
        .from('resume_versions')
        .select('version_number')
        .eq('resume_id', id)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextVersion = (latest.data?.version_number || 0) + 1;
      const { error: versionError } = await supabase.from('resume_versions').insert({
        resume_id: id,
        user_id: user?.id,
        version_number: nextVersion,
        data: mergedData,
        ats_score: atsScore ?? saved.ats_score ?? 0,
      });
      if (versionError) throw versionError;
    }
  }, [user?.id]);

  const deleteResume = useCallback(async (id: string) => {
    const { error } = await supabase.from('resumes').delete().eq('id', id).eq('user_id', user?.id || '');
    if (error) throw error;
    if (currentResume?.id === id) setCurrentResume(null);
    setResumes(prev => prev.filter(r => r.id !== id));
  }, [currentResume?.id, user?.id]);

  return (
    <ResumeContext.Provider value={{
      resumes,
      currentResume,
      loading,
      refresh,
      createResume,
      updateResume,
      deleteResume,
      setCurrent: setCurrentResume,
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumes() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResumes must be used within ResumeProvider');
  return ctx;
}
