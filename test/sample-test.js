const { expect } = require("chai");
const { ethers } = require("hardhat");
const { assert } = require("chai");

describe("Simple Banking App for DAI", function(){

  let alice;
  let bob;
  let banking;
  let dai;
  let charlie = "0x7923eF1B53EB2cBbf8643f835AAdD32f9f1dD240";
  let charlieSigner;
  
  before(async function(){
    const Banking = await ethers.getContractFactory("Banking");
    banking = await Banking.deploy()
    await banking.deployed()
    console.log("Contract Address is: ", banking.address);

    dai = await ethers.getContractAt(
      "IERC20",
      "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    );

    [alice, bob] = await ethers.getSigners();

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [charlie],
    });
    
    charlieSigner = await ethers.getSigner(charlie)

  })

  it("should allow deposit of DAI tokens", async function(){
    //console.log(await dai.balanceOf(charlie))
    await dai.connect(charlieSigner).approve(banking.address, 300);
    await banking.connect(charlieSigner).depositFunds(300);
    const account = await banking.accountPosition(charlie);
    // console.log("Account Id is: ",account.accountId);
    // console.log("User Balance is: ", account.userBalance);
    // console.log("User Address is: ", account.userAddress);
    expect(account.accountId).to.equal(100001);
    expect(account.userBalance).to.equal(300);
    expect(account.userAddress).to.equal(charlie);
  })
  it("Should allow a user do transfer to other users.", async function(){
    await dai.connect(charlieSigner).approve(alice.address, 30000);
    await dai.connect(charlieSigner).transfer(alice.address, 30000);
    // console.log(await dai.balanceOf(alice.address));

    await dai.connect(alice).approve(banking.address, 1300);
    await banking.connect(alice).depositFunds(1300);
    const tx1 = await banking.accountPosition(alice.address);
    // console.log("Account Id is: ",account.accountId);
    // console.log("User Balance is: ", account.userBalance);
    // console.log("User Address is: ", account.userAddress);
    expect(tx1.accountId).to.equal(100002);
    expect(tx1.userBalance).to.equal(1300);
    expect(tx1.userAddress).to.equal(alice.address);

    await banking.connect(charlieSigner).transferP2P(100002, 20);
    const tx2 = await banking.accountPosition(charlie);
    expect(tx2.userBalance).to.equal(280);
    expect(tx2.userAddress).to.equal(charlie);
  });
  it("Should not allow user transfer more than balance", async function(){
    let error;
    try {
      await banking.connect(charlieSigner).transferP2P(100002, 2000);
    } catch (_error) {
      error = _error;
    }
    assert(error, "Insufficient funds");  
  })
  it("Should allow users withdraw their funds", async function(){
    const tx4 = await banking.connect(alice).accountPosition(alice.address);
    const bal_before = tx4.userBalance
    await banking.connect(alice).withdrawFunds(320);
    const tx5 = await banking.connect(alice).accountPosition(alice.address);
    const bal_after = tx5.userBalance;
    expect(bal_before - bal_after).to.equal(320)
  })
})