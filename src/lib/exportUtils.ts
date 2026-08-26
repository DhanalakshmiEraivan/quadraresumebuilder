import type { ResumeData } from './types';

// ── PDF Download using html2pdf.js ──
export async function downloadResumeAsPDF(containerId: string, resumeName: string): Promise<void> {
  const source = document.getElementById(containerId);
  if (!source) return;
  const html2pdf = (await import('html2pdf.js')).default;

  // Never rasterize the editor's scaled/shadowed preview. Clone the document
  // into an off-screen A4 export surface with all UI transforms and shadows
  // removed. This fixes the grey page-shadow artifact in downloaded PDFs.
  const exportRoot = document.createElement('div');
  exportRoot.setAttribute('data-quadra-pdf-export', 'true');
  exportRoot.style.cssText = [
    'position:fixed','left:-100000px','top:0','width:210mm','min-height:297mm',
    'background:#ffffff','margin:0','padding:0','box-shadow:none','transform:none',
    'overflow:visible','z-index:-1'
  ].join(';');
  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.style.cssText = 'width:210mm;min-height:297mm;margin:0;padding:0;background:#fff;box-shadow:none;transform:none;overflow:visible;';
  clone.querySelectorAll<HTMLElement>('*').forEach(node => {
    node.style.boxShadow = 'none';
    node.style.textShadow = 'none';
    node.style.transform = 'none';
    node.style.filter = 'none';
  });
  clone.querySelectorAll<HTMLImageElement>('img').forEach(img => { img.crossOrigin = 'anonymous'; });
  exportRoot.appendChild(clone);
  document.body.appendChild(exportRoot);
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  try {
    await html2pdf().set({
      margin: 0,
      filename: `${resumeName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'] as const },
    }).from(clone).save();
  } finally {
    exportRoot.remove();
  }
}

// ── Print in a new window with full styling ──
export function printResume(containerId: string, resumeName: string) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const html = el.innerHTML;
  const win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups for this site to print your resume.'); return; }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${resumeName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Georgia&family=Courier+New&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { width: 210mm; min-height: 297mm; background: white; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    img { max-width: 100%; }
    @page { size: A4; margin: 0; }
    @media print { html, body { width: 210mm; min-height: 297mm; } }
  </style>
</head>
<body>
  <div style="width:210mm; min-height:297mm; overflow:hidden;">
    ${html}
  </div>
  <script>
    window.onload = () => { window.focus(); window.print(); setTimeout(() => window.close(), 1000); };
  </script>
</body>
</html>`);
  win.document.close();
}

// ── Download as HTML file ──
export function downloadResumeAsHTML(containerId: string, resumeName: string) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const html = el.innerHTML;
  const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${resumeName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Georgia&family=Courier+New&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { width: 210mm; min-height: 297mm; background: white; margin: 0 auto; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    img { max-width: 100%; }
    @page { size: A4; margin: 0; }
    @media print { html, body { width: 210mm; min-height: 297mm; } }
  </style>
</head>
<body>
  <div style="width:210mm; min-height:297mm; overflow:hidden;">
    ${html}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resumeName.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Download as plain text ──
export function downloadResumeAsText(resume: ResumeData, resumeName: string) {
  const lines: string[] = [];
  lines.push(resume.name.toUpperCase());
  if (resume.title) lines.push(resume.title);
  const contact = [resume.email, resume.phone, resume.location, resume.website, resume.linkedin].filter(Boolean).join(' | ');
  if (contact) lines.push(contact);
  lines.push('');
  lines.push('═'.repeat(60));
  lines.push('');

  if (resume.summary) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push('-'.repeat(60));
    lines.push(resume.summary);
    lines.push('');
  }

  if (resume.experience.length > 0) {
    lines.push('EXPERIENCE');
    lines.push('-'.repeat(60));
    resume.experience.forEach(exp => {
      lines.push(`${exp.role} — ${exp.company}`);
      lines.push(`${exp.startDate} — ${exp.endDate}`);
      exp.bullets.filter(b => b.trim()).forEach(b => lines.push(`  • ${b}`));
      lines.push('');
    });
  }

  if (resume.projects.length > 0) {
    lines.push('PROJECTS');
    lines.push('-'.repeat(60));
    resume.projects.forEach(p => {
      lines.push(`${p.name}${p.techStack.length > 0 ? ` (${p.techStack.join(', ')})` : ''}`);
      if (p.description) lines.push(`  ${p.description}`);
      if (p.link) lines.push(`  Link: ${p.link}`);
      lines.push('');
    });
  }

  if (resume.education.length > 0) {
    lines.push('EDUCATION');
    lines.push('-'.repeat(60));
    resume.education.forEach(edu => {
      lines.push(`${edu.degree} — ${edu.institution}`);
      lines.push(`${edu.startDate} — ${edu.endDate}${edu.grade ? ` | ${edu.grade}` : ''}`);
      lines.push('');
    });
  }

  if (resume.skills.length > 0) {
    lines.push('SKILLS');
    lines.push('-'.repeat(60));
    lines.push(resume.skills.join(', '));
    lines.push('');
  }

  if (resume.achievements.length > 0) {
    lines.push('ACHIEVEMENTS');
    lines.push('-'.repeat(60));
    resume.achievements.filter(a => a.trim()).forEach(a => lines.push(`  • ${a}`));
    lines.push('');
  }

  if (resume.certificates.length > 0) {
    lines.push('CERTIFICATES');
    lines.push('-'.repeat(60));
    resume.certificates.filter(c => c.trim()).forEach(c => lines.push(`  • ${c}`));
    lines.push('');
  }

  if (resume.languages.length > 0) {
    lines.push('LANGUAGES');
    lines.push('-'.repeat(60));
    lines.push(resume.languages.join(', '));
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resumeName.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Share via Email (opens default mail client with resume summary) ──
export function shareViaEmail(resume: ResumeData, resumeName: string) {
  const subject = `${resume.name || 'My'} Resume — ${resume.title || resumeName}`;

  const emailBody = buildPlainTextResume(resume);
  const footer = `\n\n─ Generated with QuadraResume ─\nwindow.location.origin\n`;

  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody + footer)}`;
  window.location.href = mailtoLink;
}

// ── Share via WhatsApp (opens WhatsApp with formatted resume text) ──
export function shareViaWhatsApp(resume: ResumeData, resumeName: string) {
  const text = buildWhatsAppResume(resume);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// ── Share via Telegram ──
export function shareViaTelegram(resume: ResumeData, resumeName: string) {
  const text = buildWhatsAppResume(resume);
  const url = `https://t.me/share/url?url=${encodeURIComponent('window.location.origin')}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// ── Copy to clipboard ──
export async function copyResumeToClipboard(resume: ResumeData): Promise<boolean> {
  try {
    const text = buildPlainTextResume(resume);
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ── Copy shareable link ──
export function copyResumeLink(resumeId: string) {
  const url = `${window.location.origin}?resume=${resumeId}`;
  navigator.clipboard.writeText(url);
}

// ── Helpers: build formatted text versions of the resume ──

function buildPlainTextResume(resume: ResumeData): string {
  const lines: string[] = [];
  lines.push(resume.name || 'Your Name');
  if (resume.title) lines.push(resume.title);
  const contact = [resume.email, resume.phone, resume.location, resume.website, resume.linkedin].filter(Boolean).join(' | ');
  if (contact) lines.push(contact);
  lines.push('');
  if (resume.summary) { lines.push('SUMMARY'); lines.push(resume.summary); lines.push(''); }
  if (resume.experience.length > 0) {
    lines.push('EXPERIENCE');
    resume.experience.forEach(exp => {
      lines.push(`${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate})`);
      exp.bullets.filter(b => b.trim()).forEach(b => lines.push(`  - ${b}`));
      lines.push('');
    });
  }
  if (resume.projects.length > 0) {
    lines.push('PROJECTS');
    resume.projects.forEach(p => {
      lines.push(`${p.name}${p.techStack.length > 0 ? ` [${p.techStack.join(', ')}]` : ''}`);
      if (p.description) lines.push(`  ${p.description}`);
      lines.push('');
    });
  }
  if (resume.skills.length > 0) { lines.push('SKILLS'); lines.push(resume.skills.join(', ')); lines.push(''); }
  if (resume.education.length > 0) {
    lines.push('EDUCATION');
    resume.education.forEach(edu => {
      lines.push(`${edu.degree}, ${edu.institution} (${edu.startDate} - ${edu.endDate})`);
    });
    lines.push('');
  }
  if (resume.achievements.length > 0) { lines.push('ACHIEVEMENTS'); resume.achievements.filter(a => a.trim()).forEach(a => lines.push(`  - ${a}`)); lines.push(''); }
  if (resume.certificates.length > 0) { lines.push('CERTIFICATES'); resume.certificates.filter(c => c.trim()).forEach(c => lines.push(`  - ${c}`)); lines.push(''); }
  if (resume.languages.length > 0) { lines.push('LANGUAGES'); lines.push(resume.languages.join(', ')); }
  return lines.join('\n');
}

function buildWhatsAppResume(resume: ResumeData): string {
  const lines: string[] = [];
  lines.push(`*${resume.name || 'My Resume'}*`);
  if (resume.title) lines.push(`_${resume.title}_`);
  const contact = [resume.email, resume.phone, resume.location].filter(Boolean).join(' | ');
  if (contact) lines.push(contact);
  lines.push('');
  if (resume.summary) { lines.push('*Summary*'); lines.push(resume.summary); lines.push(''); }
  if (resume.experience.length > 0) {
    lines.push('*Experience*');
    resume.experience.forEach(exp => {
      lines.push(`\n_${exp.role} at ${exp.company}_`);
      lines.push(`${exp.startDate} - ${exp.endDate}`);
      exp.bullets.filter(b => b.trim()).forEach(b => lines.push(`• ${b}`));
    });
    lines.push('');
  }
  if (resume.projects.length > 0) {
    lines.push('*Projects*');
    resume.projects.forEach(p => {
      lines.push(`\n*${p.name}*`);
      if (p.techStack.length > 0) lines.push(`[${p.techStack.join(', ')}]`);
      if (p.description) lines.push(p.description);
    });
    lines.push('');
  }
  if (resume.skills.length > 0) { lines.push('*Skills*'); lines.push(resume.skills.join(', ')); lines.push(''); }
  if (resume.education.length > 0) {
    lines.push('*Education*');
    resume.education.forEach(edu => {
      lines.push(`${edu.degree}, ${edu.institution} (${edu.startDate} - ${edu.endDate})`);
    });
    lines.push('');
  }
  if (resume.achievements.length > 0) {
    lines.push('*Achievements*');
    resume.achievements.filter(a => a.trim()).forEach(a => lines.push(`• ${a}`));
    lines.push('');
  }
  if (resume.languages.length > 0) { lines.push('*Languages*'); lines.push(resume.languages.join(', ')); }
  lines.push('\n_Created with QuadraResume_');
  return lines.join('\n');
}
