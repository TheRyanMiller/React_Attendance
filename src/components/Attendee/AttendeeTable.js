import React, { Component } from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
//import '../css/Table.css';
import '../../../node_modules/react-bootstrap-table/css/react-bootstrap-table.css';
import { Button } from 'react-bootstrap';

 
class AttendeeTable extends Component {

  buttonFormatter(cell, row, enumObject, rowIndex){
    return (
      <Button bsStyle="info" type="submit"
        onClick={ () => this.props.clickedValidate(cell, row, rowIndex) } >
        Validate
      </Button>);
  }

  render() {
    return (
      <div>
        <BootstrapTable data={this.props.data}>
          <TableHeaderColumn dataField="button" dataFormat={ this.buttonFormatter.bind(this) }>
            Validate
          </TableHeaderColumn>
          <TableHeaderColumn isKey dataField='address'>
            Address
          </TableHeaderColumn>
          <TableHeaderColumn dataField='name'>
            Name
          </TableHeaderColumn>
          <TableHeaderColumn dataField='numValidators'>
            Validator Count
          </TableHeaderColumn>
          
        </BootstrapTable>
      </div>
    );
  }
}
 
export default AttendeeTable;