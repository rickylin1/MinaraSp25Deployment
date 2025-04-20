import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
serve(async (_req)=>{
  const response = await fetch("https://courses.illinois.edu/cisapi/schedule/2024/fall/CS");
  const xml = await response.text();
  // Parse the XML with DOMParser
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (!doc) {
    return new Response(JSON.stringify({
      error: "Failed to parse XML"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  // Use XPath to extract course data
  const courses = [];
  const courseElements = doc.querySelectorAll("course");
  courseElements.forEach((course)=>{
    const subject = course.querySelector("subject")?.textContent ?? "";
    const number = course.querySelector("number")?.textContent ?? "";
    const title = course.querySelector("label")?.textContent ?? "";
    courses.push({
      subject,
      number,
      title
    });
  });
  // Insert into Supabase (same as before)
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/courses`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(courses)
  });
  if (!insertRes.ok) {
    const errorText = await insertRes.text();
    return new Response(JSON.stringify({
      error: errorText
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  return new Response(JSON.stringify({
    inserted: courses.length
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
