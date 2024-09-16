document.getElementById('firstForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const stations = document.getElementById('stations').value;

    // Save the number of stations to sessionStorage to pass it to the next page
    sessionStorage.setItem('stations', stations);

    // Redirect to the second interface
    window.location.href = 'second_interface.html';
});
