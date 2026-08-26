import type { ResumeData } from '@/lib/types';

export const PHOTO_URLS = {
  man1: 'https://images.pexels.com/photos/37148308/pexels-photo-37148308.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  man2: 'https://images.pexels.com/photos/12311572/pexels-photo-12311572.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  woman1: 'https://images.pexels.com/photos/10174456/pexels-photo-10174456.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  woman2: 'https://images.pexels.com/photos/29852895/pexels-photo-29852895.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
};

export type TemplateLayout =
  | 'classic-sidebar' | 'teal-sidebar' | 'header-two-column' | 'editorial-photo'
  | 'minimal' | 'luxury' | 'emerald-sidebar' | 'violet-sidebar' | 'developer'
  | 'academic' | 'sunrise' | 'rose-card' | 'asymmetric' | 'timeline' | 'split-header'
  | 'portfolio-grid' | 'mono-ats' | 'executive-band' | 'soft-modern' | 'magazine'
  | 'photo-banner' | 'clean-grid' | 'dark-editorial';

export interface TemplateDef {
  id: string;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  bgColor: string;
  premium: boolean;
  tags: string[];
  layout: TemplateLayout;
  photoRequired?: boolean;
}

const t = (id: string, name: string, category: string, description: string, accentColor: string, bgColor: string, premium: boolean, tags: string[], layout: TemplateLayout, photoRequired = false): TemplateDef => ({ id, name, category, description, accentColor, bgColor, premium, tags, layout, photoRequired });

