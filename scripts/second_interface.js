const stations = parseInt(sessionStorage.getItem('stations'));
const anglesSection = document.getElementById('anglesSection');  // Assuming this is where we want the table to go

// Create a table for angles and distances
const table = document.createElement('table');
table.setAttribute('id', 'inputTable');

// Create table header
const thead = document.createElement('thead');
const headerRow = document.createElement('tr');

const stationHeader = document.createElement('th');
stationHeader.innerHTML = 'Station Number';  
const angleHeader = document.createElement('th');
angleHeader.innerHTML = 'Angle (in grads)';
const distanceHeader = document.createElement('th');
distanceHeader.innerHTML = 'Distance (in meters)';

headerRow.appendChild(stationHeader);
headerRow.appendChild(angleHeader);
headerRow.appendChild(distanceHeader);
thead.appendChild(headerRow);
table.appendChild(thead);

// Create table body
const tbody = document.createElement('tbody');

// Dynamically create input fields for station numbers, angles, and distances in each row
for (let i = 1; i <= stations; i++) {
    const row = document.createElement('tr');
    
    const stationCell = document.createElement('td');
    const stationInput = document.createElement('input');
    stationInput.type = 'number';
    stationInput.name = `stationNumber${i}`;
    stationInput.required = true;
    stationCell.appendChild(stationInput);
    row.appendChild(stationCell);

    // Angles input
    const angleCell = document.createElement('td');
    const angleInput = document.createElement('input');
    angleInput.type = 'number';
    angleInput.name = `angle${i}`;
    angleInput.step = 'any';
    angleInput.required = true;
    angleCell.appendChild(angleInput);
    row.appendChild(angleCell);

    // Distances input
    const distanceCell = document.createElement('td');
    const distanceInput = document.createElement('input');
    distanceInput.type = 'number';
    distanceInput.name = `distance${i}`;
    distanceInput.step = 'any';
    distanceInput.required = true;
    distanceCell.appendChild(distanceInput);
    row.appendChild(distanceCell);

    // Append the row to the table body
    tbody.appendChild(row);
}

// Append the table body to the table
table.appendChild(tbody);

// Append the table to the anglesSection (or any other section where you want the table to appear)
anglesSection.appendChild(table);

// Handle form submission
document.getElementById('secondForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const bearing = parseFloat(document.getElementById('bearing').value);
    const easting = parseFloat(document.getElementById('easting').value);
    const northing = parseFloat(document.getElementById('northing').value);
    const angleType = document.querySelector('input[name="angleType"]:checked').value;

    let stationNumbers = [];
    let angles = [];
    let distances = [];

    for (let i = 1; i <= stations; i++) {
        const stationNumber = parseInt(document.querySelector(`input[name="stationNumber${i}"]`).value);
        stationNumbers.push(stationNumber);  // Get station number from user input
        angles.push(parseFloat(document.querySelector(`input[name="angle${i}"]`).value));
        distances.push(parseFloat(document.querySelector(`input[name="distance${i}"]`).value));
    }

    // Save data to sessionStorage
    sessionStorage.setItem('bearing', bearing);
    sessionStorage.setItem('easting', easting);
    sessionStorage.setItem('northing', northing);
    sessionStorage.setItem('angleType', angleType);
    sessionStorage.setItem('stationNumbers', JSON.stringify(stationNumbers));  // Save station numbers
    sessionStorage.setItem('angles', JSON.stringify(angles));
    sessionStorage.setItem('distances', JSON.stringify(distances));

    // Redirect to result page
    window.location.href = 'result.html';
});
