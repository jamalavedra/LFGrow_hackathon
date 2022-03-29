// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.10;
import {Errors} from '../../../libraries/Errors.sol';
import {IReferenceModule} from '../../../interfaces/IReferenceModule.sol';
import {ModuleBase} from '../ModuleBase.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import 'hardhat/console.sol';

/**
 * @title ReputationOnlyReferenceModule
 * @author Lens Protocol
 *
 * @notice A simple reference module that validates that comments or mirrors originate from a profile with
 * certain reputation.
 */
contract ReputationOnlyReferenceModule is ChainlinkClient, IReferenceModule, ModuleBase {
    using Chainlink for Chainlink.Request;

    mapping(address => uint256) internal _scoreByAddress;
    mapping(address => uint256) public _reputationByAddress;
    mapping(bytes32 => address) internal _requestToAddress;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    constructor(address hub) ModuleBase(hub) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        oracle = 0x58BBDbfb6fca3129b91f0DBE372098123B38B5e9;
        jobId = "da20aae0e4c843f6949e5cb3f7cfe8c4";
        fee = 0.1 * 10**18; // (Varies by network and job)
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestAuraData(address user) public returns (bytes32 requestId) {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillMultipleParameters.selector
        );
        _requestToAddress[request.id] = user;

        string memory result_url =  string(abi.encodePacked('https://lfgrow-aura.vercel.app/api/', abi.encodePacked(user)));

        // Set the URL to perform the GET request on
        request.add(
            'get',
            result_url 
        );
        
        request.add('path', 'aura'); // Chainlink nodes 1.0.0 and later support this format

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
        uint256 _aura
    ) public recordChainlinkFulfillment(_requestId) {
        _reputationByAddress[_requestToAddress[_requestId]] = _aura;
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
        _scoreByAddress[recipient] = score * timesAmount;
        return data;
    }

    /**
     * @notice Validates that the commenting profile's owner has enough reputatino.
     *
     * NOTE: We don't need to care what the pointed publication is in this context.
     */
    function processComment(
        uint256 profileId,
        uint256 profileIdPointed,
        uint256 pubIdPointed
    ) external view override {
        address commentCreator = IERC721(HUB).ownerOf(profileId);
        // console.log(commentCreator,_scoreByAddress[commentCreator],_reputationByAddress[commentCreator],_reputationByAddress[commentCreator] > _scoreByAddress[commentCreator]);
        if (_scoreByAddress[commentCreator]==0||_reputationByAddress[commentCreator]==0||_reputationByAddress[commentCreator] > _scoreByAddress[commentCreator]) {
            revert Errors.ReferenceNotAllowed();
        }
    }

    /**
     *
     * NOTE: We don't need to care what the pointed publication is in this context.
     */
    function processMirror(
        uint256 profileId,
        uint256 profileIdPointed,
        uint256 pubIdPointed
    ) external view override {}
}
