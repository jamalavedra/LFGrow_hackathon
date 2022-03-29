import { gqlFetcher } from "./gqlFetcher";

export async function getMirrorData(address = "") {
  const jsonData = await gqlFetcher(
    "https://mirror-api.com/graphql",
    `{
      userProfile(address: "${address}") {
        contributor {
          publications {
            ensLabel
            displayName
          }
        }
      }
    }`
  );

  return jsonData["data"] && jsonData["data"]["userProfile"]["contributor"]
    ? jsonData["data"]["userProfile"]["contributor"]["publications"].length
    : 0;
}
