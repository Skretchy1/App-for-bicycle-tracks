var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam92Y2UiLCJhIjoiY2wzajNrNnM0MDJ3ajNqcDhxcjM5NDFhcCJ9.88XgrZIL9cXftpwpzl0nWw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(map);

function dolociLokacijo() {
    let lokacija = document.getElementById('naslov').value;
    console.log(lokacija)

    fetch('http://nominatim.openstreetmap.org/search?format=json&q=${lokacija}', {method: 'GET'})
    .then((odgovor) => {return odgovor.json(); })
    .then((lokacije) => {
        if(lokacije.length == 0) {
            return;
        }
        console.log(lokacije[0]);
        console.log(lokacije);
        let izbrana = lokacije[0];

        L.marker([izbrana.lat, izbrana.lon]).addTo(map);
        map.setView([izbrana.lat, izbrana.lon], 13);   
    });
}