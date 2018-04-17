import React, { Component } from 'react';
import AttendanceRewarder from '../build/contracts/AttendanceRewarder.json';
import getWeb3 from './utils/getWeb3';
import Contribute from './components/Attendee/Contribute.js';
import AttendeeTable from './components/Attendee/AttendeeTable.js';
import Modal from 'react-modal';
import MainFrame from './components/MainFrame.js';
import '../node_modules/react-bootstrap-table/css/react-bootstrap-table.css';
import { Button } from 'react-bootstrap';
import './components/Attendee/styles/Attendee.css';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      contract: null,
      name: "",
      storageValue: 0,
      eventId: 99,
      currentEventValue: 0,
      attendeeList: [],
      ether: 1000000000000000000,
      hasContributed: false,
      isLoggedIn: false,
      loggedInAddress: "",
      web3: null,
      attendees: [],
      amountToContribute: 0,
      modalIsOpen: false,
      modalMsg: "",
      contractInstance: null,
      txnHashes: [],
      showSpinner: false,
      winners: [],
      loggedInUserWinnings: 0
    }
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }
 
  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }
 
  closeModal() {
    this.setState({modalIsOpen: false});
  }

  componentDidMount() {
    Modal.setAppElement('body');
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      
      //Set up event event logging
      const contract = require('truffle-contract');
      const attendanceRewarder = contract(AttendanceRewarder);
      attendanceRewarder.setProvider(this.state.web3.currentProvider);
      attendanceRewarder.deployed().then((instance) => {
        let contributedEvent = instance.Contributed({}, { fromBlock: 'latest', toBlock: 'latest' });
        let winnerEvent = instance.Winner({}, { fromBlock: 'latest', toBlock: 'latest' });
        let validatedEvent = instance.Validated({}, { fromBlock: 'latest', toBlock: 'latest' });
        let nameUpdatedEvent = instance.NameUpdated({}, { fromBlock: 'latest', toBlock: 'latest' });
        let winningsCollected = instance.WinningsCollected({}, { fromBlock: 'latest', toBlock: 'latest' });
        contributedEvent.watch( (err, response) => {
          console.log("contrib: ", response);
          this.setState({isLoading: false});
          if (!this.addTxnId(response.transactionHash)){
            let newAttendee = {};
            newAttendee.name = response.args.name;
            let amtContributed = response.args.amtContributed.toNumber();
            newAttendee.amtDonated = amtContributed;
            newAttendee.totalEventsAttended = 0;
            newAttendee.numValidators = 0;
            newAttendee.address = response.args.contributor;
            let newAttendees = [...this.state.attendees, newAttendee];
            let newAttendeeList = [...this.state.attendeeList, response.contributor];
            this.setState({
              attendees: newAttendees,
              attendeeList: newAttendeeList,
              currentEventValue: this.state.currentEventValue+amtContributed,
              hasContributed: true
            });
          }
          
        });
        winnerEvent.watch( (err, response) => {
          this.setState({isLoading: false});
          if (!this.addTxnId(response.transactionHash)){
            this.setState({
              attendees : [], 
              eventId : this.state.eventId+1, attendeeList: [],
              hasContributed: false,
              currentEventValue: 0
            });
          }
          this.lookupUserWinnings();
        });
        validatedEvent.watch( (err, response) => {
          this.setState({isLoading: false});
          if (!this.addTxnId(response.transactionHash)){
            let attendees = [...this.state.attendees];
            for(let i=0;i<attendees.length;i++){
              if (attendees[i].address === response.args.validatee) {
                  attendees[i].numValidators++;
                  return true; // stop searching
              }
            };
            this.setState({attendees: attendees});
          }
          
        });
        nameUpdatedEvent.watch( (err, response) => {
          this.setState({isLoading: false});
          console.log(response,err);    
        });
        winningsCollected.watch( (err, response) => {
          this.setState({
            isLoading: false,
            loggedInUserWinnings: 0
          });
          console.log(response,err);    
        });
      })
      return this.instantiateContract();
    })
    .catch(() => {
      console.log('Error finding web3.');
    })

    

    //Poll for any metamask account switches
    setInterval(() => {
      let account = this.state.loggedInAddress;
      //Check if account has switched
      if(this.state.web3.eth.accounts[0] !== account) {
        this.setState({loggedInAddress: this.state.web3.eth.accounts[0]});
        let hasContributed = this.state.attendeeList.includes(this.state.loggedInAddress);
        this.setState({hasContributed: hasContributed});
        this.lookupUserWinnings();
      }
      //Check if logged in at all
      if (this.state.web3.eth.accounts.length === 0){
        this.setState({isLoggedIn: false, loggedInAddress: ""});
      }
      else{
        this.setState({isLoggedIn: true, loggedInAddress: this.state.web3.eth.accounts[0]});
      }
    }, 500);
  }

  addTxnId(txId){
    let hasTxId = this.state.txnHashes.includes(txId);
    if(hasTxId === false){
      let txIds = [...this.state.txnHashes];
      txIds.push(txId);
      this.setState({txnHashes: txIds});
    }
    return hasTxId;
  }

  instantiateContract() {
    const contract = require('truffle-contract');
    const attendanceRewarder = contract(AttendanceRewarder);
    attendanceRewarder.setProvider(this.state.web3.currentProvider);
    this.setState({contract: attendanceRewarder});

    // Declaring this for later so we can chain functions on AttendanceData.
    let contractInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((err, accounts) => {
      if (err !== null){
        this.setState({isLoggedIn:false});
        console.error("An error occurred: "+err);
      }
      else if (accounts.length === 0){
        this.setState({isLoggedIn:false});
        console.log("User is not logged in to MetaMask");
      }
      else{
        console.log("User is logged in to MetaMask");
        this.setState({isLoggedIn: true});
        attendanceRewarder.deployed().then((instance) => {
          this.setState({contractInstace: instance});
          contractInstance = instance;
          return contractInstance.getEventId()
        }).then((result) => {
          // Get the value from the contract to prove it worked.
          this.setState({ eventId: result.c[0] })
          return contractInstance.getAttendeeList.call()
        }).then((result) => {
          // Update state with the result.
          this.setState({ attendeeList: result })
          return contractInstance.getCurrentEventValue()
        }).then((result) => {
          // Get the value from the contract to prove it worked.
          this.setState({ currentEventValue: result.toNumber() });
          let hasContributed = this.state.attendeeList.includes(this.state.loggedInAddress);
          this.setState({hasContributed: hasContributed});
          this.lookupUserWinnings();
        }).catch((err) => {
          console.log("Failed with error: " + err);
        });
      }
    })
    this.getAttendeeData();
  }

  contribute() {
    let attendanceRewarder = this.state.contract;
    let contractInstance;
    this.state.web3.eth.getAccounts((error, accounts) => {
      attendanceRewarder.deployed().then((instance) => {
        contractInstance = instance;
        
        // Stores a given value, 5 by default.
        this.setState({isLoading: true});
        return contractInstance.contribute(this.state.name, {value: this.state.web3.toWei(this.state.amountToContribute, 
          'ether'), gasPrice: 2000000000, gas: 300000, from: accounts[0]});
      }).then((result) => {
        console.log("Was successful: "+result);
        return contractInstance.getCurrentEventValue()
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        this.setState({ currentEventValue: result.toNumber() });
        let hasContributed = true;
        this.setState({hasContributed: hasContributed});
      }).catch((err) => {
        this.setState({isLoading: false});
        console.log("Failed with error: " + err);
        let msg = (
        <div>There was an error with your attempt to contribute. Here are some reasons why it might have failed. 
        <ul>
          <li>The address you're using has already donated to this event yet.</li>
          <li>you are attempting to contribute a value of 0</li>
          <li>The address you're using does not have enough funds to pay for gas.</li>
        </ul>
        <Button bsStyle="warning" onClick={this.closeModal}>Dismiss</Button>
      </div>
        )
        this.setState({modalMsg: msg})
        this.setState({modalIsOpen:true});
      });
    });
  }

  setName=(e)=>{
    this.setState({name: e.target.value});
  }

  setAmount=(e)=>{
    this.setState({amountToContribute: e.target.value});
  }

  getAttendeeData(){
    const attendanceRewarder = this.state.contract;
    let contractInstance;

    this.state.web3.eth.getAccounts((error, accounts) => {
      attendanceRewarder.deployed().then((instance) => {
        contractInstance = instance;
        return contractInstance.getAttendeeData({from: accounts[0]})
      }).then((result) => {
        this.processAttendeeData(result);
      }).catch((err) => {
        console.log("Failed with error: " + err);
      });
    })
  }

  lookupUserWinnings(){
    const attendanceRewarder = this.state.contract;
    let contractInstance;

    this.state.web3.eth.getAccounts((error, accounts) => {
      attendanceRewarder.deployed().then((instance) => {
        contractInstance = instance;
        return contractInstance.checkUnclaimedWinnings({from: accounts[0]})
      }).then((result) => {
        this.setState({loggedInUserWinnings: (result.toNumber() / this.state.ether)})
      }).catch((err) => {
        console.log("Failed with error: " + err);
      });
    })
  }

  clickedValidate = (cell, row, rowIndex) => {
    let validatee = row.address;
    let contractInstance;
    const attendanceRewarder = this.state.contract;

    this.state.web3.eth.getAccounts((error, accounts) => {
      attendanceRewarder.deployed().then((instance) => {
        this.setState({isLoading: true});
        contractInstance = instance;
        return contractInstance.validateAttendee(validatee, {gasPrice: 2000000000, gas: 300000, from: accounts[0]})
      }).then((result) => {
        console.log("Entered Validated Results");
      }).catch((err) => {
        this.setState({isLoading: false});
        console.log("Failed with error: " + err);
        let msg = (
        <div>There was an error with your attempt to validate an attendee. Here are some reasons why it might have failed. 
        <br />The address you're using to validate:
        <ul>
          <li>has not donated to this event yet.</li>
          <li>has already validated this user.</li>
          <li>is the same as the address you're attempting to validate.</li>
          <li>does not have enough funds to pay for gas.</li>
        </ul>
        <Button bsStyle="warning" onClick={this.closeModal}>Dismiss</Button>
      </div>
        )
        this.setState({modalMsg: msg})
        this.setState({modalIsOpen:true});
      });
    })
  }

  claimWinnings(){
    let contractInstance;
    const attendanceRewarder = this.state.contract;

    this.state.web3.eth.getAccounts((error, accounts) => {
      attendanceRewarder.deployed().then((instance) => {
        this.setState({isLoading: true});
        contractInstance = instance;
        return contractInstance.collectWinnings({gasPrice: 2000000000, gas: 300000, from: accounts[0]})
      }).then((result) => {
        console.log("Collecting winnings...");
      }).catch((err) => {
        this.setState({isLoading: false});
        console.log("Failed with error: " + err);
        let msg = (
        <div>There was an error with your attempt to claim your winnings. Here are some reasons why it might have failed. 
        <br />The address you're using to claim:
        <ul>
          <li>has not unclaimed winnings at this time.</li>
          <li>does not have enough funds to pay for gas.</li>
        </ul>
        <Button bsStyle="warning" onClick={this.closeModal}>Dismiss</Button>
      </div>
        )
        this.setState({modalMsg: msg})
        this.setState({modalIsOpen:true});
      });
    })
  }
  payout(){
    const attendanceRewarder = this.state.contract;
    let contractInstance;
    this.state.web3.eth.getAccounts((error, accounts) => {
      attendanceRewarder.deployed().then((instance) => {
        contractInstance = instance;
        this.setState({isLoading: true});
        return contractInstance.payout({gasPrice: 2000000000, gas: 300000, from: accounts[0]})
      }).then((result) => {
        console.log("Winner has been selected.");
      }).catch((err) => {
        this.setState({isLoading: false});
        console.log("Failed with error: " + err);
        let msg = (
        <div>There was an error with your attempt to end an event and payout. Here are some reasons why it might have failed: 
        <br />
        <ul>
          <li>The address you're using to end this event has not donated to the event.</li>
          <li>There are no validated contributors to the event yet.</li>
          <li>Your address did not send enough gas to pay for the transaction.</li>
        </ul>
        <Button bsStyle="warning" onClick={this.closeModal}>Dismiss</Button>
      </div>
        )
        this.setState({modalMsg: msg})
        this.setState({modalIsOpen:true});
      });
    })
  }


  processAttendeeData(data){
    let attendees = [];
    let x = 0;
    for(var i =0;i<data.length;i++){
      if(i===0){
        
        for(x=0;x<data[i].length;x++){
          attendees[x] = {};
          attendees[x].name = this.state.web3.toAscii(data[i][x]).replace(/[^\u000A\u0020-\u007E]/g, ' ').trim();
        }
      }
      if(i===1){
        for(x=0;x<data[i].length;x++){
          attendees[x].amtDonated = data[i][x].toNumber();
        }
      }
      if(i===2){
        for(x=0;x<data[i].length;x++){
          attendees[x].lastAttendedEvent = data[i][x].toNumber();
        }
      }
      if(i===3){
        for(x=0;x<data[i].length;x++){
          attendees[x].totalEventsAttended = data[i][x].toNumber();
        }
      }
      if(i===4){
        for(x=0;x<data[i].length;x++){
          attendees[x].numValidators = data[i][x].toNumber();
        }
      }
      if(i===5){
        for(x=0;x<data[i].length;x++){
          attendees[x].address = data[i][x];
        }
      }
    }
    this.setState({attendees:attendees});
  }

  render() {
    let eventDetails = null;
    let unclaimedWinnings = null;
    if(this.state.loggedInUserWinnings > 0){
      unclaimedWinnings = (
        <div>
          <Button onClick={this.claimWinnings.bind(this) } bsStyle='warning'>Claim {this.state.loggedInUserWinnings} Ether!</Button>
          <br />
          <br />
        </div>
      )
    }
    else{
      unclaimedWinnings = (
        <div>
          <p>No winnings to claim for {this.state.loggedInAddress}.</p>
        </div>
      )
    }
    if(this.state.isLoggedIn){
      eventDetails = (
        <div className='Attendee'>
          {unclaimedWinnings}
          <h2>Current Event Details</h2>
          <p>Event ID: { this.state.eventId }</p>
          <p>Total Event Value: { this.state.currentEventValue / this.state.ether } ETH </p>
          <br />
          <Contribute hasContributed={this.state.hasContributed} 
            setName={this.setName} 
            setAmount={this.setAmount}
            amountToContribute={this.state.amountToContribute} 
            clicked={ this.contribute.bind(this) } />
          
        </div>
      )
    }
    else{
      eventDetails = (
        <div>
          <p color='red'><mark>Please login with MetaMask and refresh to begin.</mark></p>
        </div>
      )
    }
    let attendeeInteract = null;
    if(this.state.isLoggedIn && this.state.attendees.length>0){
      attendeeInteract = (
        <div>
          <AttendeeTable clickedValidate={ this.clickedValidate } 
          data={this.state.attendees} 
          hasContributed={this.state.hasContributed} />
          <Button onClick={this.payout.bind(this) } bsStyle='danger'>End event and payout!</Button>
        </div>
      )
    }
    else{
      if(this.state.isLoggedIn){
        attendeeInteract = (
          <div>
            <p>No attendees have contributed to this event yet.</p>
          </div>
        )
      }
    }

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Attendance Incentivizer</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Attendance Incentivizer</h1>
              <MainFrame isVisible={this.state.isLoggedIn} isLoading={this.state.isLoading}>
                {eventDetails}
                <br />
                {attendeeInteract} <br />
              </MainFrame>
            </div>
          </div>
          <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          shouldCloseOnOverlayClick={false}
          contentLabel="Example Modal"
        >
 
          <h2 ref={subtitle => this.subtitle = subtitle}>Error</h2>
          {this.state.modalMsg}
        </Modal>
        </main>
      </div>
    );
  }
}

export default App

/*
instance.allEvents({fromBlock:'latest'}, (error,event)=>{
  if (error) {
    console.log("Event error:", error);
    return;
  }
  let newTxns = [...this.state.txnHashes, event.transactionHash];
  //if(this.state.txnHashes.length !== 0) {
    console.log("Is unique tx? ", !this.state.txnHashes.includes(event.transactionHash));
    console.log("Event captured:", event);
  //}
  this.setState({txnHashes: newTxns});
  console.log(this.state.txnHashes)
  /*
  if(this.state.txnHashes.length>=1 && !this.state.txnHashes.includes(event.transactionHash)){
    console.log("Event captured:", event);
    this.setState({txnHashes: newTxns});
  }
  else if(this.state.txnHashes.length===0){
    this.setState({txnHashes: newTxns});
  }
});
instance.allEvents({fromBlock:'latest'}, (error,event)=>{
            if (error) {
              console.log("Event error:", error);
              return;
            }
            console.log("Event captured:", event);
          });
          
*/