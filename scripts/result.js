const stations = parseInt(sessionStorage.getItem('stations'));
const firstBearing = parseFloat(sessionStorage.getItem('bearing')); // Bearing between station 1 and 2
const firstEasting = parseFloat(sessionStorage.getItem('easting'));
const firstNorthing = parseFloat(sessionStorage.getItem('northing'));
const angleType = sessionStorage.getItem('angleType');
const angles = JSON.parse(sessionStorage.getItem('angles'));
const distances = JSON.parse(sessionStorage.getItem('distances'));
const stationNumbers = JSON.parse(sessionStorage.getItem('stationNumbers'));


// Initialize arrays to store results
let bearings = [firstBearing];
let latitudes = [];
let departures = [];
let correctedLatitudes = [];
let correctedDepartures = [];
let coordinates = [{ easting: firstEasting, northing: firstNorthing }];
let correctedAngles = [];

// Calculate expected sum of angles based on the type (internal/external)
const expectedSum = (angleType === 'internal') ? (2 * stations - 4) * 100 : (2 * stations + 4) * 100;
const sumAngles = angles.reduce((a, b) => a + b, 0);

// Error handling: Check if sum of angles is within the tolerance
if (Math.abs(sumAngles - expectedSum) > 75 * Math.sqrt(stations)) {
    alert('Error: Angle sum exceeds the allowed limit. Corrections needed.');
} else {
    // Apply uniform correction to angles
    const correction = (expectedSum - sumAngles) / stations;
    for (let i = 0; i < angles.length; i++) {
        correctedAngles[i] = angles[i] + correction;  // Store corrected angles
    }

    // Calculate the perimeter of the traverse (sum of distances)
    const perimeter = distances.reduce((a, b) => a + b, 0);

    // Traverse computation logic
    for (let i = 0; i < stations; i++) {
        let nextBearing;
        if (i === 0) {
            nextBearing = firstBearing; // Use the given bearing between Station 1 and 2
        } else {
            // Calculate the next bearing for subsequent stations
            nextBearing = bearings[i] + correctedAngles[i - 1] - 200;
            if (nextBearing < 0) nextBearing += 400;  // Normalize bearing to keep it within 0 to 400 grads
            if (nextBearing > 400) nextBearing -= 400; // Ensure the bearing is below 400
        }
        bearings.push(nextBearing);

        let bearingRadians = nextBearing * Math.PI / 200;

        // Calculate latitude and departure
        let latitude = distances[i] * Math.cos(bearingRadians);
        let departure = distances[i] * Math.sin(bearingRadians);

        latitudes.push(latitude);
        departures.push(departure);
    }

    // Calculate the sum of all latitudes and departures
    const sumLatitudes = latitudes.reduce((a, b) => a + b, 0);
    const sumDepartures = departures.reduce((a, b) => a + b, 0);

    // Apply corrections to ensure that the sum of latitudes and departures equals zero (Bowditch's rule)
    for (let i = 0; i < stations; i++) {
        let correctedLatitude = latitudes[i] - (sumLatitudes * distances[i] / perimeter);
        let correctedDeparture = departures[i] - (sumDepartures * distances[i] / perimeter);

        correctedLatitudes.push(correctedLatitude);
        correctedDepartures.push(correctedDeparture);

        // Calculate new coordinates (Easting and Northing) using corrected latitude and departure
        let newEasting = coordinates[i].easting + correctedDeparture;
        let newNorthing = coordinates[i].northing + correctedLatitude;
        coordinates.push({ easting: newEasting, northing: newNorthing });
    }

    // Calculate the sum of corrected latitudes and departures
    const sumCorrectedLatitudes = correctedLatitudes.reduce((a, b) => a + b, 0);
    const sumCorrectedDepartures = correctedDepartures.reduce((a, b) => a + b, 0);

    // Calculate the sum of corrected angles
    const sumCorrectedAngles = correctedAngles.reduce((a, b) => a + b, 0);
    let finalBearing = bearings[stations - 1] + correctedAngles[stations - 1] - 200;

    // Final adjustment to ensure it's between 0 and 400 grads
    if (finalBearing < 0) finalBearing += 400;
    if (finalBearing > 400) finalBearing -= 400;
    
    bearings.push(finalBearing); 

    // Display the results in a table
    let resultTable = `<table>
                        <tr>
                            <th>Station Number</th>
                            <th>Observed Angle (grades)</th>
                            <th>Corrected Angle (grades)</th>
                            <th>Bearing (grades)</th>
                            <th>Distance (meters)</th> 
                            <th>Latitude (meters)</th>
                            <th>Departure (meters)</th>
                            <th>Corrected Latitude</th>
                            <th>Corrected Departure</th>
                            <th>Easting (meters)</th>
                            <th>Northing (meters)</th>
                        </tr>`;

    resultTable += `<tr>
                        <td>${stationNumbers[0]}</td>  <!-- Station 1 with known coordinates -->
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style="color: red;">${coordinates[0].easting.toFixed(4)}</td>
                        <td style="color: red;">${coordinates[0].northing.toFixed(4)}</td>
                    </tr>`;

    for (let i = 1; i < stations; i++) {
        resultTable += `<tr>
                             <td>${stationNumbers[i]}</td> <!-- Station index (i+1 because we start with station 1) -->
                            <td style="color: red;">${angles[i - 1].toFixed(4)}</td> <!-- Observed angle from station 2 -->
                            <td>${correctedAngles[i - 1].toFixed(4)}</td> <!-- Corrected angle -->
                            <td>${bearings[i].toFixed(4)}</td> <!-- Bearings -->
                            <td style="color: red;">${distances[i - 1].toFixed(4)}</td> <!-- Distance -->
                            <td>${latitudes[i - 1]?.toFixed(4)}</td> <!-- Latitude -->
                            <td>${departures[i - 1]?.toFixed(4)}</td> <!-- Departure -->
                            <td style="color: red;">${correctedLatitudes[i - 1]?.toFixed(4)}</td> <!-- Corrected Latitude -->
                            <td style="color: red;">${correctedDepartures[i - 1]?.toFixed(4)}</td> <!-- Corrected Departure -->
                            <td>${coordinates[i].easting.toFixed(4)}</td> <!-- Easting -->
                            <td>${coordinates[i].northing.toFixed(4)}</td>
                        </tr>`;
    }

   
    resultTable += `<tr>
                         <td>${stationNumbers[0]}</td>  <!-- Back to Station 1 -->
                        <td style="color: red;">${angles[stations - 1]?.toFixed(2)}</td>  <!-- Angle between Station 6 and 1 -->
                        <td>${correctedAngles[stations - 1]?.toFixed(4)}</td>  <!-- Corrected Angle between Station 6 and 1 -->
                        <td>${bearings[stations].toFixed(4)}</td>  <!-- Final bearing (should be ~395) -->
                        <td style="color: red;">${distances[stations - 1].toFixed(4)}</td>  <!-- Final distance -->
                        <td>${latitudes[stations - 1]?.toFixed(4)}</td>  <!-- Final latitude -->
                        <td>${departures[stations - 1]?.toFixed(4)}</td>  <!-- Final departure -->
                        <td style="color: red;">${correctedLatitudes[stations - 1]?.toFixed(4)}</td>  <!-- Final corrected latitude -->
                        <td style="color: red;">${correctedDepartures[stations - 1]?.toFixed(4)}</td>  <!-- Final corrected departure -->
                        <td style="color: green;">${coordinates[stations].easting.toFixed(4)}</td>  <!-- Final Easting -->
                        <td style="color: green;">${coordinates[stations].northing.toFixed(4)}</td>  <!-- Final Northing -->
                    </tr>`;

    // Add a row to display the sum of observed angles, corrected angles, latitudes, and departures
    resultTable += `<tr>
                        <td colspan="1"><strong>Total</strong></td>
                        <td style="color: red;"><strong>${sumAngles.toFixed(4)}</strong></td>
                        <td><strong>${sumCorrectedAngles.toFixed(4)}</strong></td>
                        <td></td>
                        <td></td>
                        <td style="color: red;"><strong>${sumLatitudes.toFixed(4)}</strong></td>
                        <td style="color: red;"><strong>${sumDepartures.toFixed(4)}</strong></td>
                        <td style="color: red;"><strong>${sumCorrectedLatitudes.toFixed(4)}</strong></td>
                        <td style="color: red;"><strong>${sumCorrectedDepartures.toFixed(4)}</strong></td>
                        <td></td>
                        <td></td>
                    </tr>
                    </table>`;

    document.getElementById('resultTable').innerHTML = resultTable;
}
