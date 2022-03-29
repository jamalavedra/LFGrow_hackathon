import { isBlockchainAddress, addressToEns } from "../../utils/stringUtils";
import { getPoapData } from "../../utils/poap";
import { checkBrightId } from "../../utils/brightid";
import { getMirrorData } from "../../utils/mirror";
import { getAaveData } from "../../utils/aave";

const handler = async (req, res) => {
  try {
    let { address } = req.query;

    if (isBlockchainAddress(address) === true) {
      let resp = {};
      let reputation = 0;
      let resp_ens = await addressToEns(address);
      let resp_poap = await getPoapData(address);
      let resp_brightid = await checkBrightId(address);
      let resp_mirror = await getMirrorData(address);
      let resp_aave = await getAaveData(address, {
        polygonMainnetRpc: "https://polygon-rpc.com/",
        etherumMainnetRpc:
          "https://mainnet.infura.io/v3/1e7969225b2f4eefb3ae792aabf1cc17",
        avalancheMainnetRpc: "https://api.avax.network/ext/bc/C/rpc",
      });

      resp["aave"] = resp_aave;
      reputation += resp_aave.totalHf;

      resp["poaps"] = 0;
      if (resp_poap > 0) {
        resp["poaps"] = resp_poap;
        reputation += 10;
      }

      resp["mirror_contributions"] = 0;
      if (resp_mirror > 0) {
        resp["mirror_contributions"] = resp_mirror;
        reputation += 10;
      }

      resp["brightId"] = resp_brightid;
      if (resp_brightid) {
        reputation += 10;
      }
      resp["ens"] = resp_ens;
      if (resp_ens !== false) {
        reputation += 10;
      }

      return res
        .status(200)
        .json({ data: resp, aura: reputation, success: true });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid address.",
      });
    }
  } catch (error) {
    console.log("handler.error", error);
    return res.status(500).json({ success: false, error });
  }
};

export default handler;
