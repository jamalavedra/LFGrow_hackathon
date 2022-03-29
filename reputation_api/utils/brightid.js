import { fetcher } from "./fetcher";
export async function checkBrightId(address) {
  try {
    const data = await fetcher(
      "GET",
      `https://app.brightid.org/node/v5/verifications/Convo/${address}`
    );

    return Boolean(data["data"]?.unique);
  } catch (error) {
    return false;
  }
}
