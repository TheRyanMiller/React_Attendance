var Web3 = require('web3');
const contract = require('truffle-contract');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
const AttendanceRewarderArtificats = require('./build/contracts/AttendanceRewarder.json');
const attendanceRewarder = contract(AttendanceRewarderArtificats);
attendanceRewarder.setProvider(web3.currentProvider);


/*---------------------------------------------------------------------
SCRIPTS BELOW
---------------------------------------------------------------------*/



//top 5 metamask accounts
var mmAccts = [
"0xe479E30CA850026ba47a1351213342AC5f273e2c",
"0x1E17869254070f19D00803C383283e732914368C",
"0xAD10a8da769672ec825238b2212eC547c6A42E9d",
"0xc7b3010a75B4D289D43f27e094d5ffb44A551bee",
"0x97A8157b65906e12Cc30FD90aC61a859b898ad01",
"0xcF81613b42dEF40A193154AB357631cef99E4bfF",
"0x74861772b708CdC22120F42fa82318BC695a037B"];

//quick get balance
function gb(address){
  web3.fromWei(web3.eth.getBalance(address), "ether");
}

web3.eth.sendTransaction(
  {from:web3.eth.accounts[0],
  to: mmAccts[0],
  value: 99400000000000000000, 
      }, function(err, transactionHash) {
if (!err) console.log(transactionHash + " success"); 
else console.log(err)
});

web3.eth.sendTransaction(
  {from:web3.eth.accounts[1],
  to: mmAccts[1],
  value: 99999999990000000000, 
      }, function(err, transactionHash) {
if (!err) console.log(transactionHash + " success"); 
else console.log(err)
});

web3.eth.sendTransaction(
  {from:web3.eth.accounts[2],
  to: mmAccts[2],
  value: 99999999990000000000, 
      }, function(err, transactionHash) {
if (!err) console.log(transactionHash + " success"); 
else console.log(err)
});


web3.eth.sendTransaction(
  {from:web3.eth.accounts[3],
  to: mmAccts[3],
  value: 99999999990000000000, 
      }, function(err, transactionHash) {
if (!err) console.log(transactionHash + " success"); 
else console.log(err)
});

web3.eth.sendTransaction(
  {from:web3.eth.accounts[4],
  to: mmAccts[4],
  value: 99999999990000000000, 
      }, function(err, transactionHash) {
if (!err) console.log(transactionHash + " success"); 
else console.log(err)
});

web3.eth.sendTransaction(
  {from:web3.eth.accounts[5],
  to: mmAccts[5],
  value: 99999999990000000000, 
      }, function(err, transactionHash) {
if (!err) console.log(transactionHash + " success"); 
else console.log(err)
});

web3.eth.sendTransaction(
  {from:web3.eth.accounts[6],
  to: mmAccts[6],
  value: 99999999990000000000, 
      }, function(err, transactionHash) {
if (!err) console.log(transactionHash + " success"); 
else console.log(err)
});