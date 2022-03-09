import './App.css';
import React, { useState } from 'react';
import CSVFileValidator from 'csv-file-validator';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';

function App() {

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  const requiredError = (headerName, rowNumber, columnNumber) => {
    return `<div class="red">${headerName} is required in the <strong>${rowNumber} row</strong> / <strong>${columnNumber} column</strong></div>`
  }
  
  const validateError = (headerName, rowNumber, columnNumber) => {
    return `<div class="red">${headerName} is not valid in the <strong>${rowNumber} row</strong> / <strong>${columnNumber} column</strong></div>`
  }
  
  const uniqueError = (headerName, rowNumber) => {
    return `<div class="red">${headerName} is not unique at the <strong>${rowNumber} row</strong></div>`
  }
  
  const isEmailValid = function (email) {
    const reqExp = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/
    return reqExp.test(email)
  }
  
  const isPasswordValid = function (password) {
    return password.length >= 4
  }
  
  const CSVConfig = {
    headers: [
      { name: 'First Name', inputName: 'firstName', required: true, requiredError },
      { name: 'Last Name', inputName: 'lastName', required: true, requiredError, optional: true },
      { name: 'Email', inputName: 'email', required: true, requiredError, unique: true, uniqueError, validate: isEmailValid, validateError },
      { name: 'Password', inputName: 'password', required: true, requiredError, validate: isPasswordValid, validateError },
      { name: 'Roles', inputName: 'roles', required: true, requiredError, isArray: true }
    ]
  }

  const processData = dataString => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
 
    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
      if (headers && row.length == headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] == '"')
              d = d.substring(1, d.length - 1);
            if (d[d.length - 1] == '"')
              d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }
 
        // remove the blank rows
        if (Object.values(obj).filter(x => x).length > 0) {
          list.push(obj);
        }
      }
    }
 
    // prepare columns list from headers
    const columns = headers.map(c => ({
      name: c,
      selector: c,
    }));
 
    setData(list);
    setColumns(columns);
  }
  
  const handleFileUpload = e => {
    CSVFileValidator(e.target.files[0], CSVConfig)
      .then(csvData => {
        csvData.inValidMessages.forEach(message => {
          document.getElementById('invalidMessages').insertAdjacentHTML('beforeend', message)
        })
        console.log(csvData.inValidMessages)
        console.log(csvData.data)
      })
      const reader = new FileReader();
      const file = e.target.files[0];
      reader.onload = (evt) => {
        /* Parse data */
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
        processData(data);
      };
      reader.readAsBinaryString(file);
  }
  

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Valida Arquivo CSV
        </p>

        <input type="file" accept=".csv" id="file"
          onChange={handleFileUpload}
        />

        <div id="invalidMessages"></div>

        <br />
        <DataTable
          pagination
          highlightOnHover
          columns={columns}
          data={data}
        />
      </header>
    </div>
  );
}


export default App;
