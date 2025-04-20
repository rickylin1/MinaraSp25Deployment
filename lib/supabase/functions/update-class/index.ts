// supabase/functions/update-courses/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (_req) => {
  const response = await fetch('https://courses.illinois.edu/cisapi/schedule/2024/fall/CS')
  const xml = await response.text()

  const dom = new DOMParser().parseFromString(xml, 'application/xml')
  const courses = Array.from(dom.querySelectorAll('course')).map((course) => ({
    subject: course.querySelector('subject')?.textContent,
    number: course.querySelector('number')?.textContent,
    title: course.querySelector('label')?.textContent,
  }))

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/courses`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(courses),
  })

  return new Response(JSON.stringify({ inserted: courses.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
