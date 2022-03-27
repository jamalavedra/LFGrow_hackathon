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
