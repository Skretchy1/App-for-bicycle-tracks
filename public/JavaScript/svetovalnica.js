
$(document).ready(function() {
    $.get("/objave", (data, status) => {
        if(status === 500){
            console.log("Error")
        } 
        let podatki = data;
        const transform = JSON.stringify(podatki);
        
        for(let elt in podatki) {
            let spremenljivka = "";
            console.log(podatki[elt]);
             fetch("/avtor/"+podatki[elt].tk_Strokovnjak, {
                method: 'get'
            }).then((res) => {
                console.log("Uspelo");
                return res.json();
            }).then((avtor)=>{
                // You get the value here as "avtor"
                spremenljivka += "<p class:\" rndborder\">Avtor: " + avtor.username + "</p>" ;
                console.log("Username avtorja: " + avtor.username);
                document.getElementById('placeforshowing').innerHTML += "<div>" + "<details class=\"detailsstyled\">" + "<summary>" + podatki[elt].naslov +"<hr>" + spremenljivka + "</summary>" + "<p>" + podatki[elt].text + "</p>" + "</details>" + "</div>";
            });            
            
        }
    });

    $.get('/usertype', (usertype, status)=>{
        if(usertype === "2" ||usertype === "3"){
            $("#createNasvet").click(function() {
                const nasvet = createNasvet();
                $.post("/dodajNasvet", nasvet, function(data, status) {
                    if(status === "Success") {
                        console.log("Successfully written to database.");
                    } else {
                        console.log(data);
                    }
                });
            });
        }else{
            document.getElementById("makingposts").style.display = "none";
        }
    });
});



function createTrail() {
    const podatek = {
        naslov: document.getElementById("!!!!!!!!!").value,
        opis: document.getElementById("!!!!!!!!!").value,
    };

    const data1 = new FormData();
    data1.append("naslov", podatek.naslov);
    data1.append("opis", podatek.opis);

    return podatek;
}

function createNasvet() {
    const podatek = {
        naslov: document.getElementById("fornaslov").value,
        opis: document.getElementById("foropis").value,
    };

    const data1 = new FormData();
    data1.append("naslov", podatek.naslov);
    data1.append("opis", podatek.opis);

    return podatek;
}


function createOdgovor() {
    const podatek = {
        opis: document.getElementById("!!!!!!!!!").value,
    };

    const data1 = new FormData();
    data1.append("opis", podatek.opis);

    return podatek;
}