export const TEMPLATES: TemplateDef[] = [
  t('quadra-classic','Quadra Classic','Classic','Editorial navy sidebar with precise A4 spacing.','#111827','#ffffff',false,['ATS','Professional'],'classic-sidebar'),
  t('bold-teal-sidebar','Teal Commander','Modern','Dark teal profile rail, portrait and compact skills.','#0f766e','#ffffff',false,['Modern','Photo','Sidebar'],'teal-sidebar',true),
  t('navy-photo-left','Navy Executive','Executive','High-contrast executive profile with portrait rail.','#172554','#ffffff',false,['Executive','Photo','Sidebar'],'teal-sidebar',true),
  t('bold-header-blue','Blueprint Bold','Bold','Full-width color band with clean two-column content.','#1d4ed8','#ffffff',false,['Bold','Modern'],'header-two-column'),
  t('green-sidebar-photo','Emerald Profile','Modern','Premium emerald sidebar and experience timeline.','#166534','#ffffff',false,['Modern','Photo','Green'],'emerald-sidebar',true),
  t('canva-elegant','Canva Elegance','Creative','Editorial portfolio composition with portrait focal point.','#7c3aed','#faf5ff',true,['Creative','Photo','Premium'],'editorial-photo',true),
  t('minimal-pro','Minimal Pro','Minimal','Ultra-clean one-column ATS layout with refined rules.','#111827','#ffffff',false,['Minimal','ATS'],'minimal'),
  t('dark-luxury','Dark Luxury','Executive','Charcoal editorial cover with restrained gold details.','#8b5e34','#f8f7f3',true,['Executive','Dark','Premium'],'luxury',true),
  t('fresh-orange','Vivid Sunrise','Creative','Warm orange portfolio layout for standout applications.','#c2410c','#fffaf5',false,['Creative','Bold'],'sunrise'),
  t('purple-modern','Violet Vision','Creative','Purple editorial profile with portrait and cards.','#6d28d9','#faf7ff',true,['Creative','Purple','Premium'],'violet-sidebar',true),
  t('google-standard','Google Standard','Big Tech','Minimal big-tech style focused on scannability.','#4285f4','#ffffff',true,['Big Tech','ATS'],'mono-ats'),
  t('two-column-mint','Mint Pro','Modern','Soft mint grid with clear information hierarchy.','#0d9488','#f0fdfa',false,['Modern','Clean'],'soft-modern'),
  t('red-header-bold','Crimson Power','Bold','Leadership resume with strong red masthead.','#b91c1c','#ffffff',false,['Bold','Leadership'],'header-two-column'),
  t('corporate-slate','Corporate Slate','Classic','Conservative slate layout for finance and consulting.','#334155','#ffffff',false,['Classic','Corporate'],'classic-sidebar'),
  t('creative-yellow','Golden Creative','Creative','Asymmetric golden editorial portfolio layout.','#a16207','#fffdf2',true,['Creative','Yellow','Premium'],'asymmetric'),
  t('microsoft-azure','Azure Blueprint','Big Tech','Microsoft-inspired blue professional grid.','#0078d4','#ffffff',true,['Big Tech','Blue'],'clean-grid'),
  t('pink-creative','Rose Portfolio','Design','Rose editorial card layout with portrait.','#be185d','#fff1f2',true,['Design','Creative'],'rose-card',true),
  t('developer-mono','Dev Stack','Tech','Code-editor inspired developer resume with monospace accents.','#0369a1','#f0f9ff',false,['Tech','Developer'],'developer'),
  t('amazon-leadership','Leadership Pulse','Big Tech','Metric-forward leadership layout with bold sections.','#d97706','#ffffff',true,['Big Tech','Leadership'],'executive-band'),
  t('academic-serif','Academic Serif','Academic','Research-friendly serif layout with dense references.','#1e3a5f','#fffef7',false,['Academic','Elegant'],'academic'),
  t('swiss-grid','Swiss Grid','Minimal','International Swiss grid with strong alignment and whitespace.','#111111','#ffffff',false,['Minimal','Grid','ATS'],'clean-grid'),
  t('consulting-brief','Consulting Brief','Classic','Consulting-ready one-page hierarchy with executive summary.','#1f2937','#ffffff',true,['Consulting','ATS'],'mono-ats'),
  t('product-leader','Product Leader','Executive','Executive band, KPI highlights and structured chronology.','#0f172a','#ffffff',true,['Executive','Product'],'executive-band'),
  t('designer-portfolio','Designer Portfolio','Design','Asymmetric portfolio card system for creative roles.','#db2777','#fff8fb',true,['Design','Portfolio'],'portfolio-grid',true),
  t('startup-founder','Startup Founder','Modern','Founder profile with large identity block and milestones.','#111827','#f8fafc',true,['Founder','Modern'],'split-header',true),
  t('legal-counsel','Legal Counsel','Classic','Formal serif resume with disciplined section rhythm.','#312e81','#ffffff',false,['Legal','Classic'],'academic'),
  t('finance-elite','Finance Elite','Executive','Sharp black-and-gold financial services composition.','#92400e','#fbfaf7',true,['Finance','Executive'],'luxury'),
  t('healthcare-pro','Healthcare Pro','Classic','Trust-first teal clinical resume with compact content.','#0f766e','#f8fffd',false,['Healthcare','Professional'],'timeline'),
  t('engineering-blueprint','Engineering Blueprint','Tech','Technical two-column blueprint with dense skills matrix.','#1d4ed8','#f8fbff',false,['Engineering','Tech'],'developer'),
  t('marketing-studio','Marketing Studio','Creative','Magazine-style marketing resume with visual rhythm.','#ea580c','#fffaf5',true,['Marketing','Creative'],'magazine',true),
  t('hr-people','People & Culture','Modern','Human-centered profile with soft cards and timeline.','#059669','#f5fffb',false,['HR','Modern'],'soft-modern',true),
  t('data-scientist','Data Scientist','Tech','Data-forward ATS layout with clean metric blocks.','#0369a1','#f8fbff',false,['Data','ATS'],'mono-ats'),
  t('architect-studio','Architect Studio','Design','Gallery-like editorial page with visual section frames.','#52525b','#fafafa',true,['Architecture','Design'],'portfolio-grid',true),
  t('journal-editorial','Journal Editorial','Creative','High-end editorial typography and asymmetric columns.','#7c2d12','#fffaf7',true,['Editorial','Creative'],'magazine'),
  t('blackline-ats','Blackline ATS','Minimal','Pure black-line ATS layout with no decorative clutter.','#111111','#ffffff',false,['ATS','Minimal'],'mono-ats'),
  t('photo-banner-pro','Photo Banner Pro','Modern','Portrait banner, strong identity and modular sections.','#0f172a','#ffffff',true,['Photo','Modern'],'photo-banner',true),
  t('dark-editorial','Dark Editorial','Executive','Black editorial cover with white typography and portrait.','#111111','#f4f4f5',true,['Dark','Editorial'],'dark-editorial',true),
  t('timeline-signature','Timeline Signature','Classic','Elegant chronology-driven layout for experienced candidates.','#334155','#ffffff',false,['Timeline','Classic'],'timeline'),
  t('atlantic-consulting','Atlantic Consulting','Consulting','Boardroom-ready consulting layout with compact evidence blocks.','#0f3d56','#ffffff',true,['Consulting','Executive'],'clean-grid'),
  t('monarch-executive','Monarch Executive','Executive','High-authority executive layout with refined typography.','#1c1917','#fafaf9',true,['Executive','Premium'],'luxury',true),
  t('nordic-minimal','Nordic Minimal','Minimal','Airy Scandinavian layout with disciplined hierarchy.','#334155','#ffffff',false,['Minimal','ATS'],'minimal'),
  t('studio-ink','Studio Ink','Creative','Editorial black-ink composition for designers and writers.','#18181b','#fafafa',true,['Creative','Editorial'],'magazine'),
  t('coral-product','Coral Product','Modern','Product-management layout with energetic coral accents.','#c2415a','#fffafa',false,['Product','Modern'],'split-header'),
  t('forest-leader','Forest Leader','Executive','Confident green-free neutral leadership layout with strong rail.','#1f2937','#f8fafc',true,['Leadership','ATS'],'executive-band'),
  t('signal-tech','Signal Tech','Tech','Technical portfolio with dense systems-oriented information blocks.','#075985','#f8fafc',false,['Tech','Systems'],'developer'),
  t('research-lab','Research Lab','Academic','Academic research profile with publication-friendly spacing.','#374151','#ffffff',true,['Research','Academic'],'academic'),
  t('venture-founder','Venture Founder','Modern','Founder narrative with milestones and concise business signals.','#111827','#f9fafb',true,['Founder','Startup'],'split-header',true),
  t('editorial-sand','Editorial Sand','Creative','Warm magazine-inspired layout with premium whitespace.','#7c5a3c','#fffdf8',true,['Editorial','Creative'],'magazine',true),
  t('pixel-craft','Pixel Craft','Design','Visual designer portfolio with modular project cards.','#4338ca','#fafaff',true,['Design','Portfolio'],'portfolio-grid',true),
  t('black-tie','Black Tie','Executive','Luxury monochrome executive resume with restrained contrast.','#111111','#ffffff',true,['Luxury','Executive'],'dark-editorial',true),
  t('precision-ats','Precision ATS','Minimal','Machine-readable one-column resume with strict hierarchy.','#1f2937','#ffffff',false,['ATS','Minimal'],'mono-ats'),
  t('blueprint-cv','Blueprint CV','Tech','Engineering-first grid optimized for technical hiring teams.','#1e40af','#f8fbff',false,['Engineering','ATS'],'clean-grid'),
  t('people-first','People First','Modern','Warm HR and people-operations profile with timeline rhythm.','#374151','#fafafa',false,['HR','People'],'soft-modern',true),
  t('health-science','Health Science','Academic','Clinical and science-focused resume with evidence hierarchy.','#164e63','#f8ffff',false,['Healthcare','Academic'],'timeline'),
  t('legal-editorial','Legal Editorial','Classic','Formal legal profile balancing authority and readability.','#292524','#fffdf8',true,['Legal','Classic'],'academic'),
  t('growth-marketer','Growth Marketer','Creative','High-impact marketing resume with campaign-style sections.','#9a3412','#fffaf5',true,['Marketing','Creative'],'sunrise',true),
  t('global-operator','Global Operator','Modern','International operations resume with clean global profile structure.','#334155','#ffffff',false,['Operations','Global'],'classic-sidebar'),
  t('career-switch','Career Switch','Modern','Transferable-skills-first structure for career transitions.','#4338ca','#fafaff',false,['Career Change','ATS'],'header-two-column'),
];

export const TEMPLATE_CATEGORIES = ['All','Classic','Modern','Bold','Creative','Minimal','Executive','Big Tech','Tech','Design','Academic'];

export function templateNeedsPhoto(template: TemplateDef, data?: ResumeData) {
  return Boolean(template.photoRequired || data?.photoUrl);
}
