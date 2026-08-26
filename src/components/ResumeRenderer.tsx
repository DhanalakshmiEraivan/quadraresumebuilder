import type { ResumeData } from '@/lib/types';
import type { TemplateDef } from '@/lib/templateData';

interface RendererProps {
  template: TemplateDef;
  data: ResumeData;
  photoUrl?: string;
}

const F = {
  serif: '"Georgia", "Times New Roman", serif',
  sans: '"Inter", system-ui, sans-serif',
  mono: '"Courier New", monospace',
};

// ── Shared helpers ──────────────────────────────────────────────

function ContactItem({ icon, value, light }: { icon: string; value: string; light?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, fontSize: 9.5 }}>
      <span style={{ fontSize: 10, opacity: 0.7 }}>{icon}</span>
      <span style={{ color: light ? 'rgba(255,255,255,0.82)' : '#475569' }}>{value}</span>
    </div>
  );
}

function Bar({ pct, light, color }: { pct: number; light?: boolean; color: string }) {
  return (
    <div style={{ height: 4, background: light ? 'rgba(255,255,255,0.18)' : '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: 4, width: `${pct}%`, background: light ? 'rgba(255,255,255,0.9)' : color, borderRadius: 2 }} />
    </div>
  );
}

function Tag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span style={{ fontSize: 8.5, padding: '2px 8px', background: bg, color, borderRadius: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>;
}

function SecTitle({ children, color, underline = true }: { children: string; color: string; underline?: boolean }) {
  return (
    <div style={{ marginBottom: 8, marginTop: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: 1.8, paddingBottom: 4, borderBottom: underline ? `2px solid ${color}30` : 'none' }}>
        {children}
      </div>
    </div>
  );
}

function ExpItem({ role, company, dates, bullets, accent, side = 'left' }: {
  role: string; company: string; dates: string; bullets: string[]; accent: string; side?: 'left' | 'right';
}) {
  return (
    <div style={{ marginBottom: 13, paddingLeft: side === 'left' ? 12 : 0, borderLeft: side === 'left' ? `2px solid ${accent}40` : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{role}</div>
          <div style={{ fontSize: 10, color: accent, fontWeight: 600 }}>{company}</div>
        </div>
        <div style={{ fontSize: 8.5, color: '#94a3b8', fontStyle: 'italic', flexShrink: 0 }}>{dates}</div>
      </div>
      <ul style={{ margin: '4px 0 0', paddingLeft: 14 }}>
        {bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 9.5, color: '#3b4252', lineHeight: 1.55, marginBottom: 2 }}>{b}</li>)}
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. QUADRA CLASSIC — Navy left sidebar, white right content
// ═══════════════════════════════════════════════════════════════
function T01_QuadraClassic({ data }: { data: ResumeData }) {
  const ac = '#1e3a5f';
  return (
    <div style={{ display: 'flex', minHeight: '100%', fontFamily: F.sans }}>
      <div style={{ width: 195, background: '#f1f5f9', borderRight: `3px solid ${ac}`, padding: '24px 16px', flexShrink: 0 }}>
        <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${ac}25` }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: ac, lineHeight: 1.1 }}>{data.name || 'YOUR NAME'}</div>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 500, marginTop: 3 }}>{data.title || 'Professional Title'}</div>
        </div>
        <SecTitle color={ac}>Contact</SecTitle>
        <ContactItem icon="✉" value={data.email} />
        <ContactItem icon="☎" value={data.phone} />
        <ContactItem icon="◉" value={data.location} />
        <ContactItem icon="↗" value={data.website} />
        <ContactItem icon="in" value={data.linkedin} />
        {data.skills.length > 0 && (
          <>
            <SecTitle color={ac}>Skills</SecTitle>
            {data.skills.slice(0, 8).map((s, i) => (
              <div key={s} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 9.5, fontWeight: 500, color: '#334155', marginBottom: 3 }}>{s}</div>
                <Bar pct={90 - i * 6} color={ac} />
              </div>
            ))}
          </>
        )}
        {data.education.length > 0 && (
          <>
            <SecTitle color={ac}>Education</SecTitle>
            {data.education.map(e => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a' }}>{e.degree}</div>
                <div style={{ fontSize: 9, color: ac, fontWeight: 600 }}>{e.institution}</div>
                <div style={{ fontSize: 8.5, color: '#94a3b8' }}>{e.startDate} – {e.endDate}</div>
                {e.grade && <div style={{ fontSize: 8.5, color: '#94a3b8' }}>GPA: {e.grade}</div>}
              </div>
            ))}
          </>
        )}
        {data.languages.length > 0 && (
          <>
            <SecTitle color={ac}>Languages</SecTitle>
            {data.languages.map(l => <div key={l} style={{ fontSize: 9.5, color: '#475569', marginBottom: 3 }}>• {l}</div>)}
          </>
        )}
      </div>
      <div style={{ flex: 1, padding: '24px 22px' }}>
        {data.summary && <p style={{ fontSize: 10, lineHeight: 1.65, color: '#374151', marginBottom: 4 }}>{data.summary}</p>}
        {data.experience.length > 0 && (
          <>
            <SecTitle color={ac}>Work Experience</SecTitle>
            {data.experience.map(e => <ExpItem key={e.id} role={e.role} company={e.company} dates={`${e.startDate} – ${e.endDate}`} bullets={e.bullets} accent={ac} />)}
          </>
        )}
        {data.projects.length > 0 && (
          <>
            <SecTitle color={ac}>Projects</SecTitle>
            {data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${ac}40` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: ac, fontWeight: 600, marginBottom: 2 }}>{p.techStack.join(' · ')}</div>}
                <div style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.5 }}>{p.description}</div>
              </div>
            ))}
          </>
        )}
        {data.achievements.length > 0 && (
          <>
            <SecTitle color={ac}>Achievements</SecTitle>
            <ul style={{ margin: 0, paddingLeft: 14 }}>
              {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.6, marginBottom: 3 }}>{a}</li>)}
            </ul>
          </>
        )}
        {data.certificates.length > 0 && (
          <>
            <SecTitle color={ac}>Certifications</SecTitle>
            {data.certificates.filter(Boolean).map((c, i) => <div key={i} style={{ fontSize: 9.5, color: '#374151', marginBottom: 4 }}>• {c}</div>)}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. TEAL COMMANDER — Full dark-teal sidebar with photo + skill bars
// ═══════════════════════════════════════════════════════════════
function T02_TealCommander({ data, photoUrl }: { data: ResumeData; photoUrl: string }) {
  const ac = '#0f766e';
  return (
    <div style={{ display: 'flex', minHeight: '100%', fontFamily: F.sans }}>
      <div style={{ width: 205, background: ac, padding: '26px 16px', flexShrink: 0, color: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 78, height: 78, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.45)', margin: '0 auto 10px' }}>
            <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.1 }}>{data.name || 'Your Name'}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.72)', marginTop: 4 }}>{data.title || 'Professional Title'}</div>
        </div>
        <div style={{ fontSize: 8.5, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 8 }}>Contact</div>
        <ContactItem icon="✉" value={data.email} light />
        <ContactItem icon="☎" value={data.phone} light />
        <ContactItem icon="◉" value={data.location} light />
        <ContactItem icon="↗" value={data.website} light />
        {data.skills.length > 0 && (
          <>
            <div style={{ fontSize: 8.5, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.8, marginTop: 16, marginBottom: 10 }}>Skills</div>
            {data.skills.slice(0, 7).map((s, i) => (
              <div key={s} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.9)', marginBottom: 3 }}>{s}</div>
                <Bar pct={94 - i * 7} light color={ac} />
              </div>
            ))}
          </>
        )}
        {data.education.length > 0 && (
          <>
            <div style={{ fontSize: 8.5, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.8, marginTop: 16, marginBottom: 8 }}>Education</div>
            {data.education.map(e => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'white' }}>{e.degree}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.68)' }}>{e.institution}</div>
                <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.48)' }}>{e.startDate} – {e.endDate}</div>
              </div>
            ))}
          </>
        )}
        {data.languages.length > 0 && (
          <>
            <div style={{ fontSize: 8.5, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.8, marginTop: 16, marginBottom: 6 }}>Languages</div>
            {data.languages.map(l => <div key={l} style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.8)', marginBottom: 3 }}>• {l}</div>)}
          </>
        )}
      </div>
      <div style={{ flex: 1, padding: '26px 22px' }}>
        {data.summary && (
          <>
            <SecTitle color={ac}>About Me</SecTitle>
            <p style={{ fontSize: 10, lineHeight: 1.7, color: '#374151' }}>{data.summary}</p>
          </>
        )}
        {data.experience.length > 0 && (
          <>
            <SecTitle color={ac}>Experience</SecTitle>
            {data.experience.map(e => <ExpItem key={e.id} role={e.role} company={e.company} dates={`${e.startDate} – ${e.endDate}`} bullets={e.bullets} accent={ac} />)}
          </>
        )}
        {data.projects.length > 0 && (
          <>
            <SecTitle color={ac}>Projects</SecTitle>
            {data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${ac}40` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: ac, marginBottom: 2 }}>{p.techStack.join(' · ')}</div>}
                <div style={{ fontSize: 9.5, color: '#374151' }}>{p.description}</div>
              </div>
            ))}
          </>
        )}
        {data.achievements.length > 0 && (
          <>
            <SecTitle color={ac}>Achievements</SecTitle>
            <ul style={{ margin: 0, paddingLeft: 14 }}>
              {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.6, marginBottom: 3 }}>{a}</li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. BLUEPRINT BOLD — Full-width blue header, two-column body
// ═══════════════════════════════════════════════════════════════
function T03_BlueprintBold({ data, accent = '#1d4ed8' }: { data: ResumeData; accent?: string }) {
  return (
    <div style={{ fontFamily: F.sans, minHeight: '100%' }}>
      <div style={{ background: accent, padding: '26px 30px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -25, left: 180, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ fontSize: 26, fontWeight: 900, color: 'white', lineHeight: 1, textTransform: 'uppercase', letterSpacing: -0.5 }}>{data.name || 'FULL NAME'}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', marginTop: 5 }}>{data.title || 'Professional Title'}</div>
        <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
          {[data.email, data.phone, data.location].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.12)', padding: '3px 9px', borderRadius: 12 }}>{v}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '20px 22px', gap: 22 }}>
        <div style={{ flex: 1.6 }}>
          {data.summary && (
            <>
              <SecTitle color={accent}>Summary</SecTitle>
              <p style={{ fontSize: 10, lineHeight: 1.65, color: '#374151' }}>{data.summary}</p>
            </>
          )}
          {data.experience.length > 0 && (
            <>
              <SecTitle color={accent}>Work Experience</SecTitle>
              {data.experience.map(e => <ExpItem key={e.id} role={e.role} company={e.company} dates={`${e.startDate} – ${e.endDate}`} bullets={e.bullets} accent={accent} />)}
            </>
          )}
          {data.projects.length > 0 && (
            <>
              <SecTitle color={accent}>Projects</SecTitle>
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{p.name} {p.techStack.length > 0 && <span style={{ fontSize: 9, fontWeight: 400, color: accent }}>— {p.techStack.join(', ')}</span>}</div>
                  <div style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.5 }}>{p.description}</div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ width: 135, flexShrink: 0 }}>
          {data.skills.length > 0 && (
            <>
              <SecTitle color={accent}>Skills</SecTitle>
              {data.skills.map(s => <div key={s} style={{ fontSize: 9, padding: '3px 8px', marginBottom: 4, background: `${accent}12`, color: accent, borderRadius: 4, fontWeight: 600, textAlign: 'center' }}>{s}</div>)}
            </>
          )}
          {data.education.length > 0 && (
            <>
              <SecTitle color={accent}>Education</SecTitle>
              {data.education.map(e => (
                <div key={e.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a' }}>{e.degree}</div>
                  <div style={{ fontSize: 9, color: accent }}>{e.institution}</div>
                  <div style={{ fontSize: 8.5, color: '#94a3b8' }}>{e.startDate} – {e.endDate}</div>
                </div>
              ))}
            </>
          )}
          {data.achievements.length > 0 && (
            <>
              <SecTitle color={accent}>Awards</SecTitle>
              <ul style={{ margin: 0, paddingLeft: 12 }}>
                {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: 9, color: '#374151', lineHeight: 1.5, marginBottom: 3 }}>{a}</li>)}
              </ul>
            </>
          )}
          {data.certificates.length > 0 && (
            <>
              <SecTitle color={accent}>Certs</SecTitle>
              {data.certificates.filter(Boolean).map((c, i) => <div key={i} style={{ fontSize: 9, color: '#374151', marginBottom: 4 }}>• {c}</div>)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. CANVA ELEGANCE — Photo right header, purple accents, pill skills
// ═══════════════════════════════════════════════════════════════
function T04_CanvaElegance({ data, photoUrl, accent = '#7c3aed' }: { data: ResumeData; photoUrl: string; accent?: string }) {
  return (
    <div style={{ fontFamily: F.sans, minHeight: '100%', background: `${accent}05` }}>
      <div style={{ background: 'white', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${accent}` }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#1e1b4b', letterSpacing: -0.5 }}>{data.name || 'YOUR NAME'}</div>
          <div style={{ fontSize: 11.5, color: accent, fontWeight: 600, marginTop: 4 }}>{data.title || 'Professional Title'}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {[data.email, data.phone, data.location].filter(Boolean).map((v, i) => (
              <span key={i} style={{ fontSize: 9, color: '#6b7280' }}>• {v}</span>
            ))}
          </div>
        </div>
        <div style={{ width: 78, height: 78, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accent}`, flexShrink: 0 }}>
          <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20, padding: '20px 24px' }}>
        <div style={{ flex: 1.5 }}>
          {data.summary && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Profile</div>
              <div style={{ height: 2, background: accent, marginBottom: 8 }} />
              <p style={{ fontSize: 10, lineHeight: 1.65, color: '#374151' }}>{data.summary}</p>
            </>
          )}
          {data.experience.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16, marginBottom: 4 }}>Experience</div>
              <div style={{ height: 2, background: accent, marginBottom: 10 }} />
              {data.experience.map(e => <ExpItem key={e.id} role={e.role} company={e.company} dates={`${e.startDate} – ${e.endDate}`} bullets={e.bullets} accent={accent} />)}
            </>
          )}
          {data.projects.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16, marginBottom: 4 }}>Projects</div>
              <div style={{ height: 2, background: accent, marginBottom: 10 }} />
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1e1b4b' }}>{p.name}</div>
                  {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: accent, marginBottom: 3 }}>{p.techStack.join(' · ')}</div>}
                  <div style={{ fontSize: 9.5, color: '#374151' }}>{p.description}</div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ width: 145, flexShrink: 0 }}>
          {data.skills.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Skills</div>
              <div style={{ height: 2, background: accent, marginBottom: 10 }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {data.skills.map(s => <Tag key={s} label={s} color={accent} bg={`${accent}15`} />)}
              </div>
            </>
          )}
          {data.education.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 20, marginBottom: 4 }}>Education</div>
              <div style={{ height: 2, background: accent, marginBottom: 10 }} />
              {data.education.map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: '#1e1b4b' }}>{e.degree}</div>
                  <div style={{ fontSize: 9, color: accent }}>{e.institution}</div>
                  <div style={{ fontSize: 8.5, color: '#6b7280' }}>{e.startDate} – {e.endDate}</div>
                </div>
              ))}
            </>
          )}
          {data.achievements.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 18, marginBottom: 4 }}>Achievements</div>
              <div style={{ height: 2, background: accent, marginBottom: 8 }} />
              <ul style={{ margin: 0, paddingLeft: 12 }}>
                {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: 9, color: '#374151', lineHeight: 1.5, marginBottom: 4 }}>{a}</li>)}
              </ul>
            </>
          )}
          {data.languages.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 18, marginBottom: 4 }}>Languages</div>
              <div style={{ height: 2, background: accent, marginBottom: 6 }} />
              {data.languages.map(l => <div key={l} style={{ fontSize: 9.5, color: '#374151', marginBottom: 3 }}>• {l}</div>)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. MINIMAL PRO — Ultra-clean, thin lines, generous whitespace
// ═══════════════════════════════════════════════════════════════
function T05_MinimalPro({ data }: { data: ResumeData }) {
  return (
    <div style={{ fontFamily: F.sans, padding: '34px 38px', minHeight: '100%', background: '#fff' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 27, fontWeight: 300, color: '#04042c', letterSpacing: -1 }}>{data.name || 'Your Name'}</div>
        <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>{data.title || 'Professional Title'}</div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
          {[data.email, data.phone, data.location, data.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: 9, color: '#94a3b8' }}>{v}</span>
          ))}
        </div>
      </div>
      <div style={{ height: 1, background: '#e2e8f0', marginBottom: 18 }} />
      {data.summary && <p style={{ fontSize: 10, lineHeight: 1.7, color: '#475569', marginBottom: 20 }}>{data.summary}</p>}
      <div style={{ display: 'flex', gap: 28 }}>
        <div style={{ flex: 1.6 }}>
          {data.experience.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Experience</div>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{e.role}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{e.startDate} – {e.endDate}</div>
                  </div>
                  <div style={{ fontSize: 10, color: '#04042c', fontWeight: 500, marginBottom: 4 }}>{e.company}</div>
                  <ul style={{ margin: 0, paddingLeft: 14 }}>
                    {e.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 9.5, color: '#475569', lineHeight: 1.6, marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
          )}
          {data.projects.length > 0 && (
            <>
              <div style={{ height: 1, background: '#e2e8f0', margin: '14px 0 12px' }} />
              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Projects</div>
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                  {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: '#04042c', marginBottom: 2 }}>{p.techStack.join(' · ')}</div>}
                  <div style={{ fontSize: 9.5, color: '#475569' }}>{p.description}</div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ width: 145, flexShrink: 0 }}>
          {data.skills.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Skills</div>
              {data.skills.map(s => (
                <div key={s} style={{ fontSize: 10, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#04042c', flexShrink: 0 }} />{s}
                </div>
              ))}
            </>
          )}
          {data.education.length > 0 && (
            <>
              <div style={{ height: 1, background: '#e2e8f0', margin: '14px 0 12px' }} />
              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Education</div>
              {data.education.map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#0f172a' }}>{e.degree}</div>
                  <div style={{ fontSize: 9.5, color: '#475569' }}>{e.institution}</div>
                  <div style={{ fontSize: 8.5, color: '#94a3b8' }}>{e.startDate} – {e.endDate}</div>
                </div>
              ))}
            </>
          )}
          {data.languages.length > 0 && (
            <>
              <div style={{ height: 1, background: '#e2e8f0', margin: '14px 0 12px' }} />
              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Languages</div>
              {data.languages.map(l => <div key={l} style={{ fontSize: 10, color: '#334155', marginBottom: 4 }}>{l}</div>)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. DARK LUXURY — Charcoal + gold, serif, photo square
// ═══════════════════════════════════════════════════════════════
function T06_DarkLuxury({ data, photoUrl }: { data: ResumeData; photoUrl: string }) {
  const gold = '#b45309';
  return (
    <div style={{ fontFamily: F.serif, minHeight: '100%', background: '#fff' }}>
      <div style={{ background: '#1c1917', padding: '26px 28px', display: 'flex', gap: 22, alignItems: 'center' }}>
        <div style={{ width: 78, height: 78, borderRadius: 6, overflow: 'hidden', border: `2px solid ${gold}`, flexShrink: 0 }}>
          <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 23, fontWeight: 700, color: 'white', letterSpacing: 0.5 }}>{data.name || 'Full Name'}</div>
          <div style={{ fontSize: 11.5, color: gold, marginTop: 4 }}>{data.title || 'Professional Title'}</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            {[data.email, data.phone, data.location].filter(Boolean).map((v, i) => (
              <span key={i} style={{ fontSize: 9, color: '#a8a29e' }}>{v}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 175, background: '#292524', padding: '18px 14px', flexShrink: 0 }}>
          {data.skills.length > 0 && (
            <>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Skills</div>
              {data.skills.slice(0, 8).map((s, i) => (
                <div key={s} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.88)', marginBottom: 3 }}>{s}</div>
                  <Bar pct={90 - i * 6} light color={gold} />
                </div>
              ))}
            </>
          )}
          {data.education.length > 0 && (
            <>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: 2, marginTop: 16, marginBottom: 8 }}>Education</div>
              {data.education.map(e => (
                <div key={e.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, color: 'white' }}>{e.degree}</div>
                  <div style={{ fontSize: 9, color: '#a8a29e' }}>{e.institution}</div>
                  <div style={{ fontSize: 8, color: '#78716c' }}>{e.startDate} – {e.endDate}</div>
                </div>
              ))}
            </>
          )}
          {data.languages.length > 0 && (
            <>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: 2, marginTop: 16, marginBottom: 6 }}>Languages</div>
              {data.languages.map(l => <div key={l} style={{ fontSize: 9.5, color: '#d6d3d1', marginBottom: 4 }}>• {l}</div>)}
            </>
          )}
        </div>
        <div style={{ flex: 1, padding: '18px 22px' }}>
          {data.summary && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Executive Summary</div>
              <div style={{ height: 1, background: '#e7e5e4', marginBottom: 8 }} />
              <p style={{ fontSize: 10, lineHeight: 1.7, color: '#374151', marginBottom: 14 }}>{data.summary}</p>
            </>
          )}
          {data.experience.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Career History</div>
              <div style={{ height: 1, background: '#e7e5e4', marginBottom: 10 }} />
              {data.experience.map(e => <ExpItem key={e.id} role={e.role} company={e.company} dates={`${e.startDate} – ${e.endDate}`} bullets={e.bullets} accent={gold} />)}
            </>
          )}
          {data.projects.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: 2, marginTop: 12, marginBottom: 4 }}>Key Projects</div>
              <div style={{ height: 1, background: '#e7e5e4', marginBottom: 10 }} />
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid ${gold}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                  {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: gold, marginBottom: 2 }}>{p.techStack.join(' · ')}</div>}
                  <div style={{ fontSize: 9.5, color: '#374151' }}>{p.description}</div>
                </div>
              ))}
            </>
          )}
          {data.achievements.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: 2, marginTop: 12, marginBottom: 4 }}>Achievements</div>
              <div style={{ height: 1, background: '#e7e5e4', marginBottom: 8 }} />
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.6, marginBottom: 3 }}>{a}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. EMERALD PROFILE — Green sidebar, timeline experience
// ═══════════════════════════════════════════════════════════════
function T07_EmeraldProfile({ data, photoUrl }: { data: ResumeData; photoUrl: string }) {
  const ac = '#166534';
  return (
    <div style={{ display: 'flex', minHeight: '100%', fontFamily: F.sans }}>
      <div style={{ width: 200, background: ac, padding: '26px 16px', color: 'white', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)', margin: '0 auto 10px' }}>
            <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{data.name || 'Your Name'}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{data.title || 'Title'}</div>
        </div>
        <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Contact</div>
        <ContactItem icon="✉" value={data.email} light />
        <ContactItem icon="☎" value={data.phone} light />
        <ContactItem icon="◉" value={data.location} light />
        {data.skills.length > 0 && (
          <>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16, marginBottom: 10 }}>Skills</div>
            {data.skills.slice(0, 7).map((s, i) => (
              <div key={s} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.9)', marginBottom: 3 }}>{s}</div>
                <Bar pct={92 - i * 7} light color={ac} />
              </div>
            ))}
          </>
        )}
        {data.education.length > 0 && (
          <>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16, marginBottom: 8 }}>Education</div>
            {data.education.map(e => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'white' }}>{e.degree}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)' }}>{e.institution}</div>
              </div>
            ))}
          </>
        )}
        {data.languages.length > 0 && (
          <>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16, marginBottom: 6 }}>Languages</div>
            {data.languages.map(l => <div key={l} style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.8)', marginBottom: 3 }}>• {l}</div>)}
          </>
        )}
      </div>
      <div style={{ flex: 1, padding: '26px 22px' }}>
        {data.summary && (
          <>
            <SecTitle color={ac}>About</SecTitle>
            <p style={{ fontSize: 10, lineHeight: 1.65, color: '#374151' }}>{data.summary}</p>
          </>
        )}
        {data.experience.length > 0 && (
          <>
            <SecTitle color={ac}>Work Experience</SecTitle>
            {data.experience.map(e => (
              <div key={e.id} style={{ marginBottom: 13, paddingLeft: 12, borderLeft: `2px solid ${ac}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{e.role}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8', fontStyle: 'italic' }}>{e.startDate} – {e.endDate}</div>
                </div>
                <div style={{ fontSize: 10, color: ac, fontWeight: 600, marginBottom: 4 }}>{e.company}</div>
                <ul style={{ margin: 0, paddingLeft: 14 }}>
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.5, marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </>
        )}
        {data.projects.length > 0 && (
          <>
            <SecTitle color={ac}>Projects</SecTitle>
            {data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: ac, marginBottom: 2 }}>{p.techStack.join(' · ')}</div>}
                <div style={{ fontSize: 9.5, color: '#374151' }}>{p.description}</div>
              </div>
            ))}
          </>
        )}
        {data.achievements.length > 0 && (
          <>
            <SecTitle color={ac}>Achievements</SecTitle>
            <ul style={{ margin: 0, paddingLeft: 14 }}>
              {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.6, marginBottom: 3 }}>{a}</li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. VIOLET VISION — Deep purple sidebar, photo, pill skills
// ═══════════════════════════════════════════════════════════════
function T08_VioletVision({ data, photoUrl }: { data: ResumeData; photoUrl: string }) {
  const ac = '#4c1d95';
  return (
    <div style={{ display: 'flex', minHeight: '100%', fontFamily: F.sans }}>
      <div style={{ width: 200, background: ac, padding: '26px 16px', flexShrink: 0, color: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)', margin: '0 auto 10px' }}>
            <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.1 }}>{data.name || 'Your Name'}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{data.title || 'Title'}</div>
        </div>
        <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Contact</div>
        <ContactItem icon="✉" value={data.email} light />
        <ContactItem icon="☎" value={data.phone} light />
        <ContactItem icon="◉" value={data.location} light />
        {data.skills.length > 0 && (
          <>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16, marginBottom: 10 }}>Skills</div>
            {data.skills.slice(0, 7).map((s, i) => (
              <div key={s} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.9)', marginBottom: 3 }}>{s}</div>
                <Bar pct={92 - i * 7} light color={ac} />
              </div>
            ))}
          </>
        )}
        {data.education.length > 0 && (
          <>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16, marginBottom: 8 }}>Education</div>
            {data.education.map(e => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'white' }}>{e.degree}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)' }}>{e.institution}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)' }}>{e.startDate} – {e.endDate}</div>
              </div>
            ))}
          </>
        )}
        {data.certificates.length > 0 && (
          <>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16, marginBottom: 8 }}>Certifications</div>
            {data.certificates.filter(Boolean).map((c, i) => <div key={i} style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>• {c}</div>)}
          </>
        )}
      </div>
      <div style={{ flex: 1, padding: '26px 22px' }}>
        {data.summary && (
          <>
            <SecTitle color={ac}>Profile</SecTitle>
            <p style={{ fontSize: 10, lineHeight: 1.65, color: '#374151' }}>{data.summary}</p>
          </>
        )}
        {data.experience.length > 0 && (
          <>
            <SecTitle color={ac}>Experience</SecTitle>
            {data.experience.map(e => <ExpItem key={e.id} role={e.role} company={e.company} dates={`${e.startDate} – ${e.endDate}`} bullets={e.bullets} accent={ac} />)}
          </>
        )}
        {data.projects.length > 0 && (
          <>
            <SecTitle color={ac}>Projects</SecTitle>
            {data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${ac}40` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: ac, marginBottom: 2 }}>{p.techStack.join(' · ')}</div>}
                <div style={{ fontSize: 9.5, color: '#374151' }}>{p.description}</div>
              </div>
            ))}
          </>
        )}
        {data.achievements.length > 0 && (
          <>
            <SecTitle color={ac}>Achievements</SecTitle>
            <ul style={{ margin: 0, paddingLeft: 14 }}>
              {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.6, marginBottom: 3 }}>{a}</li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. DEV STACK — Monospace code-style, dark header, card body
// ═══════════════════════════════════════════════════════════════
function T09_DevStack({ data }: { data: ResumeData }) {
  const ac = '#0369a1';
  return (
    <div style={{ fontFamily: F.mono, minHeight: '100%', background: '#f0f9ff', padding: '26px 28px' }}>
      <div style={{ background: '#04042c', padding: '18px 22px', borderRadius: 8, marginBottom: 18 }}>
        <div style={{ color: '#38bdf8', fontSize: 10, marginBottom: 4 }}>{'// ' + (data.title || 'Software Engineer')}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'white', fontFamily: F.sans }}>{data.name || 'Full Name'}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          {[data.email, data.phone, data.location].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: 9, color: '#94a3b8' }}>{v}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{ flex: 1.6 }}>
          {data.summary && (
            <>
              <div style={{ color: '#64748b', fontSize: 9, marginBottom: 4 }}>{'/** profile */'}</div>
              <p style={{ fontSize: 10, lineHeight: 1.7, color: '#334155', marginBottom: 16 }}>{data.summary}</p>
            </>
          )}
          {data.experience.length > 0 && (
            <>
              <div style={{ color: '#64748b', fontSize: 9, marginBottom: 4 }}>{'/** experience */'}</div>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 12, background: 'white', padding: '10px 14px', borderRadius: 6, borderLeft: `3px solid ${ac}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', fontFamily: F.sans }}>{e.role}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>{e.startDate} – {e.endDate}</div>
                  </div>
                  <div style={{ fontSize: 10, color: ac, fontWeight: 600, marginBottom: 4, fontFamily: F.sans }}>{e.company}</div>
                  <ul style={{ margin: 0, paddingLeft: 14 }}>
                    {e.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 9.5, color: '#475569', lineHeight: 1.5, marginBottom: 2, fontFamily: F.sans }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
          )}
          {data.projects.length > 0 && (
            <>
              <div style={{ color: '#64748b', fontSize: 9, marginTop: 12, marginBottom: 4 }}>{'/** projects */'}</div>
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 10, background: 'white', padding: '10px 14px', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', fontFamily: F.sans }}>{p.name}</div>
                  {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: ac, marginBottom: 2 }}>[{p.techStack.join(', ')}]</div>}
                  <div style={{ fontSize: 9.5, color: '#374151', fontFamily: F.sans }}>{p.description}</div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ width: 135, flexShrink: 0 }}>
          {data.skills.length > 0 && (
            <div style={{ background: 'white', borderRadius: 6, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ color: '#64748b', fontSize: 9, marginBottom: 8 }}>{'/** skills */'}</div>
              {data.skills.map(s => <div key={s} style={{ fontSize: 9.5, color: '#0f172a', marginBottom: 5 }}><span style={{ color: ac }}>&gt; </span>{s}</div>)}
            </div>
          )}
          {data.education.length > 0 && (
            <div style={{ background: 'white', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ color: '#64748b', fontSize: 9, marginBottom: 8 }}>{'/** education */'}</div>
              {data.education.map(e => (
                <div key={e.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', fontFamily: F.sans }}>{e.degree}</div>
                  <div style={{ fontSize: 9, color: ac, fontFamily: F.sans }}>{e.institution}</div>
                  <div style={{ fontSize: 8.5, color: '#64748b' }}>{e.startDate} – {e.endDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. ACADEMIC SERIF — Centered header, gold rules, serif
// ═══════════════════════════════════════════════════════════════
function T10_AcademicSerif({ data }: { data: ResumeData }) {
  const ac = '#1e3a5f';
  const rule = '#c8b97a';
  return (
    <div style={{ fontFamily: F.serif, padding: '34px 42px', minHeight: '100%', background: '#fffff8' }}>
      <div style={{ textAlign: 'center', borderBottom: `1px solid ${rule}`, paddingBottom: 16, marginBottom: 18 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: ac, letterSpacing: 0.5 }}>{data.name || 'Full Name'}</div>
        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 5, fontStyle: 'italic' }}>{data.title || 'Professional Title'}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8, flexWrap: 'wrap' }}>
          {[data.email, data.phone, data.location, data.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: 9.5, color: '#6b7280' }}>{v}</span>
          ))}
        </div>
      </div>
      {data.summary && <p style={{ fontSize: 10.5, lineHeight: 1.75, color: '#374151', textAlign: 'center', fontStyle: 'italic', maxWidth: 580, margin: '0 auto 20px' }}>{data.summary}</p>}
      <div style={{ display: 'flex', gap: 26 }}>
        <div style={{ flex: 1 }}>
          {data.experience.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: ac, borderBottom: `1px solid ${rule}`, paddingBottom: 4, marginBottom: 12, letterSpacing: 0.5 }}>Professional Experience</div>
              {data.experience.map(e => (
                <div key={e.id} style={{ marginBottom: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{e.role}</div>
                    <div style={{ fontSize: 9.5, color: '#64748b', fontStyle: 'italic' }}>{e.startDate} – {e.endDate}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color: ac, fontStyle: 'italic', marginBottom: 4 }}>{e.company}</div>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {e.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 10, color: '#374151', lineHeight: 1.65, marginBottom: 3 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
          )}
          {data.projects.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: ac, borderBottom: `1px solid ${rule}`, paddingBottom: 4, marginTop: 16, marginBottom: 12 }}>Projects</div>
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                  {p.techStack.length > 0 && <div style={{ fontSize: 9, color: ac, fontStyle: 'italic', marginBottom: 3 }}>{p.techStack.join(' · ')}</div>}
                  <div style={{ fontSize: 10, color: '#374151', lineHeight: 1.6 }}>{p.description}</div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ width: 150 }}>
          {data.education.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: ac, borderBottom: `1px solid ${rule}`, paddingBottom: 4, marginBottom: 12 }}>Education</div>
              {data.education.map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a' }}>{e.degree}</div>
                  <div style={{ fontSize: 10, color: ac, fontStyle: 'italic' }}>{e.institution}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>{e.startDate} – {e.endDate}</div>
                  {e.grade && <div style={{ fontSize: 9, color: '#64748b' }}>GPA: {e.grade}</div>}
                </div>
              ))}
            </>
          )}
          {data.skills.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: ac, borderBottom: `1px solid ${rule}`, paddingBottom: 4, marginTop: 16, marginBottom: 10 }}>Skills</div>
              {data.skills.map(s => <div key={s} style={{ fontSize: 9.5, color: '#374151', marginBottom: 4 }}>• {s}</div>)}
            </>
          )}
          {data.achievements.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: ac, borderBottom: `1px solid ${rule}`, paddingBottom: 4, marginTop: 16, marginBottom: 10 }}>Achievements</div>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.6, marginBottom: 4 }}>{a}</li>)}
              </ul>
            </>
          )}
          {data.languages.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: ac, borderBottom: `1px solid ${rule}`, paddingBottom: 4, marginTop: 16, marginBottom: 8 }}>Languages</div>
              {data.languages.map(l => <div key={l} style={{ fontSize: 10, color: '#374151', marginBottom: 4 }}>• {l}</div>)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 11. VIVID SUNRISE — Orange header, creative asymmetric layout
// ═══════════════════════════════════════════════════════════════
function T11_VividSunrise({ data }: { data: ResumeData }) {
  const ac = '#c2410c';
  return (
    <div style={{ fontFamily: F.sans, minHeight: '100%' }}>
      <div style={{ background: `linear-gradient(135deg, ${ac} 0%, #ea580c 100%)`, padding: '26px 30px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: 60, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ fontSize: 25, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: -0.5 }}>{data.name || 'FULL NAME'}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.88)', marginTop: 4 }}>{data.title || 'Professional Title'}</div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
          {[data.email, data.phone, data.location].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: 9, color: 'white', background: 'rgba(255,255,255,0.18)', padding: '3px 9px', borderRadius: 12 }}>{v}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 24px' }}>
        {data.summary && (
          <>
            <SecTitle color={ac}>Profile</SecTitle>
            <p style={{ fontSize: 10, lineHeight: 1.65, color: '#374151' }}>{data.summary}</p>
          </>
        )}
        <div style={{ display: 'flex', gap: 22 }}>
          <div style={{ flex: 1.5 }}>
            {data.experience.length > 0 && (
              <>
                <SecTitle color={ac}>Experience</SecTitle>
                {data.experience.map(e => (
                  <div key={e.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{e.role}</div>
                      <div style={{ fontSize: 9, color: ac, fontWeight: 600, background: `${ac}12`, padding: '2px 8px', borderRadius: 8 }}>{e.startDate} – {e.endDate}</div>
                    </div>
                    <div style={{ fontSize: 10, color: ac, fontWeight: 600, marginBottom: 4 }}>{e.company}</div>
                    <ul style={{ margin: 0, paddingLeft: 14 }}>
                      {e.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.55, marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </>
            )}
            {data.projects.length > 0 && (
              <>
                <SecTitle color={ac}>Projects</SecTitle>
                {data.projects.map(p => (
                  <div key={p.id} style={{ marginBottom: 10, padding: '8px 12px', background: `${ac}08`, borderRadius: 6, borderLeft: `3px solid ${ac}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                    {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: ac, marginBottom: 2 }}>{p.techStack.join(' · ')}</div>}
                    <div style={{ fontSize: 9.5, color: '#374151' }}>{p.description}</div>
                  </div>
                ))}
              </>
            )}
          </div>
          <div style={{ width: 135, flexShrink: 0 }}>
            {data.skills.length > 0 && (
              <>
                <SecTitle color={ac}>Skills</SecTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {data.skills.map(s => <Tag key={s} label={s} color={ac} bg={`${ac}15`} />)}
                </div>
              </>
            )}
            {data.education.length > 0 && (
              <>
                <SecTitle color={ac}>Education</SecTitle>
                {data.education.map(e => (
                  <div key={e.id} style={{ marginBottom: 9 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a' }}>{e.degree}</div>
                    <div style={{ fontSize: 9, color: ac }}>{e.institution}</div>
                    <div style={{ fontSize: 8.5, color: '#94a3b8' }}>{e.startDate} – {e.endDate}</div>
                  </div>
                ))}
              </>
            )}
            {data.achievements.length > 0 && (
              <>
                <SecTitle color={ac}>Awards</SecTitle>
                <ul style={{ margin: 0, paddingLeft: 12 }}>
                  {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: 9, color: '#374151', lineHeight: 1.5, marginBottom: 3 }}>{a}</li>)}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 12. ROSE PORTFOLIO — Pink creative, photo circle, card sections
// ═══════════════════════════════════════════════════════════════
function T12_RosePortfolio({ data, photoUrl }: { data: ResumeData; photoUrl: string }) {
  const ac = '#be185d';
  return (
    <div style={{ fontFamily: F.sans, minHeight: '100%', background: `${ac}05` }}>
      <div style={{ background: 'white', padding: '22px 26px', display: 'flex', gap: 18, alignItems: 'center', borderBottom: `3px solid ${ac}` }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${ac}`, flexShrink: 0 }}>
          <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 23, fontWeight: 900, color: '#831843', letterSpacing: -0.5 }}>{data.name || 'YOUR NAME'}</div>
          <div style={{ fontSize: 11, color: ac, fontWeight: 600, marginTop: 3 }}>{data.title || 'Professional Title'}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            {[data.email, data.phone, data.location].filter(Boolean).map((v, i) => (
              <span key={i} style={{ fontSize: 9, color: '#6b7280' }}>• {v}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, padding: '18px 22px' }}>
        <div style={{ flex: 1.5 }}>
          {data.summary && (
            <div style={{ background: 'white', borderRadius: 8, padding: '12px 16px', marginBottom: 12, borderLeft: `3px solid ${ac}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: ac, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Profile</div>
              <p style={{ fontSize: 10, lineHeight: 1.65, color: '#374151' }}>{data.summary}</p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div style={{ background: 'white', borderRadius: 8, padding: '12px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: ac, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Experience</div>
              {data.experience.map(e => <ExpItem key={e.id} role={e.role} company={e.company} dates={`${e.startDate} – ${e.endDate}`} bullets={e.bullets} accent={ac} />)}
            </div>
          )}
          {data.projects.length > 0 && (
            <div style={{ background: 'white', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: ac, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Projects</div>
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#831843' }}>{p.name}</div>
                  {p.techStack.length > 0 && <div style={{ fontSize: 8.5, color: ac, marginBottom: 3 }}>{p.techStack.join(' · ')}</div>}
                  <div style={{ fontSize: 9.5, color: '#374151' }}>{p.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ width: 140, flexShrink: 0 }}>
          {data.skills.length > 0 && (
            <div style={{ background: 'white', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: ac, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {data.skills.map(s => <Tag key={s} label={s} color={ac} bg={`${ac}12`} />)}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div style={{ background: 'white', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: ac, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Education</div>
              {data.education.map(e => (
                <div key={e.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: '#831843' }}>{e.degree}</div>
                  <div style={{ fontSize: 9, color: ac }}>{e.institution}</div>
                  <div style={{ fontSize: 8.5, color: '#94a3b8' }}>{e.startDate} – {e.endDate}</div>
                </div>
              ))}
            </div>
          )}
          {data.languages.length > 0 && (
            <div style={{ background: 'white', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: ac, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Languages</div>
              {data.languages.map(l => <div key={l} style={{ fontSize: 9.5, color: '#374151', marginBottom: 3 }}>• {l}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



// ── Data-driven premium layout family ───────────────────────────
function DataDrivenTemplate({ data, template, photoUrl }: { data: ResumeData; template: TemplateDef; photoUrl: string }) {
  const ac = template.accentColor;
  const soft = `${ac}12`;
  const photo = template.photoRequired ? photoUrl : '';
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <span style={{ width: 18, height: 2, background: ac, display: 'inline-block' }} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.7, textTransform: 'uppercase', color: ac }}>{title}</span>
      </div>
      {children}
    </section>
  );
  const Body = () => (
    <>
      {data.summary && <Section title="Profile"><p style={{ fontSize: 9.5, lineHeight: 1.65, color: '#374151' }}>{data.summary}</p></Section>}
      {data.experience.length > 0 && <Section title="Experience">{data.experience.map(e => <ExpItem key={e.id} role={e.role} company={e.company} dates={`${e.startDate} – ${e.endDate}`} bullets={e.bullets} accent={ac} />)}</Section>}
      {data.projects.length > 0 && <Section title="Selected Projects">{data.projects.map(p => <div key={p.id} style={{ marginBottom: 9 }}><div style={{ fontSize: 10.5, fontWeight: 800, color: '#111827' }}>{p.name}</div><div style={{ fontSize: 8.5, color: ac, margin: '2px 0' }}>{p.techStack.join(' · ')}</div><div style={{ fontSize: 9.3, color: '#4b5563', lineHeight: 1.5 }}>{p.description}</div></div>)}</Section>}
      {data.education.length > 0 && <Section title="Education">{data.education.map(e => <div key={e.id} style={{ marginBottom: 8 }}><div style={{ fontSize: 10, fontWeight: 750, color: '#111827' }}>{e.degree}</div><div style={{ fontSize: 9, color: ac }}>{e.institution}</div><div style={{ fontSize: 8.5, color: '#6b7280' }}>{e.startDate} – {e.endDate}{e.grade ? ` · ${e.grade}` : ''}</div></div>)}</Section>}
      {data.achievements.length > 0 && <Section title="Achievements"><ul style={{ margin: 0, paddingLeft: 14 }}>{data.achievements.filter(Boolean).map(a => <li key={a} style={{ fontSize: 9.2, lineHeight: 1.5, color: '#374151', marginBottom: 3 }}>{a}</li>)}</ul></Section>}
    </>
  );
  const Side = () => <div style={{ display: 'grid', gap: 14 }}>
    {photo && <div style={{ width: 78, height: 78, borderRadius: template.layout === 'portfolio-grid' ? 8 : '50%', overflow: 'hidden', border: `3px solid ${ac}`, background: soft }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
    {data.skills.length > 0 && <div><div style={{ fontSize: 9.5, fontWeight: 800, color: ac, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Skills</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{data.skills.map(x => <Tag key={x} label={x} color={ac} bg={soft} />)}</div></div>}
    {data.languages.length > 0 && <div><div style={{ fontSize: 9.5, fontWeight: 800, color: ac, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>Languages</div>{data.languages.map(x => <div key={x} style={{ fontSize: 8.8, color: '#4b5563', marginBottom: 3 }}>• {x}</div>)}</div>}
    {data.certificates.length > 0 && <div><div style={{ fontSize: 9.5, fontWeight: 800, color: ac, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>Certificates</div>{data.certificates.map(x => <div key={x} style={{ fontSize: 8.6, color: '#4b5563', marginBottom: 4 }}>{x}</div>)}</div>}
  </div>;

  const contact = [data.email, data.phone, data.location, data.website, data.linkedin].filter(Boolean).join('  •  ');
  const layout = template.layout;

  if (layout === 'luxury' || layout === 'dark-editorial') {
    return <div style={{ minHeight: '100%', background: template.bgColor, fontFamily: F.sans, color: '#f8fafc' }}>
      <div style={{ padding: '28px 28px 22px', background: '#111111', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: `${ac}30`, right: -70, top: -90 }} />
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', position: 'relative' }}>
          {photo && <img src={photo} alt="" style={{ width: 82, height: 82, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${ac}` }} />}
          <div style={{ flex: 1 }}><div style={{ fontSize: 25, fontWeight: 900, letterSpacing: -0.8 }}>{data.name || 'YOUR NAME'}</div><div style={{ color: '#d6b98c', fontSize: 10.5, letterSpacing: 2, textTransform: 'uppercase', marginTop: 5 }}>{data.title || 'PROFESSIONAL TITLE'}</div><div style={{ color: '#a1a1aa', fontSize: 8.5, marginTop: 8 }}>{contact}</div></div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 22, padding: '20px 26px', color: '#27272a' }}><div><Body /></div><div style={{ borderLeft: `1px solid ${ac}40`, paddingLeft: 15 }}><Side /></div></div>
    </div>;
  }
  if (layout === 'split-header' || layout === 'photo-banner') {
    return <div style={{ minHeight: '100%', background: template.bgColor, fontFamily: F.sans }}>
      <div style={{ padding: '24px 28px', background: ac, color: 'white', display: 'grid', gridTemplateColumns: photo ? '1fr 82px' : '1fr', gap: 16, alignItems: 'center' }}><div><div style={{ fontSize: 27, fontWeight: 900 }}>{data.name || 'YOUR NAME'}</div><div style={{ fontSize: 10.5, opacity: .85, marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase' }}>{data.title || 'Professional Title'}</div><div style={{ fontSize: 8.5, opacity: .72, marginTop: 9 }}>{contact}</div></div>{photo && <img src={photo} alt="" style={{ width: 82, height: 82, borderRadius: 10, objectFit: 'cover', border: '3px solid rgba(255,255,255,.65)' }} />}</div>
      <div style={{ padding: '20px 26px' }}><Body /></div>
    </div>;
  }
  if (layout === 'magazine' || layout === 'portfolio-grid' || layout === 'asymmetric') {
    return <div style={{ minHeight: '100%', background: template.bgColor, fontFamily: F.sans }}>
      <div style={{ padding: '25px 28px 16px', display: 'grid', gridTemplateColumns: photo ? '1fr 96px' : '1fr', gap: 20, borderBottom: `1px solid ${ac}30` }}><div><div style={{ fontSize: 29, lineHeight: .95, fontWeight: 900, letterSpacing: -1.3, color: '#111827' }}>{data.name || 'YOUR NAME'}</div><div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: ac, textTransform: 'uppercase', letterSpacing: 2 }}>{data.title || 'Creative Professional'}</div><div style={{ marginTop: 9, fontSize: 8.5, color: '#6b7280' }}>{contact}</div></div>{photo && <img src={photo} alt="" style={{ width: 96, height: 112, objectFit: 'cover', borderRadius: layout === 'portfolio-grid' ? 6 : 48, border: `4px solid ${soft}` }} />}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr .8fr', gap: 20, padding: '18px 24px' }}><div><Body /></div><div style={{ borderLeft: `1px solid ${ac}25`, paddingLeft: 15 }}><Side /></div></div>
    </div>;
  }
  if (layout === 'timeline') {
    return <div style={{ minHeight: '100%', background: template.bgColor, fontFamily: F.sans }}><div style={{ padding: '23px 27px', borderTop: `7px solid ${ac}`, borderBottom: `1px solid ${ac}20` }}><div style={{ fontSize: 25, fontWeight: 900 }}>{data.name || 'YOUR NAME'}</div><div style={{ fontSize: 10, color: ac, fontWeight: 700, marginTop: 4 }}>{data.title || 'Professional Title'}</div><div style={{ fontSize: 8.5, color: '#64748b', marginTop: 7 }}>{contact}</div></div><div style={{ display: 'grid', gridTemplateColumns: '145px 1fr', gap: 20, padding: '18px 24px' }}><Side /><div><Body /></div></div></div>;
  }
  if (layout === 'developer' || layout === 'mono-ats') {
    return <div style={{ minHeight: '100%', background: template.bgColor, fontFamily: F.mono }}><div style={{ padding: '24px 26px', background: '#0f172a', color: '#e2e8f0' }}><div style={{ fontSize: 23, fontWeight: 800 }}>{data.name || 'YOUR_NAME'}</div><div style={{ color: '#7dd3fc', fontSize: 9.5, marginTop: 5 }}>// {data.title || 'PROFESSIONAL_TITLE'}</div><div style={{ color: '#94a3b8', fontSize: 8, marginTop: 8 }}>{contact}</div></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 20, padding: '19px 24px', fontFamily: F.sans }}><div><Body /></div><div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: 14 }}><Side /></div></div></div>;
  }
  // Default premium clean grid / soft modern / editorial family.
  return <div style={{ minHeight: '100%', background: template.bgColor, fontFamily: F.sans }}><div style={{ padding: '24px 27px 18px', display: 'flex', gap: 18, alignItems: 'center', borderBottom: `3px solid ${ac}` }}><div style={{ flex: 1 }}><div style={{ fontSize: 24, fontWeight: 900, color: '#111827' }}>{data.name || 'YOUR NAME'}</div><div style={{ fontSize: 10, color: ac, fontWeight: 700, marginTop: 4, letterSpacing: 1.3 }}>{data.title || 'PROFESSIONAL TITLE'}</div><div style={{ fontSize: 8.5, color: '#64748b', marginTop: 7 }}>{contact}</div></div>{photo && <img src={photo} alt="" style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', border: `2px solid ${ac}` }} />}</div><div style={{ display: 'grid', gridTemplateColumns: '1fr 145px', gap: 20, padding: '19px 24px' }}><div><Body /></div><div style={{ background: soft, borderRadius: 8, padding: 12, alignSelf: 'start' }}><Side /></div></div></div>;
}
// ═══════════════════════════════════════════════════════════════
// MAIN RENDERER — maps template IDs to components
// ═══════════════════════════════════════════════════════════════
export function ResumeRenderer({ template, data, photoUrl }: RendererProps) {
  const placeholder = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width=300 height=300 viewBox="0 0 300 300"><rect width="300" height="300" fill="#e5e7eb"/><circle cx="150" cy="118" r="46" fill="#9ca3af"/><path d="M72 268c7-57 39-84 78-84s71 27 78 84" fill="#9ca3af"/><text x="150" y="292" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">UPLOAD PHOTO</text></svg>`);
  const photo = photoUrl || data.photoUrl || (template.photoRequired ? placeholder : '');
  switch (template.layout) {
    case 'classic-sidebar': return template.id === 'quadra-classic' ? <T01_QuadraClassic data={data} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'teal-sidebar': return template.id === 'bold-teal-sidebar' || template.id === 'navy-photo-left' ? <T02_TealCommander data={data} photoUrl={photo} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'header-two-column': return template.id === 'bold-header-blue' ? <T03_BlueprintBold data={data} accent={template.accentColor} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'editorial-photo': return template.id === 'canva-elegant' ? <T04_CanvaElegance data={data} photoUrl={photo} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'minimal': return template.id === 'minimal-pro' ? <T05_MinimalPro data={data} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'luxury': return template.id === 'dark-luxury' ? <T06_DarkLuxury data={data} photoUrl={photo} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'emerald-sidebar': return template.id === 'green-sidebar-photo' ? <T07_EmeraldProfile data={data} photoUrl={photo} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'violet-sidebar': return template.id === 'purple-modern' ? <T08_VioletVision data={data} photoUrl={photo} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'developer': return template.id === 'developer-mono' ? <T09_DevStack data={data} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'academic': return template.id === 'academic-serif' ? <T10_AcademicSerif data={data} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'sunrise': return template.id === 'fresh-orange' ? <T11_VividSunrise data={data} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    case 'rose-card': return template.id === 'pink-creative' ? <T12_RosePortfolio data={data} photoUrl={photo} /> : <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
    default: return <DataDrivenTemplate data={data} template={template} photoUrl={photo} />;
  }
}
