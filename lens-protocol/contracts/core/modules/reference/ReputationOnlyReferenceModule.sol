// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.10;
import {Errors} from '../../../libraries/Errors.sol';
import {IReferenceModule} from '../../../interfaces/IReferenceModule.sol';
import {ModuleBase} from '../ModuleBase.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import 'hardhat/console.sol';

/**
 * @notice A struct containing the necessary data to execute follow actions on a given profile.
 *
 * @param score The min reputations core needed for this profile
 * @param recipient The recipient address associated with this profile.
 */
struct ProfileData {
    uint256 score;
    address recipient;
}

/**
 * @title ReputationOnlyReferenceModule
 * @author Lens Protocol
 *
 * @notice A simple reference module that validates that comments or mirrors originate from a profile with
 * certain reputation.
 */
contract ReputationOnlyReferenceModule is ChainlinkClient, IReferenceModule, ModuleBase {
    using Chainlink for Chainlink.Request;

    mapping(uint256 => ProfileData) internal _scoreByProfile;
    mapping(uint256 => uint256) public _reputationByProfile;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    constructor(address hub) ModuleBase(hub) {
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = 'd5270d1c311941d0b08bead21fea7747';
        fee = 0.1 * 10**18; // (Varies by network and job)
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestVolumeData(address user) public returns (bytes32 requestId) {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillMultipleParameters.selector
        );

        // Set the URL to perform the GET request on
        request.add(
            'get',
            'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD' 
        );

        // Set the path to find the desired data in the API response, where the response format is:
        // {"RAW":
        //   {"ETH":
        //    {"USD":
        //     {
        //      "VOLUME24HOUR": xxx.xxx,
        //     }
        //    }
        //   }
        //  }
        // request.add("path", "RAW.ETH.USD.VOLUME24HOUR"); // Chainlink nodes prior to 1.0.0 support this format
        request.add('path', 'RAW,ETH,USD,VOLUME24HOUR'); // Chainlink nodes 1.0.0 and later support this format

        // Multiply the result by 1000000000000000000 to remove decimals
        int256 timesAmount = 10**18;
        request.addInt('times', timesAmount);

        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfillMultipleParameters(
        bytes32 _requestId,
        uint256 _volume,
        uint256 profileId
    ) public recordChainlinkFulfillment(_requestId) {
        _reputationByProfile[profileId] = _volume;
    }

    function withdrawLink() external {
        // Implement a withdraw function to avoid locking LINK tokens in the contract by transferring them to the owner
    }

    /**
     * @dev There is nothing needed at initialization.
     */
    function initializeReferenceModule(
        uint256 profileId,
        uint256 pubId,
        bytes calldata data
    ) external onlyHub returns (bytes memory) {
        (uint256 score, address recipient) = abi.decode(data, (uint256, address));
        if (recipient == address(0) || score == 0) revert Errors.InitParamsInvalid();
        // Multiply the result by 1000000000000000000 to remove decimals
        uint256 timesAmount = 10**18;
        _scoreByProfile[profileId].score = score * timesAmount;
        _scoreByProfile[profileId].recipient = recipient;
        return data;
    }

    /**
     * @notice Validates that the commenting profile's owner is a follower.
     *
     * NOTE: We don't need to care what the pointed publication is in this context.
     */
    function processComment(
        uint256 profileId,
        uint256 profileIdPointed,
        uint256 pubIdPointed
    ) external view override {
        address commentCreator = IERC721(HUB).ownerOf(profileId);

        if (_reputationByProfile[profileId] > _scoreByProfile[profileId].score) {
            revert Errors.ReferenceNotAllowed();
        }
    }

    /**
     * @notice Validates that the commenting profile's owner is a follower.
     *
     * NOTE: We don't need to care what the pointed publication is in this context.
     */
    function processMirror(
        uint256 profileId,
        uint256 profileIdPointed,
        uint256 pubIdPointed
    ) external view override {}
}
