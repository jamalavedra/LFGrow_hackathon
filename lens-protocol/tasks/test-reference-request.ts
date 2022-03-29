import { task } from 'hardhat/config';
import {
  LensHub__factory,
} from '../typechain-types';
import {
  getAddrs,
  initEnv,
  waitForTx,
  ZERO_ADDRESS,
} from './helpers/utils';

task('test-reference-request', 'tests the ReputationOnlyReferenceModule').setAction(async ({}, hre) => {
  const [governance,  ,user] = await initEnv(hre);
  const addrs = getAddrs();
  const lensHub = LensHub__factory.connect(addrs['lensHub proxy'], governance);


  const emptyCollectModuleAddr = addrs['empty collect module'];

    
  try {
    await waitForTx(lensHub.connect(user).comment({
      profileId: 1,
      contentURI: 'https://ipfs.fleek.co/ipfs/ieiecaca',
      profileIdPointed: 1,
      pubIdPointed: 1,
      collectModule: emptyCollectModuleAddr,
      collectModuleData: [],
      referenceModule: ZERO_ADDRESS,
      referenceModuleData: [],
    }));
  } catch (e) {
    console.log(`Expected failure occurred! Error: ${e}`);
  }

  const reputationOnlyReferenceModuleFactory = await hre.ethers.getContractFactory("ReputationOnlyReferenceModule");

  // Get signer information
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];


  const reputationOnlyReferenceContract = new hre.ethers.Contract(
    addrs['reputation only reference module'],
    reputationOnlyReferenceModuleFactory.interface,
    signer
);
console.log('requesting reputation')
await waitForTx(await reputationOnlyReferenceContract.requestAuraData(signer.address));

await waitForTx(lensHub.connect(user).comment({
  profileId: 1,
  contentURI: 'https://ipfs.fleek.co/ipfs/ieiecaca',
  profileIdPointed: 1,
  pubIdPointed: 1,
  collectModule: emptyCollectModuleAddr,
  collectModuleData: [],
  referenceModule: ZERO_ADDRESS,
  referenceModuleData: [],
}));
console.log('Commented!')

});