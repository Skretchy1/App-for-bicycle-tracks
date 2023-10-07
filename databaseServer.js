const express = require('express');
const app = express();
const mysql = require('mysql');
const {ftruncate} = require("fs");

const knex = require('knex')({
    client: "mysql",
    connection: {
        host: "localhost",
        user: "root",
        password: "",
        database: "mock"
    }
});

const bookshelf = require('bookshelf')(knex);

app.get("/database", (req, res) =>{
    res.sendFile("HTML/testing-base.html", {root : "public"});
});

app.post("/createdb", (req,res)=>{
    KreirajBazo();

});

app.post("/INSERT", (req,res)=>{
    insertInto("Uporabnik", {ime: "Name", priimek: "Change", username: "change123", email: "change123", geslo: "123", tk_Vrsta_Uporabnika: 1});
});

app.post("/deleteTwo", async (req, res) => {
    try{
        let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
        await new bookshelfUporabnik().where("ime", "Sergej").destroy();
        console.log("Uspesno odstraneno");
        res.redirect('/database');
    }
    catch (err){
        res.json(err);
    }
});

app.post("/checkUser", async (req, res) => {

    try{
        let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
        let email = "change123";
        await new bookshelfUporabnik().where("email", email).save({ime: "Boban"},{patch: true});

        res.redirect("/database");
    }
    catch (err){
        console.log("User doesn't exist");
        res.json(err);
    }
});

app.post("/changePassword", async (req, res) => {
    try{
        let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
        let email = req.body.email;
        let newPassword = req.body.password;
        await new bookshelfUporabnik().where("email", email).save({geslo: newPassword});

        res.redirect("/database");
    }
    catch (err){
        res.json(err);
    }
});

async function createBookshelfOf(tbl){
    let newBookshelf = bookshelf.Model.extend({
        tableName: tbl,
        idAttribute: "id"
    });

    return newBookshelf;
}


app.get("/admin", async(req, res) =>{
    try{
        let poti = await new bookshelfPot().where("status", "NEPREGLEDANO").fetchAll();
        let komentari = await new bookshelfKomentar().where("status", "NEPREGLEDANO").fetchAll();
    }
    catch (error){
        res.status(500).json(error);
    }
});

app.delete("/deleteKomentar", async (req, res)=>{
    let deleteId = req.body.id;
    await new bookshelfKomentar({id: deleteId}).destroy();
});

app.delete("/deletePot", async (req, res)=>{
    bookshelfPot = createBookshelfOf("Pot");
    bookshelfStart = createBookshelfOf("Start");
    bookshelfKonec = createBookshelfOf("Konec");
    bookshelfLokacija = createBookshelfOf("Lokacija");

    let deleteIdPot = req.body.id;
    let deleteIdStart = req.body.tk_Start;
    let deleteIdKonec = req.body.tk_Konec;

    await new bookshelfPot({id: deleteIdPot}).destroy();
    await new bookshelfStart({id: deleteIdStart}).destroy();
    await new bookshelfKonec({id: deleteIdKonec}).destroy();
    await new bookshelfLokacija({id: deleteIdKonec}).destroy();
    await new bookshelfLokacija({id: deleteIdStart}).destroy();

});

app.post("/DUMMY", async(req,res)=>{
    var dummyUporabnik = [
        {ime: "Žan", priimek: "Žanović", username: "zannz123", email: "zan@email.com", geslo: "123", tk_Vrsta_Uporabnika: 1},
        {ime: "Marijan", priimek: "Hudi", username: "topHudic", email: "marijan@email.com", geslo: "123", tk_Vrsta_Uporabnika: 1},
        {ime: "Sergej", priimek: "Kabasov", username: "s3rgej", email: "sergej@email.com", geslo: "123", tk_Vrsta_Uporabnika: 1},
        {ime: "Strok", priimek: "En", username: "prostrok", email: "strok@mail", geslo: "123", tk_Vrsta_Uporabnika: 2},
    ];

    var dummyVprasanje = [
        {text: "Ali lahko najdemo poti do drugih državin?", tk_Uporabnik: 1},
        {text: "Kje lahko najdem koles?", tk_Uporabnik: 2},
        {text: "Zakaj je to spletno stran?", tk_Uporabnik: 3},
    ];
    var dummyNasvet = [
        {naslov: "Test Naslov", text: "Wow, stvari", tk_Strokovnjak: 4},
        {naslov: "Test Naslov2", text: "To dela", tk_Strokovnjak: 4},
        {naslov: "To je nasvet", text: "To je text", tk_Strokovnjak: 4}
    ];

    await insertInto("Vrsta_Uporabnika", {naziv: "Uporabnik"});
    await insertInto("Vrsta_Uporabnika", {naziv: "Strokovnjak"});
    await insertInto("Vrsta_Uporabnika", {naziv: "Administrator"});
    await insertInto("Uporabnik", dummyUporabnik).then(async()=>{await insertInto("Nasvet", dummyNasvet);
    }).then(async()=>{    await insertInto("Vprasanje", dummyVprasanje);
    })
});

