var Web3 = require('web3');
const contract = require('truffle-contract');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
const AttendanceDataArtificats = require('./build/contracts/AttendanceData.json');
const attendanceData = contract(AttendanceDataArtificats);
attendanceData.setProvider(web3.currentProvider);


/*---------------------------------------------------------------------
SCRIPTS BELOW
---------------------------------------------------------------------*/


var acct ="0x2c71a9afbfcaa8a8c95809da40645cf09d2bdd8b";
var addr = "0x3037871e6495f837696c98948b3653470d2f295d";
var addr2 = "0x2f20c69b2e303c9dcd79249e52afcdc7c1dd059b";
var contractAddress = "0xc283151f28f1f8459c1b8065bd47d083e69e6319";


attendanceData.deployed().then(function(contractInstance) {
    contractInstance.getAttendeeCount({from:acct, gas:2000000}).then(function(v) {
      //console.log(v.toNumber())
    });
})
web3.eth.getAccounts((error, accounts) => {
  attendanceData.deployed().then(function(contractInstance) {
    contractInstance.isAttendee(accounts[0],{from:acct, gas:2000000}).then(function(v) {
      console.log(v)
    });
  })
})



/*
    var currentEventValue;
    attendanceData.deployed().then((instance) => {
      attendanceDataInstance = instance;
      return attendanceDataInstance.newAttendee("Belinda", {value: web3.toWei('11', 'ether'),gas: 2222222,from: addr2})
    }).then((result) => {
      console.log("Was successful: "+result);
      return attendanceDataInstance.getCurrentEventValue()
    }).then((result) => {
      // Get the value from the contract to prove it worked.
      currentEventValue= result.toNumber();
    })

     
attendanceData.deployed().then(function(contractInstance) {
    contractInstance.getAttendeeData({from:acct, gas:2000000}).then(function(v) {
      console.log(v);
      var names = v[0];
      var amountDonated = v[1];
      var lastAttendedEvent = v[2];
      var totalEventsAttended = v[3];
      var numValidators = v[4];
      console.log(""+web3.toAscii(names[0])+",  validated by "+numValidators[0].toNumber()+", has donated "+amountDonated[0].toNumber()+", and have atteneded this many events: "+totalEventsAttended[0].toNumber());
      console.log(""+web3.toAscii(names[1])+",  validated by "+numValidators[1]+", has donated "+amountDonated[1].toNumber()+", and have atteneded this many events: "+totalEventsAttended[1].toNumber());
      console.log(""+web3.toAscii(names[2])+",  validated by "+numValidators[2]+", has donated "+amountDonated[2].toNumber()+", and have atteneded this many events: "+totalEventsAttended[2].toNumber());
      console.log(""+web3.toAscii(names[3])+",  validated by "+numValidators[3]+", has donated "+amountDonated[3].toNumber()+", and have atteneded this many events: "+totalEventsAttended[3].toNumber());
      console.log(""+web3.toAscii(names[4])+",  validated by "+numValidators[4]+", has donated "+amountDonated[4].toNumber()+", and have atteneded this many events: "+totalEventsAttended[4].toNumber());
      console.log(""+web3.toAscii(names[5])+",  validated by "+numValidators[5]+", has donated "+amountDonated[5].toNumber()+", and have atteneded this many events: "+totalEventsAttended[5].toNumber());
    
    });
  })

*/
//DEPOSIT
/*
hodlEthereum.deployed().then(function(contractInstance) {
  contractInstance.deposit({value:web3.toWei(20, "ether"), from:acct, gas:2000000}).then(function(v) {
    console.log(v);
  });
})
*/

/*
hodlEthereum.deployed().then(function(contractInstance){
  console.log(contractInstance);
})
*/
//console.log(hodlEthereum)
//console.log(web3.eth.getBalance(contractAddress).toString()); //Check Balance of Contract

//CheckBalance
/*
hodlEthereum.deployed().then(function(contractInstance) {
  contractInstance.getBalance(acct,{from:acct, gas:2000000}).then(function(v) {
    console.log(v.toString())
  });
})
*/

//Release



//npm run dev
