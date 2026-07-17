export async function isSupabaseEgressRestricted(
  url: string | undefined,
  anonKey: string | undefined,
): Promise<boolean> {
  if (!url || !anonKey) {
    return false;
  }

  const response = await fetch(`${url}/rest/v1/data-person?select=id&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (response.ok) {
    return false;
  }

  const body = await response.text();
  return body.includes("exceed_egress_quota");
}
