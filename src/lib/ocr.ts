import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import type { ResumeData, ExperienceItem, EducationItem, ProjectItem } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();

export interface ExtractionResult {
  text: string;
  sourceType: string;
  pages?: number;
  confidence?: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED = ['pdf', 'docx', 'doc', 'txt', 'md', 'html', 'htm', 'png', 'jpg', 'jpeg', 'webp'];

const normalizeSpace = (value: string) => value
  .replace(/\u0000/g, ' ')
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .replace(/[ \t]+/g, ' ')
  .replace(/\r/g, '')
  .replace(/\n[ \t]+/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const clean = (value: string) => normalizeSpace(value)
  .split('\n')
  .map(line => line.trim())
  .filter((line, i, arr) => line || (i > 0 && arr[i - 1] !== ''))
  .join('\n')
  .trim();

async function ocrBlob(blob: Blob, onProgress?: (n: number) => void) {
  const result = await Tesseract.recognize(blob, 'eng', {
    logger: m => {
      if (typeof m.progress === 'number') onProgress?.(m.progress);
    },
    // Sparse text is common in resumes and preserves separate columns better.
    psm: 11,
  } as any);
  const data = result.data as any;
  const lines = Array.isArray(data.lines) ? data.lines : [];
  if (!lines.length) return { text: clean(data.text || ''), confidence: data.confidence || 0 };

  // Tesseract's plain text stream is not column-aware. Rebuild it from line
  // bounding boxes. If a page has two clearly separated columns, read the
  // complete left rail first and then the main column. This prevents CONTACT /
  // SKILLS / EDUCATION content from being appended to the previous main section.
  const items = lines.map((line: any) => ({
    text: String(line.text || '').trim(),
    x: Number(line.bbox?.x0 || 0),
    y: Number(line.bbox?.y0 || 0),
    x1: Number(line.bbox?.x1 || line.bbox?.x0 || 0),
    conf: Number(line.confidence || data.confidence || 0),
  })).filter((x: any) => x.text);

  const minX = Math.min(...items.map((x: any) => x.x));
  const maxX = Math.max(...items.map((x: any) => x.x1));
  const width = Math.max(1, maxX - minX);
  const sortedByX = [...items].sort((a: any, b: any) => a.x - b.x);
  let largestGap = 0;
  let splitX = minX + width * 0.45;
  for (let i = 1; i < sortedByX.length; i++) {
    const gap = sortedByX[i].x - sortedByX[i - 1].x1;
    if (gap > largestGap) {
      largestGap = gap;
      splitX = (sortedByX[i].x + sortedByX[i - 1].x1) / 2;
    }
  }

  const isTwoColumn = largestGap > width * 0.18 && items.filter((x: any) => x.x < splitX).length >= 3 && items.filter((x: any) => x.x >= splitX).length >= 3;
  const ordered = isTwoColumn
    ? [...items.filter((x: any) => x.x < splitX).sort((a: any, b: any) => a.y - b.y || a.x - b.x),
       ...items.filter((x: any) => x.x >= splitX).sort((a: any, b: any) => a.y - b.y || a.x - b.x)]
    : items.sort((a: any, b: any) => a.y - b.y || a.x - b.x);

  return {
    text: clean(ordered.map((x: any) => x.text).join('\n')),
    confidence: items.reduce((sum: number, x: any) => sum + x.conf, 0) / Math.max(1, items.length),
  };
}

/**
 * PDF.js returns individual glyph runs. The old implementation joined all
 * runs with spaces, destroying the visual line/section hierarchy of resumes.
 * This reconstruction groups runs by their Y coordinate, then sorts each line
 * by X coordinate. That keeps headings, labels and bullets on their own lines
 * and gives the parser real structure to work with.
 */
function reconstructPdfPage(items: any[]) {
  const runs = items
    .filter(item => typeof item.str === 'string' && item.str.trim())
    .map(item => ({
      text: item.str.trim(),
      x: Number(item.transform?.[4] || 0),
      y: Number(item.transform?.[5] || 0),
      height: Math.max(6, Math.abs(Number(item.transform?.[3] || 10))),
      width: Math.max(0, Number(item.width || 0)),
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const groups: Array<{ y: number; runs: typeof runs }> = [];
  for (const run of runs) {
    const tolerance = Math.max(2.5, Math.min(6, run.height * 0.38));
    const group = groups.find(g => Math.abs(g.y - run.y) <= tolerance);
    if (group) {
      group.runs.push(run);
      group.y = (group.y + run.y) / 2;
    } else {
      groups.push({ y: run.y, runs: [run] });
    }
  }

  return groups
    .sort((a, b) => b.y - a.y)
    .map(group => {
      const ordered = group.runs.sort((a, b) => a.x - b.x);
      let line = '';
      let previousRight = -Infinity;
      for (const run of ordered) {
        const gap = run.x - previousRight;
        const separator = line && gap > Math.max(3, run.height * 0.25) ? ' ' : '';
        line += separator + run.text;
        previousRight = Math.max(previousRight, run.x + run.width);
      }
      return line.replace(/\s+/g, ' ').trim();
    })
    .filter(Boolean)
    .join('\n');
}

async function pdfText(file: File, onProgress?: (n: number) => void) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pageTexts: string[] = [];
  let confidenceTotal = 0;
  let ocrPages = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = reconstructPdfPage(content.items);

    // A real text PDF can still contain a few sparse labels. Use OCR only when
    // the page has almost no usable text, avoiding expensive OCR unnecessarily.
    if (pageText.replace(/\s/g, '').length >= 45) {
      pageTexts.push(pageText);
    } else {
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize the PDF OCR canvas.');
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not render PDF page for OCR.')), 'image/png'),
      );
      const result = await ocrBlob(blob, p => onProgress?.(((i - 1) + p) / pdf.numPages));
      pageTexts.push(result.text);
      confidenceTotal += result.confidence || 0;
      ocrPages++;
    }
    onProgress?.(i / pdf.numPages);
  }

  return {
    text: clean(pageTexts.join('\n\n')),
    pages: pdf.numPages,
    confidence: ocrPages ? confidenceTotal / ocrPages : 100,
  };
}

export async function extractResumeText(file: File, onProgress?: (n: number) => void): Promise<ExtractionResult> {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  if (!SUPPORTED.includes(ext)) throw new Error(`Unsupported file type .${ext}. Upload PDF, DOCX, DOC, TXT, MD, HTML or an image.`);
  if (file.size > MAX_FILE_SIZE) throw new Error('File is too large. Please upload a resume smaller than 10 MB.');
  if (file.size === 0) throw new Error('The uploaded file is empty.');

  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    const r = await ocrBlob(file, onProgress);
    if (!r.text.trim()) throw new Error('OCR could not read text from this image. Try a sharper scan or PDF.');
    return { text: r.text, sourceType: 'AI OCR image', confidence: r.confidence };
  }
  if (ext === 'pdf' || file.type === 'application/pdf') {
    const r = await pdfText(file, onProgress);
    if (!r.text.trim()) throw new Error('No readable text was found in the PDF. Try a clearer PDF or image scan.');
    return { text: r.text, sourceType: 'PDF text extraction + OCR fallback', ...r };
  }
  if (ext === 'docx' || file.type.includes('wordprocessingml')) {
    const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    const text = clean(r.value);
    if (!text) throw new Error('The DOCX file contains no readable resume text.');
    return { text, sourceType: 'DOCX parser' };
  }
  if (ext === 'doc') {
    throw new Error('Legacy .DOC files are not safely parseable in this browser build. Save the document as .DOCX or PDF and upload it again.');
  }
  if (ext === 'txt' || ext === 'md' || file.type.startsWith('text/')) return { text: clean(await file.text()), sourceType: 'Text parser' };
  if (ext === 'html' || ext === 'htm') {
    const html = await file.text();
    const text = clean(new DOMParser().parseFromString(html, 'text/html').body?.innerText || html.replace(/<[^>]+>/g, ' '));
    return { text, sourceType: 'HTML parser' };
  }
  throw new Error('This file could not be parsed.');
}

const lines = (text: string) => clean(text).split('\n').map(x => x.trim()).filter(Boolean);
const email = (text: string) => text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
const phone = (text: string) => text.match(/(?:\+?\d[\d\s().-]{8,}\d)/)?.[0]?.replace(/\s+/g, ' ').trim() || '';
const linkedin = (text: string) => text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i)?.[0] || '';
const website = (text: string) => text.match(/https?:\/\/(?![^\s]*linkedin\.com)[^\s,)]+/i)?.[0] || '';
const dateRange = (s: string) => s.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|—|to)\s*(?:(?:Present|Current)|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4})/i)?.[0] || '';
const bullets = (s: string) => s
  .replace(/[•●▪◦]/g, '\n')
  .split(/\n|(?<=\.)\s+(?=[A-Z][^.!?]{0,100}(?:\.|$))/)
  .map(x => x.replace(/^[-*]\s*/, '').trim())
  .filter(Boolean);