{
    var insertVrsta = [
        {naziv: ""}
    ];
    var insertStrokovnjak = [
        {tk_Vrsta_Uporabnika: 0}
    ];
    var insertUporabnik = [
        {ime: "", priimek: "", username: "", email: "", geslo: "", tk_Vrsta_Uporabnika: 0}
    ];
    var insertPredlogKoles = [
        {tip: ""}
    ];
    var insertPredlogOprem = [
        {tk_Predlog_Oprem: 0, tk_Oprema: 0}
    ];
    var insertKoloUstreza = [
        {tk_Predlog_Koles: 0, tk_Kolo: 0}
    ];
    var insertOpremaUstreza = [
        {tip: ""}
    ];
    var insertKolo = [
        {naziv: "", proizvajalec: "", cena: 0, img: ""}
    ];
    var insertOprema = [
        {naziv: "", proizvajalec: "", cena: 0,  img: ""}
    ];
    var insertLokacija = [
        {naziv: "", adresa: "", kordX: 0, kordY: 0, mesto: "", drzava: ""}
    ];
    var insertVmesni = [
        {tk_Pot: 0, tk_Lokacija: 0}
    ];
    var insertStart = [
        {tk_Lokacija: 0}
    ];
    var insertKonec = [
        {tk_Lokacija: 0}
    ];
    var insertPot = [
        {status: "", tip: "", dolzina: 0, ascend: 0, descend: 0, naslov:"", opis: "", nivo_zahtevnosti: 0,
            tk_Uporabnik: 0, tk_Vmesni_Postanki: 0, tk_Start: 0, tk_Konec: 0}
    ];
    var insertNasvet = [
        {naslov: "", text: "", tk_Strokovnjak: 0}
    ];
    var insertVprasanje = [
        {text: "", tk_Uporabnik: 0}
    ];
    var insertOdgovor = [
        {text: "", tk_Strokovnjak: 0, tk_Vprasanje: 0}
    ];
    var insertKomentar = [
        {text: "", status: "", tk_Uporabnik: 0, tk_Pot: 0}
    ];
    var insertOcena = [
        {kolicina: 0, tk_Uporabnik: 0, tk_Pot: 0}
    ];

}



var dummyUporabnik = [
    {ime: "Žan", priimek: "Žanović", username: "zannz123", email: "zan@email.com", geslo: "123", tk_Vrsta_Uporabnika: 1},
    {ime: "Marijan", priimek: "Hudi", username: "topHudic", email: "marijan@email.com", geslo: "123", tk_Vrsta_Uporabnika: 1},
    {ime: "Sergej", priimek: "Kabasov", username: "s3rgej", email: "sergej@email.com", geslo: "123", tk_Vrsta_Uporabnika: 1},
];

var dummyVprasanje = [
    {text: "Ali lahko najdemo poti do drugih državin?", tk_Uporabnik: 7},
    {text: "Kje lahko najdem koles?", tk_Uporabnik: 8},
    {text: "Zakaj je to spletno stran?", tk_Uporabnik: 9},
];

var dummyNasvet = [
    {naslov: "Test Naslov", text: "Wow, stvari", tk_Strokovnjak: 1}
];

var dummyStrokovnjak = [
    {tk_Vrsta_Uporabnika: 1}
];

async function insertInto(table, obj){
    // The standalone syntax is: knex(»table name«).insert(»object«);
    // The table name is a STRING
    // The object can be either one object, or an array of objects.
    await knex(table).insert(obj)
        .then(()=>console.log("Vstavljen: " + obj + ",v tabelo: " + table))
        .catch((err)=>{console.log(err); throw err;})
};

