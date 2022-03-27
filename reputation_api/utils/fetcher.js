import fetch from "cross-fetch";
import AbortController from "abort-controller";

export async function fetcher(
  requestMethod,
  url,
  apikey = "",
  body = {},
  customHeaders = {}
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 6000);

  try {
    let reqUrl = url;
    if (apikey != "") {
      reqUrl += (url.includes("?") === true ? "&" : "?") + "apikey=" + apikey;
    }

    if (requestMethod === "GET") {
      const response = await fetch(reqUrl, {
        headers: {
          ...customHeaders,
        },
        signal: controller.signal,
      });

      // console.log(response.status, response.ok);
      if (
        response.ok === true &&
        response.status >= 200 &&
        response.status < 300
      ) {
        const data = await response.json();
        return data;
      } else {
        return {};
      }
    } else if (
      requestMethod === "POST" ||
      requestMethod === "UPDATE" ||
      requestMethod === "DELETE"
    ) {
      const response = await fetch(reqUrl, {
        method: requestMethod,
        body: JSON.stringify(body),
        headers: {
          ...customHeaders,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      if (
        response.ok === true &&
        response.status >= 200 &&
        response.status < 300
      ) {
        const data = await response.json();
        return data;
      } else {
        return {};
      }
    }
  } catch (error) {
    console.error(url, error);
    return { error };
  } finally {
    clearTimeout(timeout);
  }
}
