import { isBlockchainAddress, addressToEns } from "../../utils/stringUtils";
import { getPoapData } from "../../utils/poap";
import { checkBrightId } from "../../utils/brightid";

const handler = async (req, res) => {
  try {
    let { address } = req.query;

    if (isBlockchainAddress(address) === true) {
      let resp = {};
      let reputation = 0;
      let resp_ens = await addressToEns(address);
      let resp_poap = await getPoapData(address);
      let resp_brightid = await checkBrightId(address);

      if (resp_poap > 0) {
        resp["poap"] = resp_poap;
        reputation += 10;
      }
      resp["brightid"] = resp_brightid;
      if (resp_brightid) {
        reputation += 10;
      }

      if (resp_ens !== false) {
        resp["ens"] = resp_ens;
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
