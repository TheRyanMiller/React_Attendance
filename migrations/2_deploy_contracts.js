
//var SimpleStorage = artifacts.require("../contracts/SimpleStorage.sol");
var AttendanceRewarder = artifacts.require("../contracts/AttendanceRewarder.sol");

module.exports = function(deployer) {
  //deployer.deploy(SimpleStorage);
  deployer.deploy(AttendanceRewarder);
};