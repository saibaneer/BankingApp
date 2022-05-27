//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Banking {

    IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    struct Account {
        uint accountId;
        uint userBalance;
        address userAddress;

    }

    uint24 accountNumber = 100_000;

    
    mapping(address => uint) public addressToAccountId;
    mapping(uint => address) public accountIdToAddress;
    mapping(address => Account) public accountPosition;
    


    function depositFunds(uint _amount) public {
        if(addressToAccountId[msg.sender] == 0){
            dai.transferFrom(msg.sender, address(this), _amount);
            accountNumber++;
            addressToAccountId[msg.sender] = accountNumber;
            accountIdToAddress[accountNumber] = msg.sender;

            accountPosition[msg.sender].accountId = addressToAccountId[msg.sender];
            accountPosition[msg.sender].userBalance += _amount;
            accountPosition[msg.sender].userAddress = msg.sender;
            
        } else {
            
            accountPosition[msg.sender].accountId = addressToAccountId[msg.sender];

            accountPosition[msg.sender].userBalance += _amount;
            accountPosition[msg.sender].userAddress = msg.sender;
        }
        

    }

    function withdrawFunds(uint _amount) public {
        require(_amount < accountPosition[msg.sender].userBalance, "Insufficient funds");

        accountPosition[msg.sender].userBalance -= _amount;

        dai.transferFrom(address(this), msg.sender, _amount);    
    }

    function transferP2P(uint accountId, uint _amount) public {
        require(_amount < accountPosition[msg.sender].userBalance, "Insufficient funds");
        address recipient = accountIdToAddress[accountId];

        accountPosition[msg.sender].userBalance -= _amount;    
        accountPosition[recipient].userBalance += _amount;


    }

}