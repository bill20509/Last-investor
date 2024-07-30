// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
contract LastInvestor {
    address public lastInvestor;
    uint256 public lastInvestTime;
    uint256 public constant INC_TIME = 1 hours;
    uint256 public start_time;
    uint256 public end_time;
    uint256 public min_investment = 0.01 ether;
    uint256 public totalFunds;
    string public name = "Last Investor Game";

    event Invest(address indexed investor, uint256 amount);
    event LastInvestorAnnounce(address indexed investor, uint256 amount);

    constructor() {
        lastInvestor = address(0);
        lastInvestTime = block.timestamp;
        start_time = block.timestamp;
        end_time = block.timestamp + 1 days;
    }

    function invest() external payable {
        require(msg.value > 0, "Investment must be greater than zero");
        require(block.timestamp < end_time, "Pool is end, you can't invest");

        // Update last investment time and investor
        end_time += INC_TIME;
        lastInvestor = msg.sender;
        // 90% of the investment goes to the pool, 10% of the investment goes to the owner
        totalFunds += (msg.value * 90) / 100;

        min_investment += 0.01 ether;

        emit Invest(msg.sender, msg.value);
    }

    function claim() external {
        require(
            lastInvestor == msg.sender,
            "You are not the last investor, you can't claim"
        );
        require(
            block.timestamp >= end_time,
            "Pool didn't end, you can't claim"
        );

        require(lastInvestor != address(0), "No investments yet");

        address payable winner = payable(lastInvestor);
        uint256 reward = totalFunds;

        // Reset contract state
        lastInvestor = address(0);
        lastInvestTime = block.timestamp;
        totalFunds = 0;

        // Transfer funds to the winner
        winner.transfer(reward);

        emit LastInvestorAnnounce(winner, reward);
    }

    function getTimeRemaining() external view returns (uint256) {
        return end_time - block.timestamp;
    }
    function getMinInvestment() external view returns (uint256) {
        return min_investment;
    }
    function getTotalFunds() external view returns (uint256) {
        return totalFunds;
    }
}
