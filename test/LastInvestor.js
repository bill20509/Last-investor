// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { ethers } = require("hardhat");
// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("Last investor contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployTokenFixture() {
    // Get the Signers here.
    const [owner, addr1, addr2] = await ethers.getSigners();

    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.
    const lastInvestorContract = await ethers.deployContract("LastInvestor");

    await lastInvestorContract.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return { lastInvestorContract, owner, addr1, addr2 };
  }

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define each
    // of your tests. It receives the test name, and a callback function.
    //
    // If the callback function is async, Mocha will `await` it.
    
    it("Should assign the total supply of tokens to the owner", async function () {
      const { lastInvestorContract} = await loadFixture(deployTokenFixture);
      // const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await lastInvestorContract.getTotalFunds()).to.equal(0);
    });
    it("Remain time should under 1 day", async function(){
      const { lastInvestorContract } = await loadFixture(deployTokenFixture);
      const remainTime = await lastInvestorContract.getTimeRemaining();
      console.log(remainTime);
      expect(remainTime).to.be.lessThanOrEqual(60*60*24);
    });
  });

  describe("Transactions", function () {
    it("Shoud fail if invest less than min investment", async function () {
      const { lastInvestorContract, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // invest 
      await expect(lastInvestorContract.invest({value: ethers.parseEther("0.009")})).to.be.revertedWith("Investment must be greater than min_investment");
    });
    it("Should invest succefully ", async function () {
      const { lastInvestorContract } = await loadFixture(
        deployTokenFixture
      );
      // Get the min investment and should be 0.1 ether
      const minInvestment = await lastInvestorContract.getMinInvestment();
      console.log(minInvestment);
      expect(minInvestment).to.equal(ethers.parseEther("0.01"));
      // invest 
      await lastInvestorContract.invest({value: minInvestment});
      const minInvestmentAfter = await lastInvestorContract.getMinInvestment();
      expect(minInvestmentAfter).to.equal(ethers.parseEther("0.02"));
      expect(await lastInvestorContract.getTotalFunds()).to.equal(ethers.parseEther("0.009"));
    });

    it("Should emit invest events", async function () {
      const { lastInvestorContract } = await loadFixture(
        deployTokenFixture
      );

      expect(lastInvestorContract.invest({value: ethers.parseEther("0.01")})).to.emit(lastInvestorContract, "Invest").withArgs(ethers.parseEther("0.01"));
    });
  });
});