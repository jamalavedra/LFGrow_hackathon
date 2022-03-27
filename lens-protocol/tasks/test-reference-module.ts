import { task } from 'hardhat/config';
import {
  LensHub__factory,
  ReputationOnlyReferenceModule__factory,
} from '../typechain-types';
import { CreateProfileDataStruct } from '../typechain-types/LensHub';
import {
  deployContract,
  getAddrs,
  initEnv,
  ProtocolState,
  waitForTx,
  ZERO_ADDRESS,
} from './helpers/utils';

task('test-reference-module', 'tests the ReputationOnlyReferenceModule').setAction(async ({}, hre) => {
  const [governance, , user] = await initEnv(hre);
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

  const inputStruct_2: CreateProfileDataStruct = {
    to: user.address,
    handle: 'one1dot',
    imageURI:
      'https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan',
    followModule: ZERO_ADDRESS,
    followModuleData: [],
    followNFTURI:
      'https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan',
  };

  await waitForTx(lensHub.connect(user).createProfile(inputStruct_1));
  await waitForTx(lensHub.connect(user).createProfile(inputStruct_2));

  const reputationOnlyReferenceModule = await deployContract(
    new ReputationOnlyReferenceModule__factory(governance).deploy(lensHub.address)
  );
  await waitForTx(lensHub.whitelistReferenceModule(reputationOnlyReferenceModule.address, true));

  lensHub.comment({
    profileId: 2,
    contentURI: 'https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan',
    profileIdPointed: 1,
    pubIdPointed: 1,
    collectModule: ZERO_ADDRESS,
    collectModuleData: [],
    referenceModule: ZERO_ADDRESS,
    referenceModuleData: [],
  })

});