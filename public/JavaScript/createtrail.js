var map = L.map('map').setView([51.505, -0.09], 9);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam92Y2UiLCJhIjoiY2wzajNrNnM0MDJ3ajNqcDhxcjM5NDFhcCJ9.88XgrZIL9cXftpwpzl0nWw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(map);

let markerStart = L.marker([0, 0]);
let markerKonec = L.marker([0, 0]);
let lokPostanki = [];
let lokVmesni = [];
let lokStart = null;
let lokKonec = null;
let createdPot = L.Routing.control({
    waypoints: [markerStart, markerKonec],
    show: false,
}).addTo(map);


function createTrail() {
    const raw = {
        name: document.getElementById("name").value,
        latOrigin: finalStart.lat,
        lngOrigin: finalStart.lgn,
        nameOrigin: finalStart.name,
        latDest: finalKonec.lat,
        lngDest:  finalKonec.lgn,
        nameDest: finalKonec.name,
        length: document.getElementById("length").value,
        vmesniLok: lokVmesni,
        vmesniPos: lokPostanki,
        tezavnost: document.getElementById("tezavnost").value,
        surface: document.getElementById("surface").value,
        description: document.getElementById("description").value,
    };

    return raw;
}

function createFilter() {
    // let tipi = {
    //     concrete: document.getElementById("concrete").checked,
    //     dirt: document.getElementById("dirt").checked,
    //     macadam: document.getElementById("macadam").checked,
    //     forested: document.getElementById("forested").checked,
    //     gravel: document.getElementById("gravel").checked,
    //     other: document.getElementById("other").checked
    // }
    let tipi = [];
    let skatlici = document.getElementsByClassName("tipi");
    for(let i in skatlici){
        if(skatlici[i].checked){
            tipi.push(skatlici[i].getAttribute("name"));
        }
    }

    const raw = {
        tip: tipi,
        dolzina: document.getElementById("dolzina").value.toString(),
        tez: document.getElementById("tezava").value.toString()
    };

    console.log(raw.tip + "  " + raw.dolzina + "  " + raw.tez);
    return raw;
}

$(document).ready(function() {
    $("#createtrail").click(function() {
        const path = createTrail();
        console.log(path);
        $.post("/dodajpot", path, function(status) {
            if(status === "Success") {
                console.log("Successfully written to database.");

                lokStart = null;
                lokKonec = null;
                if(markerKonec !== null){
                    map.removeLayer(markerKonec);
                }
                if(markerStart !== null){
                    map.removeLayer(markerStart);
                }
                markerStart = L.marker([0, 0]);
                markerKonec = L.marker([0, 0]);
                map.removeControl(createdPot);
                createdPot = L.Routing.control({
                    waypoints: [lokStart, lokKonec],
                    show: false,
                }).addTo(map);
                lokVmesni.splice(0, lokVmesni.length);
                map.setView([51.505, -0.09], 2);
            } else {
                console.log("Internal server error.");
            }
        });
    });
});

$(document).ready(function() {
    // const path = createTrail();
    // console.log("executes");
    $.get("/poti", (data, status) => {
        // console.log(23);
        if(status === 500){
            console.log("Error")
        }
        // console.log(data);
        let poti1 = data;
        console.log(poti1);
        const transform = JSON.stringify(poti1);
        for(let elt in poti1) {
            console.log(poti1[elt]);
            //    document.getElementById('pregledpoti').innerHTML += poti1[elt].naslov + poti1[elt].tip + poti1[elt].dolzina + poti1[elt].ascend + poti1[elt].descend + poti1[elt].opis + poti1[elt].nivo_zahtevnosti;
            document.getElementById('pregledpoti').innerHTML += "<div class=\"spacingpoti\">" + "<div class=\"pregledpotistyle\">" + "<h2 id=\"opisshowing\" onclick=\"selektirajPot(" + poti1[elt].id + ")\">" + poti1[elt].naslov + "</h2>" + "<h6>" + "Tip pot: &nbsp" + poti1[elt].tip + "</h6>" + "<h6>" + "Dolzina: &nbsp" + poti1[elt].dolzina + "</h6>" + "<h6>" + "Tezavost: &nbsp" + poti1[elt].nivo_zahtevnosti + "</h6>" + "</div>" + "</div>" + "<hr class=\"hrforpaths\">";
        }
    });
});




