// Optional production AI parser. Deploy with Supabase CLI and set OPENAI_API_KEY as a secret.
// The browser builder always has a deterministic local parser fallback, so the app remains usable without this function.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const schema = {
  name:'',title:'',email:'',phone:'',location:'',website:'',linkedin:'',summary:'',
  experience:[],projects:[],education:[],skills:[],achievements:[],certificates:[],languages:[]
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { text } = await req.json();
    if (typeof text !== 'string' || text.trim().length < 20) throw new Error('Resume text is too short to parse.');
    const key = Deno.env.get('OPENAI_API_KEY');
    if (!key) throw new Error('OPENAI_API_KEY is not configured.');

    const prompt = `You are a resume parsing engine. Convert the supplied resume text into valid JSON only. Never invent facts. Preserve all real content. Normalize dates and section names. Return exactly this structure: ${JSON.stringify(schema)}. Experience items must contain id, role, company, startDate, endDate, description, bullets. Project items must contain id, name, techStack, description, link. Education items must contain id, degree, institution, startDate, endDate, grade. Skills and languages must be arrays of individual strings. Resume text:\n\n${text.slice(0, 30000)}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body:JSON.stringify({model:'gpt-4o-mini',temperature:0,response_format:{type:'json_object'},messages:[{role:'system',content:'Return JSON only. Do not hallucinate or add facts.'},{role:'user',content:prompt}]})
    });
    if (!response.ok) throw new Error(`AI parser returned HTTP ${response.status}.`);
    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI parser returned no structured result.');
    const parsed = JSON.parse(content);
    return new Response(JSON.stringify({ data: parsed }), { headers:{...cors,'Content-Type':'application/json'} });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'AI parsing failed' }), { status:400, headers:{...cors,'Content-Type':'application/json'} });
  }
});
