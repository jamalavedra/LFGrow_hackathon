import { task } from 'hardhat/config';
import {
  LensHub__factory,
  ReputationOnlyReferenceModule__factory,
} from '../typechain-types';
import { CreateProfileDataStruct,PostDataStruct } from '../typechain-types/LensHub';
import {
  deployContract,
  getAddrs,
  initEnv,
  ProtocolState,
  waitForTx,
  ZERO_ADDRESS,
} from './helpers/utils';
import { defaultAbiCoder } from 'ethers/lib/utils';

task('test-reference-module', 'tests the ReputationOnlyReferenceModule').setAction(async ({}, hre) => {
  const [governance,  ,user] = await initEnv(hre);
  const addrs = getAddrs();
  const lensHub = LensHub__factory.connect(addrs['lensHub proxy'], governance);

  await waitForTx(lensHub.setState(ProtocolState.Unpaused));
  await waitForTx(lensHub.whitelistProfileCreator(user.address, true));

  const inputStruct_1: CreateProfileDataStruct = {
    to: user.address,
    handle: 'zer0dot',
    imageURI:
      'https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan',
    followModule: ZERO_ADDRESS,
    followModuleData: [],
    followNFTURI:
      'https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan',
  };
  await waitForTx(lensHub.connect(user).createProfile(inputStruct_1));

  const emptyCollectModuleAddr = addrs['empty collect module'];
  const reputationOnlyReferenceModule = await deployContract(
    new ReputationOnlyReferenceModule__factory(governance).deploy(lensHub.address)
  );

  await waitForTx(lensHub.whitelistCollectModule(emptyCollectModuleAddr, true));
  await waitForTx(lensHub.whitelistReferenceModule(reputationOnlyReferenceModule.address, true));

  const data = defaultAbiCoder.encode(['uint256', 'address'], ['10','0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']);

  const inputStruct: PostDataStruct = {
    profileId: 1,
    contentURI:
      'https://ipfs.fleek.co/ipfs/plantghostplantghostplantghostplantghostplantghostplantghos',
    collectModule: emptyCollectModuleAddr,
    collectModuleData: [],
    referenceModule: reputationOnlyReferenceModule.address,
    referenceModuleData: data,
  };
  await waitForTx(lensHub.connect(user).post(inputStruct));
  console.log('\n-----------------------\n')
  console.log(await lensHub.getPub(1, 1));

    
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

});