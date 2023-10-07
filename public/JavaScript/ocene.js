const allStars = document.querySelectorAll('.star');
let current_rating = document.querySelector('.current_rating');
allStars.forEach((star,i) => {
    star.onclick = function() { 
        let current_star_level = i + 1;
        current_rating.innerText = `${current_star_level} of 5`;
        document.getElementById('star').id = "star" + current_star_level;
        allStars.forEach((star,j) => {
            if(current_star_level >= j+1){
                star.innerHTML = '&#9733';
            } else {
                star.innerHTML = '&#9734';
            }
            console.log(current_star_level);
        })

    }
})

function komentarisi(id) {
    
    
    $("#ocenabtn").click(function()  {
        let txtCom = document.getElementById("txtKomentar" + id);
       
        const komentar = {
            txt: txtCom.value,
            pot: id,

        }
        
        $.post("/dodajKomentar", komentar, function(status) {
            if(status === "Success") {
                console.log("Successfully written to database.");
            } else {
                console.log("Internal server error.");
            }
        });
    });
};
function oceni(id){
    let getStar = document.getElementById("star" + id);
    let getRating = current_rating;
    console.log(getRating);
   


    let novOcenab  = {
        kol: getRating.value,
        pot: id,
    }

    $.post("/dodajOdgovor", novOdgovor, function(status) {
        if(status === "Success") {
            console.log("Successfully written to database.");
        } else {
            console.log("Internal server error.");
        }
    });
}

