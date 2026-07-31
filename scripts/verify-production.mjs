const siteUrl = (process.env.STAVNET_PRODUCTION_URL ?? "https://israeli-literature.com").replace(/\/$/, "");
const runId = Date.now().toString();
const failures = [];

async function fetchPage(path, expectedText) {
  const url = new URL(path, `${siteUrl}/`);
  const response = await fetch(url, { cache: "no-store", redirect: "follow" });
  const body = await response.text();

  if (!response.ok) {
    failures.push(`${url} returned HTTP ${response.status}`);
    return;
  }

  if (expectedText && body.includes(expectedText)) {
    console.log(`ok ${url}`);
    return;
  }

  if (body.includes("Page introuvable")) {
    failures.push(`${url} rendered the not-found page`);
    return;
  }

  if (expectedText) {
    failures.push(`${url} did not include ${JSON.stringify(expectedText)}`);
    return;
  }

  console.log(`ok ${url}`);
}

async function fetchShowcase() {
  const url = new URL("/api/showcase", `${siteUrl}/`);
  url.searchParams.set("smoke", runId);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    failures.push(`${url} returned HTTP ${response.status}`);
    return;
  }

  const payload = await response.json();
  const entries = Array.isArray(payload.entries) ? payload.entries : [];

  if (entries.length === 0) {
    failures.push(`${url} returned no showcase entries`);
    return;
  }

  for (const entry of entries) {
    if (typeof entry.detailName !== "string" || entry.detailName.length === 0) {
      failures.push(`${url} returned an entry without a detail name`);
      continue;
    }

    const personUrl = new URL("/fr/persons/details", `${siteUrl}/`);
    personUrl.searchParams.set("name", entry.detailName);
    personUrl.searchParams.set("smoke", runId);
    await fetchPage(personUrl.pathname + personUrl.search, entry.detailName);
  }
}

await fetchPage("/fr", "Littérature israélienne");
await fetchPage(`/fr/persons/details?name=Alec%20Borenstein&smoke=${runId}`, "Alec Borenstein");
await fetchPage(`/fr/persons/details?name=Yehuda%20Lancry&smoke=${runId}`, "Yehuda Lancry");
await fetchPage(`/fr/books/details/table-of-contents?id=2887&smoke=${runId}`, "David Lazar");
await fetchPage(`/fr/orgs/details?name=Albin%20Michel&smoke=${runId}`, "Albin Michel");
await fetchPage(`/fr/books/by-title?title=Nadav&smoke=${runId}`, "Nadav");
await fetchPage(`/fr/books?title=Le%20messager&smoke=${runId}`, "Le messager meurtri");
await fetchPage(`/fr/search?smoke=${runId}`, "Recherche");
await fetchPage(`/fr/statistics?smoke=${runId}`, "Statistiques");
await fetchShowcase();

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`::error title=Production smoke check failed::${failure}`));
  process.exitCode = 1;
} else {
  console.log("Production smoke check passed.");
}
