self.onmessage = function (e) {
    console.log('[Worker] Started with message:', e.data);
  
    const invokeFunction = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
  
        const result = await response.json();
        postMessage({ success: true, result });
      } catch (error) {
        console.error('[Worker] Error:', error);
        postMessage({ success: false, error: error.message });
      }
    };
  
    // Call the function immediately on 12-hour intervals
    invokeFunction();
    setInterval(invokeFunction, 4320000); // 12 hrs
  };