const sectionAliases: Record<string, string[]> = {
  summary: ['professional summary', 'summary', 'professional profile', 'profile', 'objective', 'career objective', 'about me'],
  experience: ['professional experience', 'work experience', 'experience', 'employment history', 'work history'],
  education: ['education', 'academic background', 'academic qualifications', 'qualifications'],
  skills: ['technical skills', 'core skills', 'key skills', 'skills', 'competencies', 'technologies'],
  projects: ['selected projects', 'academic projects', 'personal projects', 'projects'],
  languages: ['languages', 'language proficiency', 'language'],
  certificates: ['certifications', 'certificates', 'licenses', 'professional certifications'],
  achievements: ['achievements', 'awards', 'honors', 'accomplishments'],
};

const aliasPairs = Object.entries(sectionAliases)
  .flatMap(([key, aliases]) => aliases.map(alias => ({ key, alias })))
  .sort((a, b) => b.alias.length - a.alias.length);

function detectHeading(line: string) {
  const raw = line.trim();
  const normalized = raw.toLowerCase().replace(/[.:|]+$/g, '').replace(/\s+/g, ' ').trim();
  const exact = aliasPairs.find(x => normalized === x.alias);
  if (exact) return { key: exact.key, remainder: '' };

  // Handles PDF runs such as "TECHNICAL SKILLS Programming Languages: Python, Java".
  const prefix = aliasPairs.find(x => normalized.startsWith(`${x.alias} `) || normalized.startsWith(`${x.alias}:`));
  if (prefix) {
    const remainder = raw.slice(prefix.alias.length).replace(/^\s*[:|–—-]?\s*/, '').trim();
    return { key: prefix.key, remainder };
  }
  return null;
}

