// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

error Raffle_notEnoug();
error TransferFailer();
error Raffle__NotOpen();
error Raffle__upKeepNotNeeded();

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    //Types
    enum RaffleState {
        OPEN,
        CLOSE,
        CALCULATING
    }

    //state Variable
    uint64 s_subscriptionId;
    bytes32 keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 private numWords = 1;
    uint256[] public s_randomWords;
    uint256 public s_requestId;
    address s_owner;

    //Game variable

    address s_resecnWinner;
    RaffleState private s_raffleState;
    uint256 s_lastTimeStamp;
    uint256 s_interval;

    uint256 private i_entranceFee;
    VRFCoordinatorV2Interface private immutable i_VRFCoordinator;
    address payable[] private s_players;
    //Events
    event RaffleEnter(address indexed player);
    event RequstedRaffleWinner(uint256 indexed requestId);
    event AddressWinnerPicked(address indexed winner);

    constructor(
        address vrfCoordinator,
        uint256 entranceFee,
        uint64 subscriptionId,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_entranceFee = entranceFee;
        i_VRFCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        s_interval = interval;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle_notEnoug();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }

        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool timePassed = block.timestamp - s_lastTimeStamp > s_interval;
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__upKeepNotNeeded();
        }

        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_VRFCoordinator.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        emit RequstedRaffleWinner(requestId);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getInterval() public view returns (uint256) {
        return s_interval;
    }

    function getPlayers(uint256 _index) public view returns (address) {
        return s_players[_index];
    }

    function fulfillRandomWords(
        uint256, /*requestId*/
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_resecnWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert TransferFailer();
        }
        emit AddressWinnerPicked(recentWinner);
    }

    function gerRecentWinner() public view returns (address) {
        return s_resecnWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        uint256 leng = s_players.length;
        return leng;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }
}
