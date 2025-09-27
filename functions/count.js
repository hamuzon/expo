export async function onRequest(context) {
  const expoDates = {
    "2025": {start:"2025-04-13T00:00:00+09:00", end:"2025-10-13T00:00:00+09:00"},
    "2027": {start:"2027-04-01T00:00:00+09:00", end:"2027-07-01T00:00:00+09:00"},
    "2030": {start:"2030-04-01T00:00:00+03:00", end:"2030-10-01T00:00:00+03:00"}
  };

  const url = new URL(context.request.url);
  const year = url.searchParams.get("year") || "2025";

  const now = new Date();
  const start = new Date(expoDates[year].start);
  const end = new Date(expoDates[year].end);

  const diffDays = ms => Math.floor(ms / (1000*60*60*24));

  let response = {};

  if(now < start){
    response = {status: "before", daysUntilStart: diffDays(start - now)};
  } else if(now >= start && now <= end){
    response = {
      status: "ongoing",
      dayNumber: diffDays(now - start) + 1,
      daysRemaining: diffDays(end - now)
    };
  } else {
    response = {status: "after", daysSinceEnd: diffDays(now - end)};
  }

  const userAgent = context.request.headers.get("user-agent") || "";

  // ブラウザなら整形表示、APIなら生JSON
  if(userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari")) {
    // ブラウザ向けHTML表示
    const html = `<html><head><title>Expo Countdown API</title></head>
      <body>
        <h2>Expo Countdown (${year})</h2>
        <pre>${JSON.stringify(response, null, 2)}</pre>
      </body></html>`;
    return new Response(html, {headers: {"Content-Type": "text/html"}});
  } else {
    // APIとしてのJSON返却
    return new Response(JSON.stringify(response), {
      headers: {"Content-Type": "application/json"}
    });
  }
}