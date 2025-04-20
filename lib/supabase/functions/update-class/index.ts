import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
serve(async (_req)=>{
  try {
    const response = await fetch('http://courses.illinois.edu/cisapp/explorer/schedule/2025.xml');
    const xml = await response.text();
    // 👇 use 'text/html' instead of 'text/xml'
    const dom = new DOMParser().parseFromString(xml, 'text/html');
    if (!dom) throw new Error('Failed to parse XML/HTML');
    const courses = Array.from(dom.querySelectorAll('course')).map((course)=>({
        subject: course.querySelector('subject')?.textContent ?? '',
        number: course.querySelector('number')?.textContent ?? '',
        title: course.querySelector('label')?.textContent ?? ''
      }));
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/courses`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(courses)
    });
    return new Response(JSON.stringify({
      inserted: courses.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('[Function Error]', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
