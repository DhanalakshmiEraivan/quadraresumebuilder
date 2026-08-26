import { supabase } from './supabase';
import type { ResumeData } from './types';

const asString = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const asStrings = (value: unknown) => Array.isArray(value)
  ? Array.from(new Set(value.flatMap(item => typeof item === 'string' ? item.split(/[,;|\n]/) : []).map(asString).filter(Boolean)))
  : [];

/** Rejects malformed AI output so a bad model response can never collapse the
 * whole resume into the Skills field. The deterministic parser remains the
 * authoritative fallback when the Edge Function is unavailable. */
export function normalizeImportedResume(value: unknown): Partial<ResumeData> | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const experience = Array.isArray(raw.experience) ? raw.experience.map((item: any) => ({
    id: asString(item?.id) || crypto.randomUUID(),
    role: asString(item?.role), company: asString(item?.company),
    startDate: asString(item?.startDate), endDate: asString(item?.endDate),
    description: asString(item?.description), bullets: asStrings(item?.bullets),
  })).filter(x => x.role || x.company || x.bullets.length) : [];
  const projects = Array.isArray(raw.projects) ? raw.projects.map((item: any) => ({
    id: asString(item?.id) || crypto.randomUUID(), name: asString(item?.name),
    techStack: asStrings(item?.techStack), description: asString(item?.description), link: asString(item?.link),
  })).filter(x => x.name || x.description) : [];
  const education = Array.isArray(raw.education) ? raw.education.map((item: any) => ({
    id: asString(item?.id) || crypto.randomUUID(), degree: asString(item?.degree), institution: asString(item?.institution),
    startDate: asString(item?.startDate), endDate: asString(item?.endDate), grade: asString(item?.grade),
  })).filter(x => x.degree || x.institution) : [];

  const parsed: Partial<ResumeData> = {
    name: asString(raw.name), title: asString(raw.title), email: asString(raw.email), phone: asString(raw.phone),
    location: asString(raw.location), website: asString(raw.website), linkedin: asString(raw.linkedin), summary: asString(raw.summary),
    experience, projects, education, skills: asStrings(raw.skills), achievements: asStrings(raw.achievements),
    certificates: asStrings(raw.certificates), languages: asStrings(raw.languages),
  };

  const meaningful = [parsed.name, parsed.title, parsed.email, parsed.summary, experience.length, projects.length, education.length, parsed.skills?.length].filter(Boolean).length;
  return meaningful >= 2 ? parsed : null;
}

export async function parseResumeWithBackendAI(text: string): Promise<Partial<ResumeData> | null> {
  try {
    const { data, error } = await supabase.functions.invoke('parse-resume', { body: { text } });
    if (error || !data?.data) return null;
    return normalizeImportedResume(data.data);
  } catch {
    return null;
  }
}