function dolociLokacijo() {
    let lokacija = document.getElementById('naslov').value;
    console.log(lokacija)

    fetch('http://nominatim.openstreetmap.org/search?format=json&q=' + lokacija, {method: 'GET'})
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

$(document).ready(function() {
    $("#findPath").click(async function() {
        let filter = createFilter();
        console.log(filter.tez)
        await fetch("/filtriraj?dolzina=" + filter.dolzina + "&tez=" + filter.tez + "&tip=" + filter.tip, {
            method: 'get'
        }).then((res) => {
            console.log("Uspelo filtrirati");
            return res.json();
        }).then((fPoti)=>{
            console.log(fPoti);
            document.getElementById('pregledpoti').innerHTML = "";

            for(let elt in fPoti) {
                console.log(fPoti[elt]);
                //    document.getElementById('pregledpoti').innerHTML += poti1[elt].naslov + poti1[elt].tip + poti1[elt].dolzina + poti1[elt].ascend + poti1[elt].descend + poti1[elt].opis + poti1[elt].nivo_zahtevnosti;
                // document.getElementById('pregledpoti').innerHTML += "<div class=\"spacingpoti\">" + "<div class=\"pregledpotistyle\">" + "<h2 onclick=\"selektirajPot(" + fPoti[elt].id + ")\">" + "<b>" + fPoti[elt].naslov + "</b>" + "</h2>" + "<h6>" + "Tip pot: &nbsp" + fPoti[elt].tip + "</h6>" + "<h6>" + "Dolzina: &nbsp" + fPoti[elt].dolzina + "</h6>" + "<h6>" + "Tezavost: &nbsp" + fPoti[elt].nivo_zahtevnosti + "</h6>" + "<p>" + fPoti[elt].opis + "</p>" + "</div>" + "</div>" + "<hr class=\"hrforpaths\">";
                document.getElementById('pregledpoti').innerHTML += "<div class=\"spacingpoti\">" + "<div class=\"pregledpotistyle\">" + "<h2 id=\"opisshowing\" onclick=\"selektirajPot(" + fPoti[elt].id + ")\">" + fPoti[elt].naslov + "</h2>" + "<h6>" + "Tip pot: &nbsp" + fPoti[elt].tip + "</h6>" + "<h6>" + "Dolzina: &nbsp" + fPoti[elt].dolzina + "</h6>" + "<h6>" + "Tezavost: &nbsp" + fPoti[elt].nivo_zahtevnosti + "</h6>" + "</div>" + "</div>" + "<hr class=\"hrforpaths\">";

            }
        });

    });
});
let potPin = [];
let potMed = [];
let routingPot = L.Routing.control({
    waypoints: potMed,
    show: false,
}).addTo(map);
let currentPot = -1;

function selektirajPot(id){
    fetch("/selektirajPot/" + id,
        {
            method: 'get'
        }).then((res)=>res.json()).then((pot)=>{
            currentPot = pot.id;
            checkFav();
            document.getElementById("rating").style.display = "contents";
            console.log(pot);
            document.getElementById('showingopis').innerHTML = pot.opis;
            document.getElementById('showingopis').style.padding = '3%'
            document.getElementById("hidden1").style.display="block";
            document.getElementById("hidden2").style.display="block";
            document.getElementById("hidden-section").style.display="block";
            for(let i in potPin){
                map.removeLayer(potPin[i]);
            }
            map.removeControl(routingPot);

            routingPot = null;
            potPin.splice(0,potPin.length);
            potMed.splice(0,potMed.length);

            fetch("/selektirajStart/" + pot.tk_Start,
                {
                    method: 'get'
                }).then((res)=>res.json()).then((start)=>{

                document.getElementById("hiddenp1").innerHTML += "<tr> <p>" + start.naziv + "</p> </tr>";

                potPin.push(L.marker([start.kordY, start.kordX]));
                potMed.push(L.latLng(start.kordY, start.kordX));
            }).then(()=> {
                fetch("/selektirajVmesne/" + pot.id,
                    {
                        method: 'get'
                    }).then((res)=> {
                        return res.json();
                      }).then((vmesni)=> {

                    for(let j in vmesni) {
                        fetch("/getVmesna/" + vmesni[j].tk_Lokacija, {method: 'GET'})
                            .then((odgovor) => {return odgovor.json(); })
                            .then((lokacija) => {
                                document.getElementById("hiddenp1").innerHTML += "<tr> <p>" + lokacija.naziv + "</p> </tr>";
                                potMed.push(L.latLng(lokacija.kordY, lokacija.kordX))
                            });
                    }
                }).then(()=>{
                    fetch("/selektirajPostanke/" + pot.id,
                        {
                            method: 'get'
                        }).then((res)=>{
                   return res.json();
                    }).then((postanki)=>{

                        for(let j in postanki) {
                            fetch("/getPostanka/" + postanki[j].tk_Lokacija, {method: 'GET'})
                                .then((odgovor) => {return odgovor.json(); })
                                .then((lokacija) => {

                                    document.getElementById("hiddenp2").innerHTML += "<tr> <p>" + lokacija.naziv + "</p> </tr>";
                                    potPin.push(L.marker([lokacija.kordY, lokacija.kordX]));
                                });
                        }
                    }).then(()=>{
                        fetch("/selektirajKonec/" + pot.tk_Konec,
                            {
                                method: 'get'
                            }).then((res)=>res.json()).then((konec)=>{

                            document.getElementById("hiddenp1").innerHTML += "\n " + konec.naziv;
                            potPin.push(L.marker([konec.kordY, konec.kordX]));
                            potMed.push(L.latLng(konec.kordY, konec.kordX));
                            for(let i in potPin) {
                                map.addLayer(potPin[i]);
                            }
                            map.setView([konec.kordY, konec.kordX], 8);
                        }).then(()=>{
                            routingPot = L.Routing.control({
                                waypoints: potMed,
                                show: false,
                            }).addTo(map);
                        })
                    })
                })
            }).then(()=>{
                fetch("/komentarji/" + pot.id,
                    {
                        method: 'get'
                    }).then((res)=>res.json()).then((komentarji)=> {
                    console.log("Komentarji:");
                    document.getElementById('comNaslov').innerHTML = "Comments" + "<hr>"
                    document.getElementById('view').innerHTML = "";
                    for (let elt in komentarji){
                        fetch("/avtor/"+komentarji[elt].tk_Uporabnik, {
                            method: 'get'
                        }).then((res) => {
                            return res.json();
                        }).then((avtor)=>{
                            // You get the value here as "avtor"
                            document.getElementById('view').innerHTML += "<div class=\"questionhelpdiv\">"  + "<h3>Author: " + avtor.username + "</h3>" + "<h3>Rating: " + komentarji[elt].kolicina + "</h3>"+ "<h3>Comment: " +  komentarji[elt].text + "</h3>" + "<button class=\"reportbutton\" onclick='report(" + komentarji[elt].id  +")'>" + "Report" + "</button>" + "<br>" + "<hr>"+"</div>";
                        });
                    }

                });
            })
    })
}

function report(id){
    $.post("/reportKomentar", {id: id}, (req, status)=>{
        if(status === "Success") {
            console.log("Successfully written to database.");
        } else {
            console.log("Internal server error.");
        }
    })
}

function izbrisiPot(id){
    $.post("/deletePot", {id: id}, (req, status)=>{
        if(status === "Success") {
            console.log("Successfully written to database.");
        } else {
            console.log("Internal server error.");
        }
    })
}

let finalStart = {};
let finalKonec = {};

function addStart(){
    console.log(document.getElementById("naslov").value)
    finalStart = {name: document.getElementById("naslov").value, lat: selectedLat, lgn: selectedLng};
    document.getElementById("naslov").value = "";

    map.removeLayer(curPin);
    if(markerStart !== null){
        map.removeLayer(markerStart);
    }
    markerStart = L.marker([selectedLat, selectedLng]);
    lokStart = L.latLng(selectedLat, selectedLng);

    map.addLayer(markerStart);
    if (lokStart !== null && lokKonec != null){
        map.removeControl(createdPot);
        createdPot = L.Routing.control({
            waypoints: [lokStart, lokKonec],
            show: false,
        });
        if (lokVmesni.length > 0){
            for(let j in lokVmesni){
                console.log("We at " + j);
                createdPot.spliceWaypoints(-1, 0, lokVmesni[j]);
            }
        }
        createdPot.addTo(map);
        createdPot.on('routesfound', function(e) {
            var routes = e.routes;
            var summary = routes[0].summary;
            document.getElementById("length").value = Math.trunc(summary.totalDistance / 1000);
        });
    }
    updatePathDisplay();

}

function addKonec(){
    finalKonec = {name: document.getElementById("naslov").value, lat: selectedLat, lgn: selectedLng};
    document.getElementById("naslov").value = "";

    map.removeLayer(curPin);
    if(markerKonec !== null){
        map.removeLayer(markerKonec);
    }
    markerKonec = L.marker([selectedLat, selectedLng]);
    lokKonec = L.latLng(selectedLat, selectedLng);

    map.addLayer(markerKonec);
    if (lokStart !== null && lokKonec != null){
        map.removeControl(createdPot);
        createdPot = L.Routing.control({
            waypoints: [lokStart, lokKonec],
            show: false,
        });
        if (lokVmesni.length > 0){
            for(let j in lokVmesni){
                console.log("We at " + j);
                createdPot.spliceWaypoints(-1, 0, lokVmesni[j]);
            }
        }
        createdPot.addTo(map);
        createdPot.on('routesfound', function(e) {
            var routes = e.routes;
            var summary = routes[0].summary;
            document.getElementById("length").value = Math.trunc(summary.totalDistance / 1000);
        });
    }
    updatePathDisplay();

}
function addVmesno(){
    map.removeLayer(curPin);

    lokVmesni.push({name: document.getElementById("naslov").value ,lat: selectedLat, lng: selectedLng});
    document.getElementById("naslov").value = "";
    console.log("lokVmesni: ");
    console.log(lokVmesni);

    if (lokStart !== null && lokKonec != null){
        map.removeControl(createdPot);
        createdPot = L.Routing.control({
            waypoints: [lokStart, lokKonec],
            show: false,
        });
        if (lokVmesni.length > 0){
            for(let j in lokVmesni){
                console.log("We at " + j);
                createdPot.spliceWaypoints(-1, 0, L.latLng(lokVmesni[j].lat, lokVmesni[j].lng));
            }
        }
        createdPot.addTo(map);
        createdPot.on('routesfound', function(e) {
            var routes = e.routes;
            var summary = routes[0].summary;
            document.getElementById("length").value = Math.trunc(summary.totalDistance / 1000);
        });
    }
    updatePathDisplay();

}

function addPostanek(){
    map.removeLayer(curPin);

    lokPostanki.push({name: document.getElementById("naslov").value,lat: selectedLat, lng: selectedLng});
    document.getElementById("naslov").value = "";
    console.log("lokVmesni: ");
    console.log(lokPostanki);
    updatePostankiDisplay();
}
let selectedLat = 0;
let selectedLng = 0;
let curPin = L.marker([0, 0]);

map.on('click', function(e) {
    map.removeLayer(curPin);
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;
    curPin = L.marker([selectedLat, selectedLng]);
    map.addLayer(curPin);
    console.log(selectedLat);
    console.log(selectedLng);
});

const allStars = document.querySelectorAll('.star');
let current_rating = document.querySelector('.current_rating');

let currentOcena = 0;
allStars.forEach((star,i) => {
    star.onclick = function() {
        let current_star_level = i + 1;
        current_rating.innerText = `${current_star_level} of 5`;
        document.getElementsByClassName('star').id = "star" + current_star_level;
        allStars.forEach((star,j) => {
            if(current_star_level >= j+1){
                star.innerHTML = '&#9733';
            } else {
                star.innerHTML = '&#9734';
            }
        })
        currentOcena = current_star_level;
        console.log(currentOcena)
    }
})
function komentiraj() {
    let txtCom = document.getElementById("txtKomentar");

    const novKomentar = {
        txt: txtCom.value,
        pot: currentPot,
        kol: currentOcena
    }
    $.post("/dodajKomentar", novKomentar, function (status) {
        if (status === "Success") {
            console.log("Successfully written to database.");
        } else {
            console.log("Internal server error.");
        }
    });
}

$(document).ready(function() {
    $('.filter').hide();
    $('#buttonforfilter').click(function() {
        $('.filter').slideToggle(500);
    });
});


function addFav(){
    console.log(currentPot)
    $.post("/dodajFavorite", {pot: currentPot}, function (status) {
        if (status === "Success") {
            console.log("Successfully written to database.");
        } else {
            console.log("Internal server error.");
        }
    }).then(()=>{
        checkFav();
    });
}

function allFavs(){
    fetch("/favorites", {
        method: 'get'
    }).then((res)=>res.json()).then((fPoti)=>{
        console.log(fPoti);
        document.getElementById('pregledpoti').innerHTML = "";

        for(let elt in fPoti) {
            console.log(fPoti[elt]);
            //    document.getElementById('pregledpoti').innerHTML += poti1[elt].naslov + poti1[elt].tip + poti1[elt].dolzina + poti1[elt].ascend + poti1[elt].descend + poti1[elt].opis + poti1[elt].nivo_zahtevnosti;
            // document.getElementById('pregledpoti').innerHTML += "<div class=\"spacingpoti\">" + "<div class=\"pregledpotistyle\">" + "<h2 onclick=\"selektirajPot(" + fPoti[elt].id + ")\">" + fPoti[elt].naslov + "</h2>" + "<h6>" + "Tip pot: &nbsp" + fPoti[elt].tip + "</h6>" + "<h6>" + "Dolzina: &nbsp" + fPoti[elt].dolzina + "</h6>" + "<h6>" + "Tezavost: &nbsp" + fPoti[elt].nivo_zahtevnosti + "</h6>" + "<p>" + fPoti[elt].opis + "</p>" + "</div>" + "</div>" + "<hr class=\"hrforpaths\">";
            document.getElementById('pregledpoti').innerHTML += "<div class=\"spacingpoti\">" + "<div class=\"pregledpotistyle\">" + "<h2 id=\"opisshowing\" onclick=\"selektirajPot(" + fPoti[elt].id + ")\">" + fPoti[elt].naslov + "</h2>" + "<h6>" + "Tip pot: &nbsp" + fPoti[elt].tip + "</h6>" + "<h6>" + "Dolzina: &nbsp" + fPoti[elt].dolzina + "</h6>" + "<h6>" + "Tezavost: &nbsp" + fPoti[elt].nivo_zahtevnosti + "</h6>" + "</div>" + "</div>" + "<hr class=\"hrforpaths\">";

        }
    });
}

function removeFav(){
    console.log(currentPot)
    $.post("/deleteFavorite", {pot: currentPot}, function (status) {
        if (status === "Success") {
            console.log("Successfully removed favorite.");
        } else {
            console.log("Internal server error.");
        }
    }).then(()=>{
        checkFav();
    });
}

function checkFav(){
    let favBtn = document.getElementById("favoriteButton");
    fetch("/checkFavorite/" + currentPot, {
        method: 'get'
    }).then((res)=>res.json()).then((isFav)=>{
        if(isFav){
            favBtn.innerHTML = "Remove path to favorites";
            favBtn.setAttribute("onClick", "removeFav()");
        }
        else{
            favBtn.innerHTML = "Add path to favorites"
            favBtn.setAttribute("onClick", " addFav()");
        }
    });
}

function updatePathDisplay(){
    document.getElementById("startbetweenkonec").innerHTML = "";
    if(lokStart != null){
        document.getElementById("startbetweenkonec").innerHTML += "<div> " + (finalStart.name == "" ? "Unspecified Start" : finalStart.name ) + " </div>" ;
    }
    if(lokVmesni != null){
        for (let i in lokVmesni){
            document.getElementById("startbetweenkonec").innerHTML += "<div> " + ( lokVmesni[i].name  == "" ? "Unspecified Checkpoint" :  lokVmesni[i].name) + " </div>"  ;
        }
    }
    if(lokKonec != null){
        document.getElementById("startbetweenkonec").innerHTML += "<div> " + ( finalKonec.name == "" ?  "Unspecified End" : finalKonec.name) + " </div>"  ;
    }
}
function updatePostankiDisplay(){
    document.getElementById("spotsbetween").innerHTML = "";
    if(lokPostanki != null){
        for (let i in lokPostanki){
            document.getElementById("spotsbetween").innerHTML += "<div> " + (lokPostanki[i].name == "" ? "Unspecified Spot" : lokPostanki[i].name ) + " </div>" ;
        }
    }
}

function resetTrail(){
    document.getElementById("startbetweenkonec").innerHTML = "";
    document.getElementById("spotsbetween").innerHTML = "";
    document.getElementById("length").value = "";
    lokStart = null;
    lokKonec = null;
    if(markerKonec !== null){
        map.removeLayer(markerKonec);
    }
    if(markerStart !== null){
        map.removeLayer(markerStart);
    }
    markerStart = L.marker([0, 0]);
    markerKonec = L.marker([0, 0]);
    map.removeControl(createdPot);
    createdPot = L.Routing.control({
        waypoints: [lokStart, lokKonec],
        show: false,
    }).addTo(map);
    lokVmesni.splice(0, lokVmesni.length);
}
