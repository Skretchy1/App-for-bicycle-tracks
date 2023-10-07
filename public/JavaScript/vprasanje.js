$(document).ready(function() {
    $("#question").click(function() {
        const vprasanje = {
            opis: document.getElementById("text").value,
        };
        $.post("/dodajVprasanje", vprasanje, function(data,status) {
            if(status === "Success") {
                console.log("Successfully written to database.");
            } else {
                console.log(status);
            }
        });
    });
});


// Code for taking questions from the database

$(document).ready(function() {

    $.get("/usertype", (usertype, status) => {
        let vsiOdgovori = [];
        $.get("/odgovori", (data, status) => {
            if(status === 500){
                console.log("Error")
            }
            let podatki = data;
            for(let i in podatki) {
                vsiOdgovori.push(podatki[i]);
            }
        });

        $.get("/vprasanja", async(data, status) => {
            if(status === 500){
                console.log("Error")
            }
            let podatki = data;
            for(let i in podatki) {
                let spremenljivkaUp ="";
                fetch("/avtor/"+podatki[i].tk_Uporabnik, {
                    method: 'get'
                }).then((res) => {
                    console.log("Uspelo");
                    return res.json();
                }).then((avtor)=>{
                    // You get the value here as "avtor"
                    spremenljivkaUp += "<p class:\" rndborder\">Question author: " + avtor.username + "</p> <hr>" ;
                    console.log("Username avtorja: " + avtor.username);
                });
                console.log(podatki[i]);
                let odgovor = [];
                for(let j in vsiOdgovori){
                    if(vsiOdgovori[j].tk_Vprasanje-1 == i){
                        odgovor.push(vsiOdgovori[j]);
                        console.log("dodano: " +vsiOdgovori[j]);
                    }
                }
                let spremenljivka = "";

                for(let j in odgovor) {
                    console.log("Odgovor: " + odgovor[j].text + ", za vprasanje: " + i);
                    spremenljivka += "<p>Response: " + odgovor[j].text + "</p>";

                    // Part that reads the author of a post
                    await fetch("/avtor/"+odgovor[j].tk_Strokovnjak, {
                        method: 'get'
                    }).then((res) => {
                        console.log("Uspelo");
                        return res.json();
                    }).then((avtor)=>{
                        // You get the value here as "avtor"
                        spremenljivka += "<p class:\" rndborder\">Response author: " + avtor.username + "</p> <hr>" ;
                        console.log("Username avtorja: " + avtor.username);
                    });
                }
                let innerv = "";
                // document.getElementById('prikaz').innerHTML += "<div class=\"questionhelpdiv\">" + "<details class=\"detailsstyled\">" + "<summary>" + podatki[i].text + "</summary>" + "<p>" + "<label>Odgovori:</label><input id=\"in" + podatki[i].id + "\"type=\"text\" placeholder=\"Odgovori na vprasanje\"> <button type=\"button\" onclick=\"odgovori(" + podatki[i].id + ")\">" +"Odgovori</button>"+ "</p>" + "</details>" + "</div>";
                if (usertype === "2" || usertype === "3"){
                    innerv = "<p>" +  "<label>Respond:</label><input id=\"in" + podatki[i].id + "\"type=\"text\" placeholder=\"Answer the question\"> <button style=\"background-color: #24688b !important;\" class=\"btn btn-primary\" type=\"submit\" onclick=\"odgovori(" + podatki[i].id + ")\">" +"Answer</button>"+ "</p>"
                } 

                document.getElementById('prikaz').innerHTML += "<div class=\"questionhelpdiv\">" + "<details>" + "<summary>" + podatki[i].text + "</summary>" +spremenljivkaUp + spremenljivka + innerv + "</details>" + "</div>";
            }
        });
    });


});

// Function for adding an answer
function odgovori(id){
    let textField = document.getElementById("in" + id);

    let novOdgovor = {
        text: textField.value,
        tk_Vprasanje: id
    }

    $.post("/dodajOdgovor", novOdgovor, function(data, status) {
        if(data=== "401") {
            console.log("You're not authenticated");
        } else if(data === "403"){
            console.log("You don't have permission to perform this operation");
        }
    });
}