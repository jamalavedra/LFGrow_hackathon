import { gqlFetcher } from "./gqlFetcher";

export async function getLensData(address) {
  try {
    let query = `{
        profiles(where: {id: "${address.toLowerCase()}"}) {
          id
          profileId
          pubCount
          handle
          imageURI
        }
      }`;
    let response = await gqlFetcher(
      "https://api.thegraph.com/subgraphs/id/QmcH6BYapdqB6hqJSVFk4neCYCe94VDkraPRTJxEPb5ULH",
      query
    );

    if (response["data"]["profiles"].length > 0) {
      return {
        profileId: parseInt(response["data"]["profiles"][0].profileId),
        pubCount: parseInt(response["data"]["profiles"][0].pubCount),
        handle: response["data"]["profiles"][0].handle,
        imageURI: response["data"]["profiles"][0].imageURI,
        following:
          response["data"]["socialGraphs"].length > 0
            ? response["data"]["socialGraphs"][0].following.length
            : 0,
      };
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
