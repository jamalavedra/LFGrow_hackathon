import { fetcher } from "./fetcher";
export async function getPoapData(address) {
  const data = await fetcher(
    "GET",
    `https://api.poap.xyz/actions/scan/${address}`
  );

  return data.length;
}
