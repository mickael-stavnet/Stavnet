export async function isD1WorkerAvailable(url: string | undefined, secret: string | undefined): Promise<boolean> {
  if (!url || !secret) return false;
  const response = await fetch(`${url}/v1/health`, { headers: { Authorization: `Bearer ${secret}` } });
  return response.ok;
}
