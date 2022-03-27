import { isBlockchainAddress, addressToEns } from "../../utils/stringUtils";
import { getLensData } from "../../utils/lens";

const handler = async (req, res) => {
  try {
    let { address } = req.query;

    if (isBlockchainAddress(address) === true) {
      let resp = [];
      let resp_ens = await addressToEns(address);
      // let resp_lens = await getLensData(address);
      console.log(resp_lens);
      if (resp_ens !== false) {
        resp.push({ ens: resp_ens });
      }
      // if (resp_lens !== false) {
      //   resp.push({ lens: resp_lens });
      // }
      if (resp.length > 0) {
        return res.status(200).json({ ...resp[0], success: true });
      } else {
        return res.status(200).json({});
      }
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
