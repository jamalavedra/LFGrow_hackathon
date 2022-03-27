import fetch from "cross-fetch";
import AbortController from "abort-controller";

export async function gqlFetcher(url, query, variables = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 5000);

  try {
    const req = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      signal: controller.signal,
    });
    return await req.json();
  } catch (error) {
    console.error(url, error);
    return { error };
  } finally {
    clearTimeout(timeout);
  }
}
