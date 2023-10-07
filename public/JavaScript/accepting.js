$(document).ready(function() {
    refresh();
});

function refresh(){
    $.get("/getnepregledan", (data, status) => {
        if(status === 500){
            console.log("Error")
        }
        let poti1 = data;
        document.getElementById('hereshowingpaths').innerHTML = "";
        for(let elt in poti1) {
        document.getElementById('hereshowingpaths').innerHTML += "<div id=\"rcorners2all\"" + "<div>" + "<div>" + "<h3>" + poti1[elt].status + "</h3>" + "<h2>" + poti1[elt].naslov + "</h2>" + "<h6>" + "Tip pot: &nbsp" + poti1[elt].tip + "</h6>" + "<h6>" + "Dolzina: &nbsp" + poti1[elt].dolzina + "</h6>" + "<h6>" + "Ascend: &nbsp" + poti1[elt].ascend + "</h6>" + "<h6>" + "Descent: &nbsp" + poti1[elt].descend + "</h6>" + "<h6>" + "Tezavost: &nbsp" + poti1[elt].nivo_zahtevnosti + "</h6>" + "<p>" + poti1[elt].opis + "</p>" + "</div>" + "<button type=\"button\" onclick=\"acceptPot(" + poti1[elt].id + ")\" class=\"btn btn-primary\">Accept</button>" + "<button type=\"button\" onclick=\"deletePot(" + poti1[elt].id + ")\" class=\"btn btn-primary\" >Block</button>" + "</div> </div>" ;
        }
    });
    $.get("/getnepregledanKomentar", (data, status) => {
        if(status === 500){
            console.log("Error")
        }
        let komentarji1 = data;
        document.getElementById('commentsaccepting').innerHTML = "";
        for(let elt in komentarji1) {
            document.getElementById('commentsaccepting').innerHTML += "<div id=\"rcorners2all\"" + "<div>" + "<div>"+"<div id=\"rcorners2\">" + "<h2>" + "Status komentara:" + "</h2>" + "<h3>" + komentarji1[elt].status +  "</h3>"+"</div>" +"<div id=\"rcorners2\">" +"<h2>" + "Text komentara:" + "</h2>" + "<h2>" + komentarji1[elt].text + "</h2>" + "</div>" + "<button type=\"button\" onclick=\"acceptKom(" + komentarji1[elt].id + ")\" class=\"btn btn-primary\">Accept</button>" + "<button type=\"button\" onclick=\"deleteKom(" + komentarji1[elt].id + ")\" class=\"btn btn-primary\" >Block</button>" + "</div>" + "</div>";
        }
    });
}

function deletePot(id){
    console.log("We're deleting");
    $.post("/deletePot", {id: id}, function (status){
        if(status === "Success") {
            refresh();
            console.log("Successfully written to database.");
        } else {
            console.log("Internal server error.");
        }
    });
}

function acceptPot(id){
    console.log("We're accepting");
    $.post("/acceptPot", {id: id}, function (status){
        if(status === "Success") {
            refresh();
            console.log("Successfully accepted path.");
        } else {
            console.log("Internal server error.");
        }
    });
}
// Accepting za komentarje

function deleteKom(id){
    console.log("We're deleting");
    $.post("/deleteKomentar", {id: id}, function (status){
        if(status === "Success") {
            refresh();
            console.log("Successfully written to database.");
        } else {
            console.log("Internal server error.");
        }
    });
}

function acceptKom(id){
    console.log("We're accepting");
    $.post("/acceptKomentar", {id: id}, function (status){
        if(status === "Success") {
            refresh();
            console.log("Successfully accepted path.");
        } else {
            console.log("Internal server error.");
        }
    });
}