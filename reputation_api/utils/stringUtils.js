import { isAddress } from "ethers/lib/utils";
import { gqlFetcher } from "./gqlFetcher";
export const isBlockchainAddress = (address) => {
  if (isAddress(address) === true) {
    // ethereum
    return true;
  }
  if (address.length === 18 && address.slice(0, 2) === "0x") {
    // flow
    return true;
  } else if (
    address.slice(address.length - 5, address.length) === ".near" ||
    address.slice(address.length - 8, address.length) === ".testnet"
  ) {
    //near
    return true;
  } else if (/^[A-HJ-NP-Za-km-z1-9]*$/.test(address)) {
    // solana base58 check
    return true;
  } else if (address.slice(0, 2) === "0:" && address.length === 66) {
    // freeton
    return true;
  } else {
    return false;
  }
};

export async function ensToAddress(ensAddress) {
  try {
    let resp = await fetch(
      "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
      {
        headers: {
          accept: "*/*",
          "content-type": "application/json",
        },
        body:
          '{"query":"{\\n  domains(where:{name:\\"' +
          ensAddress +
          '\\"}) {\\n    resolvedAddress {\\n      id\\n    }\\n  }\\n}\\n","variables":null}',
        method: "POST",
      }
    ).then((r) => {
      return r.json();
    });

    if (Boolean(resp["data"]["domains"][0]["resolvedAddress"]) === false) {
      return false;
    } else {
      return getAddress(resp["data"]["domains"][0]["resolvedAddress"]["id"]);
    }
  } catch (error) {
    console.log("ensToAddress.error", error);
    return false;
  }
}

export async function addressToEns(address) {
  try {
    let query = `
    {
        domains (where: {resolvedAddress: "${address.toLowerCase()}"}){
            name
        }
    }
    `;
    let resp = await gqlFetcher(
      "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
      query
    );
    if (Boolean(resp["data"]["domains"].length === 0)) {
      return false;
    } else {
      var finalDomain = false;
      for (var index = 0; index < resp["data"]["domains"].length; index++) {
        var domain = resp["data"]["domains"][index];
        if (domain.name.split(".").length == 2) {
          finalDomain = domain.name;
        }
      }
      return finalDomain;
    }
  } catch (error) {
    console.log("AddressToEns.error", error);
    return false;
  }
}