async function KreirajBazo(){
    await knex.schema.dropTableIfExists("Ocena").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Komentar").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Odgovor").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Vprasanje").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Nasvet").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Vmesni_Postanki").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Vmesne_Lokacije").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Favorites").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Pot").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Konec").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Start").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Postanek").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Lokacija").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Kolo_Ustreza").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Oprema_Ustreza").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Kolo").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Oprema").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Predlog_Oprem").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Predlog_Koles").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Uporabnik").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Vrsta_Uporabnika").catch((err)=>{console.log(err); throw err;});
    await knex.schema.dropTableIfExists("Subscriberji").catch((err)=>{console.log(err); throw err;});

    console.log("Izbrisano bazo");

    await  knex.schema.createTable("Vrsta_Uporabnika", (table) => {
        table.increments("id").unsigned();
        table.string("naziv").notNullable();
    }).then(()=>console.log("Kreiran Vrsta_Uporabnika")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Uporabnik", (table) => {
        table.increments("id").unsigned();
        table.string("ime").notNullable();
        table.string("priimek").notNullable();
        table.string("username").notNullable();
        table.string("email").notNullable();
        table.string("geslo").notNullable();
        table.integer("tk_Vrsta_Uporabnika").unsigned();
        table.foreign("tk_Vrsta_Uporabnika").references("id").inTable("Vrsta_Uporabnika");
    }).then(()=>console.log("Kreiran Uporabnik")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Kolo", (table) => {
        table.increments("id").unsigned();
        table.string("naziv").notNullable();
        table.string("proizvajalec").notNullable();
        table.double("cena").notNullable();
        table.string("img").notNullable();
    }).then(()=>console.log("Kreiran Kolo")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Oprema", (table) => {
        table.increments("id").unsigned();
        table.string("naziv").notNullable();
        table.string("proizvajalec").notNullable();
        table.double("cena").notNullable();
        table.string("img").notNullable();
    }).then(()=>console.log("Kreiran Oprema")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Predlog_Oprem", (table) => {
        table.increments("id").unsigned();
        table.string("tip").notNullable();
    }).then(()=>console.log("Kreiran Predlog_Oprem")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Predlog_Koles", (table) => {
        table.increments("id").unsigned();
        table.string("tip").notNullable();
    }).then(()=>console.log("Kreiran Predlog_Koles")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Kolo_Ustreza", (table) => {
        table.increments("id").unsigned();
        table.integer("tk_Kolo").unsigned();
        table.foreign("tk_Kolo").references("id").inTable("Kolo");
        table.integer("tk_Predlog_Koles").unsigned();
        table.foreign("tk_Predlog_Koles").references("id").inTable("Predlog_Koles");
    }).then(()=>console.log("Kreiran Kolo_Ustreza")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Oprema_Ustreza", (table) => {
        table.increments("id").unsigned();
        table.integer("tk_Kolo").unsigned();
        table.foreign("tk_Kolo").references("id").inTable("Kolo");
        table.integer("tk_Predlog_Oprem").unsigned();
        table.foreign("tk_Predlog_Oprem").references("id").inTable("Predlog_Oprem");
    }).then(()=>console.log("Kreiran Kolo_Ustreza")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Lokacija", (table) => {
        table.increments("id").unsigned();
        table.string("naziv").notNullable();
        table.string("adresa").notNullable();
        table.double("kordX").notNullable();
        table.double("kordY").notNullable();
        table.string("mesto").notNullable();
        table.string("drzava").notNullable();
    }).then(()=>console.log("Kreiran Lokacija")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Start", (table) => {
        table.increments("id").unsigned();
        table.integer("tk_Lokacija").unsigned();
        table.foreign("tk_Lokacija").references("id").inTable("Lokacija");
    }).then(()=>console.log("Kreiran Start")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Konec", (table) => {
        table.increments("id").unsigned();
        table.integer("tk_Lokacija").unsigned();
        table.foreign("tk_Lokacija").references("id").inTable("Lokacija");
    }).then(()=>console.log("Kreiran Konec")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Pot", (table) => {
        table.increments("id").unsigned();
        table.string("status").notNullable();
        table.string("tip").notNullable();
        table.integer("dolzina").notNullable();
        table.integer("ascend").notNullable();
        table.integer("descend").notNullable();
        table.string("naslov").notNullable();
        table.string("opis").notNullable();
        table.integer("nivo_zahtevnosti").notNullable();
        table.integer("tk_Uporabnik").unsigned();
        table.foreign("tk_Uporabnik").references("id").inTable("Uporabnik");
        table.integer("tk_Start").unsigned();
        table.foreign("tk_Start").references("id").inTable("Start");
        table.integer("tk_Konec").unsigned();
        table.foreign("tk_Konec").references("id").inTable("Konec");
    }).then(()=>console.log("Kreiran Pot")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Vmesni_Postanki", (table) => {
        table.increments("id").unsigned();
        table.integer("tk_Lokacija").unsigned();
        table.foreign("tk_Lokacija").references("id").inTable("Lokacija");
        table.integer("tk_Pot").unsigned();
        table.foreign("tk_Pot").references("id").inTable("Pot");
    }).then(()=>console.log("Kreiran Vmesni_Postanki")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Vmesne_Lokacije", (table) => {
        table.increments("id").unsigned();
        table.integer("tk_Lokacija").unsigned();
        table.foreign("tk_Lokacija").references("id").inTable("Lokacija");
        table.integer("tk_Pot").unsigned();
        table.foreign("tk_Pot").references("id").inTable("Pot");
    }).then(()=>console.log("Kreiran Vmesne_Lokacije")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Nasvet", (table) => {
        table.increments("id").unsigned();
        table.string("naslov").notNullable();
        table.string("text").notNullable();
        table.integer("tk_Strokovnjak").unsigned();
        table.foreign("tk_Strokovnjak").references("id").inTable("Uporabnik");
    }).then(()=>console.log("Kreiran Nasvet")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Vprasanje", (table) => {
        table.increments("id").unsigned();
        table.string("text").notNullable();
        table.integer("tk_Uporabnik").unsigned();
        table.foreign("tk_Uporabnik").references("id").inTable("Uporabnik");
    }).then(()=>console.log("Kreiran Vprasanje")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Odgovor", (table) => {
        table.increments("id").unsigned();
        table.string("text").notNullable();
        table.integer("tk_Strokovnjak").unsigned();
        table.foreign("tk_Strokovnjak").references("id").inTable("Uporabnik");
        table.integer("tk_Vprasanje").unsigned();
        table.foreign("tk_Vprasanje").references("id").inTable("Vprasanje");
    }).then(()=>console.log("Kreiran Odgovor")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Komentar", (table) => {
        table.increments("id").unsigned();
        table.string("text").notNullable();
        table.string("status").notNullable();
        table.integer("kolicina").notNullable();
        table.integer("tk_Uporabnik").unsigned();
        table.foreign("tk_Uporabnik").references("id").inTable("Uporabnik");
        table.integer("tk_Pot").unsigned();
        table.foreign("tk_Pot").references("id").inTable("Pot");
    }).then(()=>console.log("Kreiran Komentar")).catch((err)=>{console.log(err); throw err;});

    await  knex.schema.createTable("Favorites", (table) => {
        table.increments("id").unsigned();
        table.integer("tk_Uporabnik").unsigned();
        table.foreign("tk_Uporabnik").references("id").inTable("Uporabnik");
        table.integer("tk_Pot").unsigned();
        table.foreign("tk_Pot").references("id").inTable("Pot");
    }).then(()=>console.log("Kreiran Vmesni_Postanki")).catch((err)=>{console.log(err); throw err;});


    await  knex.schema.createTable("Subscriberji", (table) => {
        table.increments("id").unsigned();
        table.string("email").notNullable();
    }).then(()=>console.log("Kreiran Subscriberji")).catch((err)=>{console.log(err); throw err;});


    console.log("Kreirano bazo");
}

// To use in situations where we want to cut the connection to the base.
async function disconnectBase(){
    knex.destroy();
}

async function getUserByEmail(email){
    try{
        let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
        let user = await new bookshelfUporabnik().where("email", email).fetch();

        return user;
    }
    catch (e) {
        return null;
    }
}

async function getUserByID(id){
    let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
    let user = await new bookshelfUporabnik().where("id", id).fetch();

    return JSON.parse(user);
}

app.listen(3000);
