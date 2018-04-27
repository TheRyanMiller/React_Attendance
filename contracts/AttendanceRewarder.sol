pragma solidity ^0.4.19;

contract AttendanceRewarder {

  struct Attendee {
    string name;
    uint amountDonated;
    uint lastAttendedEvent;
    uint totalEventsAttended;
    mapping(address => Validator) validators;
    address[] validatorList;
    uint listPointer;
    uint[] eventsWon;
    uint unclaimedValue;
  }

  struct Validator {
    bool hasAlreadyValidated;
    uint listPointer;
    uint eventId;
  }

  event Contributed(uint indexed eventId, address indexed contributor, string name, uint amtContributed); 
  event Winner(uint indexed eventId, address indexed eventEnder, address indexed winner, uint value);
  event Validated(uint indexed eventId, address indexed validator, address indexed validatee);
  event NameUpdated(address indexed updatedAddress, string newName);
  event WinningsCollected(address indexed winner, uint indexed value);


  uint eventId; //start at 0, iterate up for each event
  mapping(address => Attendee) public attendees;
  address[] public attendeeList; //map addresses to their winnings balance
  address[] public eventWinners; //track winners of each event
  address[] public validAttendees; //list of validated attendees
  uint[] public eventEndValues;
  uint public totalUnclaimedValue; //total unclaimed value in the contract (available only to winners)
  uint public currentEventValue; //value of current meetup
  address private owner;
  uint private MIN_VALIDATIONS = 1;

  modifier onlyOwner {
    require(msg.sender == owner);
    _; // The "_;" is replaced by fxn body.
  }

  function AttendanceRewarder() public {
    totalUnclaimedValue = 0;
    currentEventValue = 0;
    owner = msg.sender;
  }

  function isAttendee(address attendeeAddress) public constant returns(bool isAttendee) {
    if(attendeeList.length == 0) return false;
    uint pointer = attendees[attendeeAddress].listPointer;
    if(pointer!= 0 && pointer >= attendeeList.length) return false;
    return (attendees[attendeeAddress].lastAttendedEvent == eventId
        && attendeeList[attendees[attendeeAddress].listPointer] == attendeeAddress
      );
  }

  function hasPastAttendeeRecord(address attendeeAddress) public constant returns(bool isAttendee) {
    return (attendees[attendeeAddress].lastAttendedEvent != eventId
              && attendees[attendeeAddress].lastAttendedEvent >= 0);
  }


  function hasAlreadyValidated(address attendeeAddress, address validatorAddress) public constant returns(bool hasAlreadyValidated) {
    if (attendees[attendeeAddress].validatorList.length == 0) 
      return false;
    if (isAttendee(attendeeAddress) == false) 
      return false;
    return attendees[attendeeAddress].validators[validatorAddress].hasAlreadyValidated;
  }

  function getAttendeeCount() public constant returns(uint attendeeCount) {
    return attendeeList.length;
  }

  function contribute(string name) public payable returns(bool success) {
    /*
      Adding new attendee:
        1. Make sure attendee doesn't already exist
        2. Add AttendeeStruct data to mapping
        3. Push address onto array
    */
    address attendeeAddress = msg.sender;
    uint amountDonated = msg.value;
    require (isAttendee(attendeeAddress) == false);
    require (amountDonated>0);
    if (hasPastAttendeeRecord(attendeeAddress)) {
      updateAttendee(attendeeAddress, name, amountDonated);
      attendees[attendeeAddress].listPointer = attendeeList.push(attendeeAddress) - 1;
      attendees[attendeeAddress].lastAttendedEvent = eventId;
      attendees[attendeeAddress].totalEventsAttended++;
      Contributed(eventId, attendeeAddress, name, msg.value); 
      return true;
    }
    else {
      attendees[attendeeAddress].name = name;
      attendees[attendeeAddress].lastAttendedEvent = eventId;
      attendees[attendeeAddress].amountDonated = amountDonated;
      attendees[attendeeAddress].unclaimedValue = 0;
      attendees[attendeeAddress].listPointer = attendeeList.push(attendeeAddress) - 1;
      attendees[attendeeAddress].totalEventsAttended = 1;
      currentEventValue += amountDonated;
      totalUnclaimedValue += amountDonated;
      Contributed(eventId, attendeeAddress, name, msg.value);
      return true;
    }
  }

  function updateAttendee(address attendeeAddress, string name, uint amountDonated) private returns(bool success) {
    attendees[attendeeAddress].name = name;
    attendees[attendeeAddress].lastAttendedEvent = eventId;
    attendees[attendeeAddress].amountDonated = amountDonated;
    currentEventValue += amountDonated;
    totalUnclaimedValue += amountDonated;
    return true;
  }

  function updateAttendeeName(address attendeeAddress, string name) public returns(bool success) {
    require (isAttendee(attendeeAddress));
    attendees[attendeeAddress].name = name;
    NameUpdated(attendeeAddress, name);
    return true;
  }

  function validateAttendee(address attendeeAddress) public returns(bool success) {
    require (attendeeAddress!=msg.sender); //prevent self-confimration
    require (isAttendee(attendeeAddress)); //Make sure that validatee is an attendee
    require (isAttendee(msg.sender)); //Make sure that validator is an attendee too
    require (hasAlreadyValidated(attendeeAddress, msg.sender) == false); // check if already validated this address before
    attendees[attendeeAddress].validators[msg.sender].hasAlreadyValidated = true;
    attendees[attendeeAddress].validators[msg.sender].listPointer = attendees[attendeeAddress].validatorList.push(msg.sender) - 1;
    if(attendees[attendeeAddress].validatorList.length == MIN_VALIDATIONS) {
      validAttendees.push(attendeeAddress);
    }
    Validated(eventId, msg.sender, attendeeAddress);
    return true;
  }

  function deleteAttendee(address attendeeAddress) public returns(bool success) {
    require (isAttendee(attendeeAddress));
    uint rowToDelete = attendees[attendeeAddress].listPointer; // array index of specified address
    address keyToMove = attendeeList[attendeeList.length-1]; // address at last position
    attendeeList[rowToDelete] = keyToMove; //set address of deleted index, to address of last index
    attendees[keyToMove].listPointer = rowToDelete; // update pointer of last
    attendeeList.length--;
    return true;
  }

  function payout() public {
    require (attendeeList.length>0);
    require (isAttendee(msg.sender));
    require (validAttendees.length > 0);
    address winner = calculateWinner(msg.sender);
    attendees[winner].unclaimedValue += currentEventValue;
    attendees[winner].eventsWon.push(eventId);
    eventEndValues.push(currentEventValue);
    eventWinners.push(winner);
    Winner(eventId, msg.sender, winner, currentEventValue);
    currentEventValue = 0;
    resetAttendance();
  }

  function resetAttendance() private returns(bool success) {
    attendeeList.length = 0;
    validAttendees.length = 0;
    currentEventValue = 0;
    eventId++;
    return true;
  }

  function collectWinnings() public {
    require (attendees[msg.sender].unclaimedValue > 0);
    uint value = attendees[msg.sender].unclaimedValue;
    attendees[msg.sender].unclaimedValue = 0;
    msg.sender.transfer(value);
    WinningsCollected(msg.sender, value);
  }

  function calculateWinner(address eventEnder) private view returns(address) {
    uint random  = uint(keccak256(block.timestamp)) % validAttendees.length;
    address winner = attendeeList[random];
    return winner;
  }

  function getEventId() public view returns(uint) {
    return eventId;
  }

  function getAttendeeList() public view returns(address[]) {
    return attendeeList;
  }

  function getCurrentEventValue() public view returns(uint) {
    return currentEventValue;
  }


  function getAttendeeData() public view returns(bytes32[],uint[],uint[],uint[],uint[],address[]) {
    //This function returns values needed to construct attendee objects
    //prepare some variables in memory
    uint listSize = attendeeList.length;
    bytes32[] memory names = new bytes32[](listSize);
    uint[] memory amountDonated = new uint[](listSize);
    uint[] memory lastAttendedEvent = new uint[](listSize);
    uint[] memory totalEventsAttended = new uint[](listSize);
    uint[] memory numValidators = new uint[](listSize);
    address[] memory attendeeAddresses = new address[](listSize);
    for (uint i = 0; i < attendeeList.length; i++) {
      Attendee storage attendee = attendees[attendeeList[i]];
      names[i] = stringToBytes32(attendee.name);
      amountDonated[i] = attendee.amountDonated;
      lastAttendedEvent[i] = attendee.lastAttendedEvent;
      totalEventsAttended[i] = attendee.totalEventsAttended;
      numValidators[i] = attendee.validatorList.length;
      attendeeAddresses[i] = attendeeList[i];
    }
    return(names, amountDonated, lastAttendedEvent, totalEventsAttended, numValidators,attendeeAddresses);
  }

  function getAllWinners() public view returns(address[],uint[]) {
    //This function returns values needed to construct attendee objects
    //prepare some variables in memory
    uint listSize = eventWinners.length;
    uint[] memory winnings = new uint[](listSize);
    address[] memory winnerAddresses = new address[](listSize);
    for (uint i = 0; i < listSize; i++) {
      Attendee storage attendee = attendees[eventWinners[i]];
      winnings[i] = attendee.unclaimedValue;
      winnerAddresses[i] = eventWinners[i];
    }
    return(winnerAddresses, winnings);
  }

  function checkUnclaimedWinnings() public view returns(uint) {
    return attendees[msg.sender].unclaimedValue;
  }
  
  function stringToBytes32(string memory source) public returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
        return 0x0;
    }

    assembly {
        result := mload(add(source, 32))
    }
  }
}