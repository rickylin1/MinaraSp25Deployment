// import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// import { XMLParser } from 'https://esm.sh/fast-xml-parser';
// serve(async (_req)=>{
//   try {
//     const parser = new XMLParser({
//       ignoreAttributes: false,
//       ignoreNameSpace: true
//     });
//     const courses = [];
//     // Helper to fetch and parse XML
//     async function fetchXml(url) {
//       const response = await fetch(url);
//       if (!response.ok) throw new Error(`Failed to fetch ${url}`);
//       const xml = await response.text();
//       return parser.parse(xml);
//     }
//     const base = 'http://courses.illinois.edu/cisapp/explorer/schedule/2024';
//     const schedule = await fetchXml(`${base}.xml`);
//     const terms = schedule['schedule']?.['term'];
//     if (!terms) throw new Error('No terms found');
//     const termsArray = Array.isArray(terms) ? terms : [
//       terms
//     ];
//     console.log(`Found ${termsArray.length} terms`);
//     // Loop over all terms (fall, spring, etc.)
//     for (const term of termsArray){
//       const termPath = term['href'];
//       const termUrl = `http://courses.illinois.edu${termPath}.xml`;
//       const termData = await fetchXml(termUrl);
//       const subjects = termData['term']?.['subject'];
//       if (!subjects) {
//         console.warn(`No subjects found for term ${term['id']}`);
//         continue;
//       }
//       const subjectsArray = Array.isArray(subjects) ? subjects : [
//         subjects
//       ];
//       console.log(`Fetching ${subjectsArray.length} subjects in ${term['id']}...`);
//       // Fetch all subjects in parallel!
//       const subjectPromises = subjectsArray.map(async (subject)=>{
//         try {
//           const subjectCode = subject['code'];
//           const subjectPath = subject['href'];
//           const subjectUrl = `http://courses.illinois.edu${subjectPath}.xml`;
//           const subjectData = await fetchXml(subjectUrl);
//           const subjectCourses = subjectData['subject']?.['course'];
//           if (!subjectCourses) return [];
//           const courseArray = Array.isArray(subjectCourses) ? subjectCourses : [
//             subjectCourses
//           ];
//           return courseArray.map((course)=>({
//               subject: subjectCode,
//               number: course['number'] ?? '',
//               title: course['label'] ?? '',
//               term: term['id'] ?? ''
//             }));
//         } catch (err) {
//           console.warn(`Failed fetching subject: ${subject['code']} - ${err.message}`);
//           return [];
//         }
//       });
//       const subjectCoursesArrays = await Promise.all(subjectPromises);
//       // Flatten arrays and add to master list
//       for (const subjectCourses of subjectCoursesArrays){
//         courses.push(...subjectCourses);
//       }
//     }
//     console.log(`Total courses fetched: ${courses.length}`);
//     // Insert into Supabase
//     const supabaseUrl = Deno.env.get('SUPABASE_URL');
//     const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
//     if (!supabaseUrl || !supabaseKey) {
//       throw new Error('Missing Supabase environment variables');
//     }
//     const insertResponse = await fetch(`${supabaseUrl}/rest/v1/courses`, {
//       method: 'POST',
//       headers: {
//         apikey: supabaseKey,
//         Authorization: `Bearer ${supabaseKey}`,
//         'Content-Type': 'application/json',
//         Prefer: 'return=minimal'
//       },
//       body: JSON.stringify(courses)
//     });
//     if (!insertResponse.ok) {
//       const errorText = await insertResponse.text();
//       throw new Error(`Supabase insert error: ${errorText}`);
//     }
//     return new Response(JSON.stringify({
//       inserted: courses.length
//     }), {
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*'
//       }
//     });
//   } catch (error) {
//     console.error('[Function Error]', error);
//     return new Response(JSON.stringify({
//       error: error.message
//     }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//   }
// });
