const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("TokenModule", (m) => {
  const LastInvestor = m.contract("LastInvestor");

  return { LastInvestor };
});

module.exports = TokenModule;