const headers = {
  Authorization: "Bearer gumlet_798c4b26c6bab74fa8bf7bf4cf0c88dc",
  "Content-Type": "application/json",
};

async function probe(path: string, method = "GET", body?: object) {
  const url = `https://api.gumlet.com/v1${path}`;
  const opts: RequestInit = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  const text = await r.text();
  console.log(`\n[${method} ${path}] → ${r.status}`);
  try { console.log(JSON.stringify(JSON.parse(text), null, 2)); }
  catch { console.log(text); }
}

(async () => {
  await probe("/video/workspaces");
  await probe("/workspaces");
  await probe("/video/folders");
  await probe("/folders");
  // Try to list assets to get workspace_id from response
  await probe("/video/assets/upload", "POST", { title: "probe-test", format: "mp4", workspace_id: "test" });
})();