function splitInlineSections(rawLines: string[]) {
  const result: Array<{ key: string; line: string }> = [];
  const escaped = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const raw of rawLines) {
    const matches: Array<{ index: number; end: number; key: string }> = [];
    for (const pair of aliasPairs) {
      const re = new RegExp(`(?:^|\\s)${escaped(pair.alias)}(?=\\s|:)`, 'ig');
      let match: RegExpExecArray | null;
      while ((match = re.exec(raw))) {
        const index = (match.index || 0) + (match[0].startsWith(' ') ? 1 : 0);
        matches.push({ index, end: index + pair.alias.length, key: pair.key });
      }
    }
    matches.sort((a, b) => a.index - b.index || b.end - a.end);
    const deduped: typeof matches = [];
    for (const match of matches) {
      if (deduped.some(x => match.index >= x.index && match.index < x.end)) continue;
      deduped.push(match);
    }

    if (!deduped.length) {
      result.push({ key: 'header', line: raw });
      continue;
    }

    const first = deduped[0];
    const before = raw.slice(0, first.index).trim();
    if (before) result.push({ key: 'header', line: before });

    for (let i = 0; i < deduped.length; i++) {
      const current = deduped[i];
      const next = deduped[i + 1];
      const line = raw.slice(current.end, next ? next.index : raw.length)
        .replace(/^\s*[:|–—-]?\s*/, '')
        .trim();
      result.push({ key: current.key, line });
    }
  }
  return result;
}

