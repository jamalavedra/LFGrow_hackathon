import { isAddress } from "ethers/lib/utils";

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

export async function AddressToEns(address) {
  try {
    let resp = await fetch(
      "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
      {
        headers: {
          accept: "*/*",
          "content-type": "application/json",
        },
        body:
          '{"query":"{\\n  domains(where:{resolvedAddress:\\"' +
          address.toLowerCase() +
          '\\"}) {\\n    name\\n  }\\n}\\n","variables":null}',
        method: "POST",
      }
    ).then((r) => {
      return r.json();
    });

    if (Boolean(resp["data"]["domains"][0]["name"]) === false) {
      return false;
    } else {
      return getAddress(resp["data"]["domains"][0]["name"]);
    }
  } catch (error) {
    console.log("AddressToEns.error", error);
    return false;
  }
}
