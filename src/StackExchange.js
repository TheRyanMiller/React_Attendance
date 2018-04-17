import React, { Component } from 'react';
import AttendanceData from '../build/contracts/AttendanceData.json';
import getWeb3 from './utils/getWeb3';


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      contract: null,
      name: "",
      storageValue: 0,
      eventId: 0,
      currentEventValue: 0,
      hasContributed: false,
      isLoggedIn: false,
      loggedInAddress: "",
      web3: null
    }
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }


  componentDidMount() {
    getWeb3
    .then(results => {
        this.setState({
            web3: results.web3
        })
        const contract = require('truffle-contract');
        const attendanceData = contract(AttendanceData);
        attendanceData.setProvider(this.state.web3.currentProvider);
        this.setState({contract: attendanceData});
        attendanceData.Contributed({}, {fromBlock: 1, toBlock: 'latest'});
        contributedEvent.watch(function(error, result) {
            if(!error){
                console.log("Event captured:", result);
            }
            else{
                console.log("Error capturing event:", error);
            }
        });
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  contribute() {
    const attendanceData = this.state.contract;

    // Declaring this for later so we can chain functions on AttendanceData.
    var attendanceDataInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      attendanceData.deployed().then((instance) => {
        attendanceDataInstance = instance;
        // Stores a given value, 5 by default.
        return attendanceDataInstance.contribute({value: this.state.web3.toWei(this.state.amountToContribute, 'ether'), gasPrice: 2000000000, gas: 300000, from: accounts[0]})
      }).then((result) => {
        console.log("Was successful: "+result);
      }).catch((err) => {
        console.log("Failed with error: " + err);
      });
    })
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.contribute()}>CONTRIBUTE!</button>
      </div>
    );
  }
}

export default App;