function unique(values: string[]) {
  const seen = new Set<string>();
  return values.map(v => v.trim()).filter(Boolean).filter(v => {
    const key = v.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseList(rows: string[], max = 30) {
  return unique(rows.flatMap(row => row.split(/[•●▪◦|;]/).flatMap(bullets)).map(x => x.replace(/^\s*[-*]\s*/, '').trim())).slice(0, max);
}

function parseExperience(rows: string[]): ExperienceItem[] {
  const out: ExperienceItem[] = [];
  let current: ExperienceItem | null = null;
  const rolePattern = /\b(manager|engineer|developer|designer|analyst|consultant|specialist|lead|director|intern|architect|officer|executive|coordinator|administrator|scientist|teacher|researcher|accountant|marketing|sales|product|associate|trainee|founder)\b/i;

  for (const row of rows) {
    const date = dateRange(row);
    const hasRole = rolePattern.test(row);
    const likelyHeader = row.length <= 130 && (hasRole || !!date) && !/^(responsibilities|achievements|skills|technologies)\b/i.test(row);

    if (likelyHeader) {
      if (current) out.push(current);
      const cleanHeader = row.replace(date, '').replace(/[|•]/g, ' ').trim();
      const parts = cleanHeader
        .split(/\s+(?:at|@)\s+|\s+[—–-]\s+|\s*,\s*(?:company|organization)\s*:\s*/i)
        .map(x => x.trim()).filter(Boolean);
      current = {
        id: crypto.randomUUID(), role: parts[0] || cleanHeader, company: parts[1] || '',
        startDate: '', endDate: '', description: '', bullets: [],
      };
      if (date) {
        const partsDate = date.split(/\s*(?:-|–|—|to)\s*/);
        current.startDate = partsDate[0]?.trim() || '';
        current.endDate = partsDate[1]?.trim() || '';
      }
    } else if (current) {
      // OCR commonly puts the company on the line immediately below the role.
      // Treat a short non-sentence line as the company instead of a bullet.
      if (!current.company && row.length <= 90 && !dateRange(row) && !/[.!?]$/.test(row)) {
        current.company = row.replace(/[.:]+$/, '').trim();
        continue;
      }
      const b = bullets(row);
      current.bullets.push(...b);
      if (!current.description && b.length === 1 && b[0] === row && row.length > 100) current.description = row;
    }
  }
  if (current) out.push(current);
  return out
    .map(x => ({ ...x, bullets: unique(x.bullets).slice(0, 12) }))
    .filter(x => x.role || x.company || x.bullets.length)
    .slice(0, 12);
}

function parseEducation(rows: string[]): EducationItem[] {
  const out: EducationItem[] = [];
  let current: EducationItem | null = null;
  const isDegree = (row: string) => /b\.?\s*tech|b\.?\s*e\.?|m\.?\s*tech|m\.?\s*e\.?|bachelor|master|mba|mca|bca|phd|diploma|degree/i.test(row);
  const isInstitution = (row: string) => /university|college|institute|school|academy|technology|polytechnic/i.test(row);
  for (const raw of rows) {
    const row = raw.trim();
    if (!row) continue;
    const date = dateRange(row);
    const grade = row.match(/(?:CGPA|GPA|Grade|Percentage|Score)\s*[:\-]?\s*([\w.\/%-]+)/i)?.[1] || '';
    const dates = date ? date.split(/\s*(?:-|–|—|to)\s*/) : [];
    if (!current && (isDegree(row) || isInstitution(row) || date)) {
      current = { id: crypto.randomUUID(), degree: '', institution: '', startDate: dates[0] || '', endDate: dates[1] || '', grade };
    }
    if (!current) continue;

    const cleaned = row
      .replace(date, '')
      .replace(/(?:CGPA|GPA|Grade|Percentage|Score)\s*[:\-]?\s*[\w.\/%-]+/i, '')
      .trim();
    if (isDegree(cleaned) && !current.degree) current.degree = cleaned;
    else if (isInstitution(cleaned) && !current.institution) current.institution = cleaned;
    else if (!current.degree && cleaned.length < 120) current.degree = cleaned;
    else if (!current.institution && cleaned.length < 120) current.institution = cleaned;
    if (dates.length) { current.startDate = dates[0] || current.startDate; current.endDate = dates[1] || current.endDate; }
    if (grade) current.grade = grade;

    // Start a new record when the current one is complete and another degree
    // appears. This preserves multi-entry education without splitting the
    // institution/date lines into fake records.
    if (current.degree && current.institution && (date || grade)) {
      out.push(current);
      current = null;
    }
  }
  if (current && (current.degree || current.institution)) out.push(current);
  return out.slice(0, 10);
}

function parseProjects(rows: string[]): ProjectItem[] {
  const out: ProjectItem[] = [];
  let current: ProjectItem | null = null;
  for (const row of rows) {
    const pieces = row.split(/\s+[|—–-]\s+/).map(x => x.trim()).filter(Boolean);
    const looksLikeProject = row.length < 120 && pieces.length > 0;
    if (looksLikeProject) {
      if (current) out.push(current);
      current = { id: crypto.randomUUID(), name: pieces[0], techStack: unique((pieces.slice(1).join(' ').match(/[A-Za-z][A-Za-z0-9+#. -]{1,35}/g) || []).flatMap(x => x.split(/[,|]/))), description: '', link: '' };
      const url = row.match(/https?:\/\/\S+/)?.[0];
      if (url) current.link = url;
    } else if (current) {
      if (!current.techStack.length && row.length <= 60 && !/[.!?]$/.test(row)) {
        current.techStack = unique(row.split(/[,/|·]+/).map(x => x.trim()).filter(Boolean));
      } else {
        current.description = `${current.description} ${row}`.trim();
      }
    }
  }
  if (current) out.push(current);
  return out.filter(x => x.name || x.description).slice(0, 10);
}


/**
 * Turn the reconstructed resume text into named sections while preserving
 * line boundaries. This is intentionally conservative: a paragraph is not
 * considered a section heading unless it matches one of our known aliases.
 * It also handles resumes where a PDF exporter places a heading and its
 * content on the same visual line, e.g. "TECHNICAL SKILLS Python, Java".
 */
function sectionBlocks(text: string): Record<string, string[]> {
  const blocks: Record<string, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certificates: [],
    achievements: [],
  };

  let current = 'header';
  const sourceLines = lines(text);

  const add = (key: string, value: string) => {
    const cleaned = value.trim();
    if (cleaned) blocks[key].push(cleaned);
  };

  for (const raw of sourceLines) {
    const heading = detectHeading(raw);
    if (heading) {
      current = heading.key;
      add(current, heading.remainder);
      continue;
    }

    // A line can contain several section labels because some PDF generators
    // flatten columns/runs. Split those labels before assigning the content.
    const parts = splitInlineSections([raw]);
    if (parts.some(part => part.key !== 'header')) {
      for (const part of parts) {
        if (part.key === 'header') {
          // Text before the first heading belongs to the current section only
          // when we are already inside a section; otherwise it is the header.
          add(current, part.line);
        } else {
          current = part.key;
          add(current, part.line);
        }
      }
      continue;
    }

    add(current, raw);
  }

  // De-duplicate exact repeated lines while keeping their original order.
  for (const key of Object.keys(blocks)) {
    blocks[key] = unique(blocks[key]);
  }

  return blocks;
}

function inferHeader(linesIn: string[], fullText: string) {
  const emailValue = email(fullText);
  const phoneValue = phone(fullText);
  const linkedinValue = linkedin(fullText);
  const websiteValue = website(fullText);
  const candidates = linesIn.filter(x => x.length >= 2 && x.length < 80 && !x.includes('@') && !/https?:\/\//i.test(x) && !/linkedin\.com/i.test(x));
  const name = candidates.find(x => !/\d{4}|\b(india|usa|uk|canada|australia|chennai|bangalore|bengaluru|mumbai|delhi|hyderabad|pune|kochi|madurai|coimbatore)\b/i.test(x) && !/\b(engineer|developer|designer|manager|analyst|consultant|specialist|student|intern|architect|scientist|marketing|sales|product|finance|account)\b/i.test(x)) || candidates[0] || '';
  const title = candidates.find(x => x !== name && /\b(engineer|developer|designer|manager|analyst|consultant|specialist|student|intern|architect|scientist|marketing|sales|product|finance|account|data|technology|software)\b/i.test(x)) || candidates[1] || '';
  const location = candidates.find(x => /\b(india|usa|uk|canada|australia|chennai|bangalore|bengaluru|mumbai|delhi|hyderabad|pune|kochi|madurai|coimbatore|tamil nadu)\b/i.test(x)) || '';
  return { name, title, email: emailValue, phone: phoneValue, linkedin: linkedinValue, website: websiteValue, location };
}

export function mapExtractedTextToResume(text: string): Partial<ResumeData> {
  const cleanText = clean(text);
  const sec = sectionBlocks(cleanText);
  const header = sec.header || [];
  const headerInfo = inferHeader(header, cleanText);

  const skills = parseList(sec.skills || [], 80)
    .filter(x => x.length >= 2 && x.length <= 70)
    .flatMap(x => x.split(/\s*,\s*|\s*\/\s*/).map(v => v.trim()))
    .filter(Boolean);
  const languages = parseList(sec.languages || [], 30)
    .flatMap(x => x.split(/\s*,\s*|\s*\/\s*/).map(v => v.trim()))
    .filter(x => x.length <= 40);
  const summary = (sec.summary || []).join(' ').replace(/\s+/g, ' ').trim();
  const certificates = parseList(sec.certificates || [], 30);
  const achievements = parseList(sec.achievements || [], 30);
  const experience = parseExperience(sec.experience || []);
  const projects = parseProjects(sec.projects || []);
  const education = parseEducation(sec.education || []);

  // Some resumes have no explicit skills heading. Infer only from short, skill-like
  // tokens outside narrative sections instead of dumping entire paragraphs into skills.
  const fallbackSkills = unique(
    (sec.header || []).flatMap(x => x.split(/[,;|]/)).filter(x =>
      x.length >= 2 && x.length <= 45 && /^(python|java|javascript|typescript|sql|html|css|react|node|aws|azure|figma|excel|power bi|tableau|machine learning|data analysis|communication|leadership|git|docker|kubernetes|c\+\+|c#)$/i.test(x.trim()),
    ),
  );

  return {
    name: headerInfo.name,
    email: headerInfo.email,
    phone: headerInfo.phone,
    location: headerInfo.location,
    website: headerInfo.website,
    linkedin: headerInfo.linkedin,
    title: headerInfo.title,
    summary,
    experience,
    projects,
    education,
    skills: unique((skills.length ? skills : fallbackSkills)).slice(0, 80),
    achievements,
    certificates,
    languages: unique(languages).slice(0, 30),
  };
}
