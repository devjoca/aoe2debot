const AGE2_BASE_URL = "https://api.ageofempires.com";

export async function postAge2<T>(path: string, payload: unknown): Promise<T | null> {
  const response = await fetch(`${AGE2_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.ageofempires.com",
      Referer: "https://www.ageofempires.com/",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Age2 API error ${response.status} for ${path}`);
  }

  return (await response.json()) as T;
}
