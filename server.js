require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const initializePassport = require('./passport-config');
const session = require('express-session');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const {stat} = require("fs");
const {response} = require("express");

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

async function insertInto(table, obj){
	// The standalone syntax is: knex(»table name«).insert(»object«);
	// The table name is a STRING
	// The object can be either one object, or an array of objects.

	await knex(table).insert(obj)
		.then(()=>console.log("Vstavljen: " + obj + ",v tabelo: " + table))
		.catch((err)=>{console.log(err); throw err;})
}

initializePassport(
	passport,
	async email=>{
		try{
			let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
			return await new bookshelfUporabnik().where("email", email).fetch().then((data)=>{
				return data.attributes;
			});
		}
		catch (e) {
			console.log(e);
			return null;
		}},
	async id=>{
		try{
			let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
			return await new bookshelfUporabnik().where("id", id).fetch().then((data)=>{
				return data.attributes;
			});
		}
		catch (e) {
			return null;
		}});

app.use(session({
	secret : process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('__method'));
app.use(bodyParser.urlencoded({extended: true}));


app.use(express.static(path.join('public')));
app.use(express.json());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get("/", (req, res) =>{
	if (req.isAuthenticated()){
		console.log(req.user.username);
	}
	res.sendFile("HTML/index.html", {root : "public"});
});

app.get("/svetovalnica", (req, res) => {
	res.sendFile("HTML/forum.html", {root : "public"});
});

app.get("/administrators", (req, res) => {
	if(req.isAuthenticated()){
		if(req.user.tk_Vrsta_Uporabnika === 3){
			res.sendFile("HTML/administrators.html", {root : "public"});
		}else{
			res.sendFile("HTML/login.html", {root : "public"});
		}

	}else{
		res.sendFile("HTML/login.html", {root : "public"});
	}

});

app.get("/database", (req, res) =>{
	res.sendFile("HTML/testing-base.html", {root : "public"});
});

app.get("/login",checkNotAuthenticated, (req, res) =>{
	res.sendFile("HTML/login.html", {root : "public"});
});
app.get("/register", (req, res) =>{
	if(req.isAuthenticated()){
		res.sendFile("HTML/index.html", {root : "public"});
	}else {
		res.sendFile("HTML/register.html", {root: "public"});
	}}
	);

app.get("/profile", checkAuthenticated, (req, res)=>{
	if(req.isAuthenticated()){
		res.sendFile("HTML/userprofile.html", {root : "public"});
		}
	else{
		res.sendFile("HTML/login.html", {root : "public"});
	}
});

app.get("/about", (req, res)=>{
	res.sendFile("HTML/aboutus.html", {root : "public"})
});

app.get("/questions", (req, res)=>{
	res.sendFile("HTML/questions.html", {root : "public"})
});

app.get("/createTrails", (req, res)=>{
	res.sendFile("HTML/createTrails.html", {root : "public"})
});
app.get("/ocene", (req, res)=>{
	res.sendFile("HTML/testingOcene.html", {root : "public"})
});
app.get("/searchtrails", (req, res)=>{
	res.sendFile("HTML/searchTrails.html", {root : "public"})
});

app.post("/register", checkNotAuthenticated ,async(req, res) => {
	try {

		console.log(req.body);
		const username = req.body.userreg;
		const email = req.body.emailreg;
		const hashedPassword = await bcrypt.hash(req.body.gesloreg, 10);
		const priimek = req.body.priireg;
		const ime = req.body.imereg;
		let insertUporabnik = [
			{ime: ime, priimek: priimek, username: username, email: email, geslo: hashedPassword, tk_Vrsta_Uporabnika: 1}
		];
		await insertInto("uporabnik", insertUporabnik);
		res.status(200).send("Successfully signed up")
	} catch(err) {
		res.status(500).send(err);
	}
});

app.get("/getuserinfo", (req, res)=>{
	try{
		if (!req.isAuthenticated()){

			res.status(200).json({"auth":false});
		}
		let data = {
			"auth" : true,
			"username" : req.user.username,
			"ime" : req.user.ime,
			"email" : req.user.email,
			"priimek" : req.user.priimek
		}
		res.status(200).json(data);
	}catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

app.post("/updateuser", async(req, res)=>{
	try{
		let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
		console.log(req.user);
		console.log(req.body);
		await new bookshelfUporabnik().where("id", req.user.id).save({username: req.body.username, ime: req.body.ime, priimek: req.body.priimek}, {patch: true});
		res.status(200).send("Successfully updated your profile");
	}

	catch (err){
		console.log(err);
		res.json(err);
	}
});

app.get("/objave", async(req, res)=>{

	try{
		let bookshelfNasvet = await createBookshelfOf("Nasvet");
		let nasvet = await new bookshelfNasvet ().fetchAll();

		res.status(200).json(nasvet.toJSON());
	}catch(err){
		console.log("Error in objave:\n" + err);
		res.status(500).send();
	}

});

app.get("/vprasanja", async(req, res)=>{

	try{
		let bookshelfVprasanje = await createBookshelfOf("Vprasanje");
		let vprasanja = await new bookshelfVprasanje().fetchAll();

		res.status(200).json(vprasanja.toJSON());
	}catch(err){
		console.log("Error in vprasanja:\n" + err);
		res.status(500).send();
	}

});

app.get("/avtor/:id", async(req, res)=>{

	try{
		let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
		let uporabnik = await new bookshelfUporabnik().where("id", req.params.id).fetch();

		res.status(200).json(uporabnik.toJSON());
	}catch(err){
		console.log("Error in avtorOdgovora:\n" + err);
		res.status(500).send();
	}

});


app.get("/odgovori", async(req, res)=>{

	try{
		let bookshelfOdgovor = await createBookshelfOf("Odgovor");
		let odgovori = await new bookshelfOdgovor().fetchAll();

		res.status(200).json(odgovori.toJSON());
	}catch(err){
		console.log("Error in get/odgovori:\n" + err);
		res.status(500).send();
	}

});

app.get("/poti", async(req, res)=>{

	try{
		let bookshelfPot = await createBookshelfOf("Pot");
		let bookshelfKomentar = await createBookshelfOf("Komentar");
		let resPoti = [];
			await new bookshelfPot().where({status: "PREGLEDAN"}).fetchAll().then(async(fPoti)=>{
				fPoti = fPoti.toJSON();
				for(let i in fPoti){
						await new bookshelfKomentar().where({tk_Pot : fPoti[i].id}).fetchAll().then((komentar)=>{
							komentar = komentar.toJSON();
							let avg = 0;
							let t = 0;
							for (let k in komentar){
								t += 1
								avg += komentar[k].kolicina
							}
							if(t > 0){
								avg = avg/t
							}
							else{
								avg = 0;
							}
							console.log("Average: " + avg);
							fPoti[i].avg = avg;

							resPoti.push(fPoti[i]);
						})
					}
			});
		resPoti.sort((a, b) => {
			return b.avg - a.avg;
		});
		console.log(resPoti)
		res.status(200).json(resPoti);
	}catch(err){
		console.log("Error in poti:\n" +err);
		res.status(500).send();
	}

});

app.get("/filtriraj", async(req, res)=>{
	try{
		let dolzina = req.query.dolzina;
		let tip = req.query.tip.split(",");
		let tezavost = req.query.tez;
		console.log("Looking for dolzina: " + dolzina + " tip: " + tip + " tezavost: " + tezavost);
		let bookshelfPot = await createBookshelfOf("Pot");
		let bookshelfKomentar = await createBookshelfOf("Komentar");
		let resPoti = [];
		for(let t in tip){
			console.log(tip[t])
			await new bookshelfPot().where({tip: tip[t], nivo_zahtevnosti: tezavost}).fetchAll().then(async(fPoti)=>{
				fPoti = fPoti.toJSON();
				for(let i in fPoti){
					if(fPoti[i].dolzina < dolzina){
						await new bookshelfKomentar().where({tk_Pot : fPoti[i].id}).fetchAll().then((komentar)=>{
							komentar = komentar.toJSON();
							let avg = 0;
							let t = 0;
							for (let k in komentar){
								t += 1
								avg += komentar[k].kolicina
							}
							if(t > 0){
								avg = avg/t
							}
							else{
								avg = 0;
							}
							console.log("Average: " + avg);
							fPoti[i].avg = avg;

							resPoti.push(fPoti[i]);
						})
					}
				}
			});
		}
		resPoti.sort((a, b) => {
			return b.avg - a.avg;
		});
		console.log(resPoti)
		res.status(200).json(resPoti);
	}catch(err){
		console.log("Error in filtriraj:\n" + err);
		res.status(500).send();
	}

});

app.get("/favorites", checkAuthenticated ,async(req, res)=>{
	try{
		let bookshelfPot = await createBookshelfOf("Pot");
		let bookshelfFavorites = await createBookshelfOf("Favorites");
		let bookshelfKomentar = await createBookshelfOf("Komentar");
		let resPoti = [];
		await new bookshelfFavorites().where({tk_Uporabnik: req.user.id}).fetchAll().then(async (favs)=>{
			favs = favs.toJSON();
			for(let t in favs){
				console.log(favs[t])
				await new bookshelfPot().where({id: favs[t].tk_Pot}).fetchAll().then(async (fPoti)=>{
					fPoti = fPoti.toJSON();
					for(let i in fPoti){
						await new bookshelfKomentar().where({tk_Pot : fPoti[i].id}).fetchAll().then((komentar)=>{
							komentar = komentar.toJSON();
							let avg = 0;
							let t = 0;
							for (let k in komentar){
								t += 1
								avg += komentar[k].kolicina
							}
							if(t > 0){
								avg = avg/t
							}
							else{
								avg = 0;
							}
							console.log("Average: " + avg);
							fPoti[i].avg = avg;

							resPoti.push(fPoti[i]);
						})
					}
				});
			}
		});
		resPoti.sort((a, b) => {
			return b.avg - a.avg;
		});
		console.log(resPoti)
		res.status(200).json(resPoti);
	}catch(err){
		console.log("Error in favorites:\n" + err);
		res.status(500).send();
	}

});

app.get("/checkFavorite/:id", async(req, res) =>{
	try{
		let bookshelfFavorites = await createBookshelfOf("Favorites");
		console.log("Checking favorites for: " + req.user.id + "   path: " + req.params.id)
		await new bookshelfFavorites().where({tk_Uporabnik : req.user.id, tk_Pot: req.params.id}).fetch().then((fav)=>{
			console.log("It is a favorite");
			res.status(200).json(true);
		})
	}
	catch (error){
		console.log("It is NOT a favorite");
		res.status(200).json(false);

	}
});

app.get("/selektirajPot/:id", async(req, res)=>{
	try{
		let bookshelfPot = await createBookshelfOf("Pot");
		let sPot = await new bookshelfPot().where("id", req.params.id).fetch();

		res.status(200).json(sPot.toJSON());
	}catch(err){
		console.log("Error in selektirajPot:\n" + err);
		res.status(500).send();
	}

});
app.get("/selektirajStart/:id", async(req, res)=>{
	try{
		let bookshelfLokacija = await createBookshelfOf("Lokacija");
		let bookshelfStart = await createBookshelfOf("Start");
		let sStart = await new bookshelfStart().where("id", req.params.id).fetch();
		console.log(sStart);
		let sLok = await new bookshelfLokacija().where("id", sStart.attributes.tk_Lokacija).fetch();

		res.status(200).json(sLok.toJSON());
	}catch(err){
		console.log("Error in selektirajLok:\n" + err);
		res.status(500).send();
	}

});
app.get("/selektirajKonec/:id", async(req, res)=> {
	try {
		let bookshelfLokacija = await createBookshelfOf("Lokacija");
		let bookshelfKonec = await createBookshelfOf("Konec");
		let sKonec = await new bookshelfKonec().where("id", req.params.id).fetch();
		console.log(sKonec);
		let sLok = await new bookshelfLokacija().where("id", sKonec.attributes.tk_Lokacija).fetch();
		res.status(200).json(sLok.toJSON());
	} catch (err) {
		console.log("Error:" + err);
		res.status(500).send();
	}
});

app.get("/selektirajVmesne/:id", async(req, res)=> {
	try {
		let bookshelfVmesne = await createBookshelfOf("Vmesne_Lokacije");
		await new bookshelfVmesne().where("tk_Pot", req.params.id).fetchAll().then((lok)=>{
			res.status(200).json(lok.toJSON());
		});
	} catch (err) {
		console.log("Error:" + err);
		res.status(500).send();
	}
});
app.get("/getVmesna/:id", async(req, res)=> {
	try {
		let bookshelfLokacija = await createBookshelfOf("Lokacija");
		await new bookshelfLokacija().where("id", req.params.id).fetch().then((lok)=>{
			res.status(200).json(lok.toJSON());
		});
	} catch (err) {
		console.log("Error:" + err);
		res.status(500).send();
	}
});
app.get("/selektirajPostanke/:id", async(req, res)=> {
	try {
		let bookshelfVmesne = await createBookshelfOf("Vmesni_Postanki");
		await new bookshelfVmesne().where("tk_Pot", req.params.id).fetchAll().then((lok)=>{
			res.status(200).json(lok.toJSON());
		});
	} catch (err) {
		console.log("Error:" + err);
		res.status(500).send();
	}
});
app.get("/getPostanka/:id", async(req, res)=> {
	try {
		let bookshelfLokacija = await createBookshelfOf("Lokacija");
		await new bookshelfLokacija().where("id", req.params.id).fetch().then((lok)=>{
			res.status(200).json(lok.toJSON());
		});
	} catch (err) {
		console.log("Error:" + err);
		res.status(500).send();
	}
});
app.post("/dodajpot", checkAuthenticated, async(req, res)=>{
	// TODO add author to database
	// Might be done, maybe
	const author = req.user.id;

	console.log("Dodajanje pot");
	const naslov = req.body.name;
	const OriginLat= req.body.latOrigin;
	const OriginLong=req.body.lngOrigin;
	const nameOrigin = req.body.nameOrigin;
	const DestinationLat= req.body.latDest;
	const DestinationLong=req.body.lngDest;
	const nameDest = req.body.nameDest;
	const tezavnost = req.body.tezavnost;
	const length = req.body.length;
	const surface = req.body.surface;
	const opis = req.body.description;
	const vmesniLok = req.body.vmesniLok;
	const vmesniPos = req.body.vmesniPos;

	console.log(vmesniPos);

	try {
		let novLok = {naziv: nameOrigin, adresa: "", kordX: OriginLong, kordY: OriginLat, mesto: "", drzava: ""};
		await insertInto("Lokacija", novLok);

		let novStart;
		let novKonec;

		let bookshelfLokacija = await createBookshelfOf("Lokacija");
		await new bookshelfLokacija().where(novLok).fetch().then(async (lok)=>{
			lok = lok.toJSON();
			console.log(lok);
			await insertInto("Start", {tk_Lokacija: lok.id});
			let bookshelfStart = await createBookshelfOf("Start");
			novStart = await new bookshelfStart().where("tk_Lokacija", lok.id).fetch();
		});

		novLok = {naziv: nameDest, adresa: "", kordX: DestinationLong, kordY: DestinationLat, mesto: "", drzava: ""};
		await insertInto("Lokacija", novLok);
		await new bookshelfLokacija().where(novLok).fetch().then(async (lok)=>{
			lok = lok.toJSON();
			await insertInto("Konec", {tk_Lokacija: lok.id});
			let bookshelfKonec = await createBookshelfOf("Konec");
			novKonec = await new bookshelfKonec().where("tk_Lokacija", lok.id).fetch();
		});


		let novPot = {
			status: "NEPREGLEDAN",
			tip: surface,
			dolzina: length,
			naslov: naslov,
			opis: opis,
			nivo_zahtevnosti: tezavnost,
			tk_Uporabnik: author,
			tk_Start: novStart.id,
			tk_Konec: novKonec.id
		}

		console.log(novPot);

		await insertInto("Pot", novPot);
		let bookshelfPot = await createBookshelfOf("Pot");

		await new bookshelfPot().where(novPot).fetch().then(async (pot)=>{
			console.log("Najden pot")
			for (let i in vmesniLok){
				let novLok = {naziv: vmesniLok[i].name, adresa: "", kordX: vmesniLok[i].lng, kordY: vmesniLok[i].lat, mesto: "", drzava: ""};
				await insertInto("Lokacija", novLok);
				await new bookshelfLokacija().where(novLok).fetch().then(async (lok)=>{
					lok = lok.toJSON();
					console.log(lok);
					await insertInto("Vmesne_Lokacije", {tk_Pot: pot.id, tk_Lokacija: lok.id});
					console.log("Dodane Vmesne_Lokacije");
				});
			}
		});

		await new bookshelfPot().where(novPot).fetch().then(async (pot)=>{
			console.log("Najden pot")
			for (let i in vmesniPos){
				let novLok = {naziv: vmesniPos[i].name, adresa: "", kordX: vmesniPos[i].lng, kordY: vmesniPos[i].lat, mesto: "", drzava: ""};
				await insertInto("Lokacija", novLok);
				await new bookshelfLokacija().where(novLok).fetch().then(async (lok)=>{
					lok = lok.toJSON();
					console.log(lok);
					await insertInto("Vmesni_Postanki", {tk_Pot: pot.id, tk_Lokacija: lok.id});
					console.log("Dodani Vmesni_Postanki");
				});
			}
		});

		res.status(200).send("Success");
	}
	catch(err){
		console.log("Error in addPot:\n" + err);
		res.status(500).send();
	}
});

app.post("/dodajNasvet" , async(req, res)=>{

	if(!(req.isAuthenticated())){
		res.redirect("/login");

	}

	try {
		console.log(req.body);
		// TODO Implement id in database
		const idUser = req.user.id;
		const nas = req.body.naslov;
		const opis = req.body.opis;

		let nov = {naslov: nas, text: opis, tk_Strokovnjak: idUser};

		await insertInto("Nasvet", nov);

		console.log(nov);

		res.status(200).send("Success");
	}catch (e) {
		console.log("Error in dodajNasvet:\n" + e);
		res.status(500).send();
	}
});

app.post("/dodajVprasanje", checkAuthenticated, async (req, res)=>{


	try {
		const opis = req.body.opis;
		let nov = {text: opis, tk_Uporabnik: req.user.id};
		console.log(nov);
		await insertInto("Vprasanje", nov);
		res.status(200).send("Success");
	}
	catch (e) {
		console.log("Error in dodajVprasanje:\n" + e);
		res.status(500).send("Error writing to database");
	}
});




app.post("/dodajOdgovor" ,async(req, res)=>{
	try{
		if (!(req.isAuthenticated())){
			res.status(200).send("401")
		}

		if (req.user.tk_Vrsta_Uporabnika === 1){
			res.status(200).send("403");
			return;
		}

		const odg = req.body.text;
		const vpr = req.body.tk_Vprasanje;

		let nov = {text: odg, tk_Strokovnjak: req.user.id, tk_Vprasanje: vpr};
		console.log(nov);
		await insertInto("Odgovor", nov);

		res.status(200).send("What in the actual fuck");
	}catch (e){
		console.log(e);
		res.status(500).send();
	}
});

app.post("/dodajSub", checkAuthenticated, async(req, res)=>{

	console.log(req.body);

	const email = req.body.email;

	let nov = {email: email};
	console.log(nov);
	await insertInto("Subscriberji", nov);

	res.status(200).send("Success");
});

app.get('/usertype', (req, res)=>{
	let usertype = "0";
	if(req.isAuthenticated()){
		usertype = req.user.tk_Vrsta_Uporabnika.toString();
	}
	res.status(200).send(usertype);
})

app.post("/dodajKomentar", checkAuthenticated, async(req, res)=>{

	console.log(req.body);

	const txt = req.body.txt;
	const pot = req.body.pot;
	const kol = req.body.kol;

	let nov = {text: txt,status: "PREGLEDAN", kolicina: kol, tk_Uporabnik: req.user.id, tk_Pot: pot};
	console.log(nov);
	await insertInto("Komentar", nov);

	res.status(200).send("Success");
});
app.post("/dodajFavorite", checkAuthenticated, async(req, res)=>{

	console.log(req.body);

	const pot = req.body.pot;

	let nov = {tk_Uporabnik: req.user.id, tk_Pot: pot};
	console.log(nov);
	await insertInto("Favorites", nov);

	res.status(200).send("Success");
});

app.post('/login', passport.authenticate('local', {
		successRedirect : '/',
		failureRedirect  : '/login'
	}
	)
);

app.delete('/logout', checkAuthenticated, (req, res) => {
	req.logOut();
	res.redirect('/login');
});

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.sendFile('HTML/login.html', {root: "public"});
}

function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}

	next();
}


// Function to create bookshelf models out of a table name
// Just insert the table's name as a astring in the parameter
// Ex. let newModel = createBookshelfOf("Uporabnik");
async function createBookshelfOf(tbl){
	let newBookshelf = bookshelf.Model.extend({
		tableName: tbl,
		idAttribute: "id"
	});

	return newBookshelf;
}


// Currently, it deletes by ID, and is not fully functioning.
app.post("/deletePot", async (req, res)=>{
	let bookshelfPot = await createBookshelfOf("Pot");
	let bookshelfStart = await createBookshelfOf("Start");
	let bookshelfKonec = await createBookshelfOf("Konec");
	let bookshelfLokacija = await createBookshelfOf("Lokacija");
	let bookshelfKomentar = await createBookshelfOf("Komentar");
	let bookshelfOcena = await createBookshelfOf("Ocena");
	let bookshelfPostanki = await createBookshelfOf("Vmesni_Postanki");
	let bookshelfVmesne = await createBookshelfOf("Vmesne_Lokacije");

	console.log("Deleting pot: " + req.body.id);

	let deleteIdPot = req.body.id;
	let deleteIdStart = 0;
	let deleteIdKonec = 0;
	let deleteIdLocStart = 0;
	let deleteIdLocKonec = 0;
	await new bookshelfPot().where("id", deleteIdPot).fetch().then(async(pot)=>{
		deleteIdStart = pot.attributes.tk_Start;
		deleteIdKonec = pot.attributes.tk_Konec;

		await new bookshelfStart().where("id", deleteIdStart).fetch().then((start)=>{
			deleteIdLocStart = start.attributes.tk_Lokacija;
			return;
		});
		await new bookshelfKonec().where("id", deleteIdKonec).fetch().then((konec)=>{
			deleteIdLocKonec = konec.attributes.tk_Lokacija;
			return;
		});


		await new bookshelfOcena().where("tk_Pot", deleteIdPot).destroy().catch((err)=>{
			console.log("Error" + err)
		});
		console.log("Deleted Ocena");
		await new bookshelfKomentar().where("tk_Pot", deleteIdPot).destroy().catch(async (err)=> {
			console.log("Error" + err);
		});
		console.log("Deleted Komentar");
		await new bookshelfPostanki().where("tk_Pot", deleteIdPot).destroy().catch(async (err)=> {
			console.log("Error" + err);
		});
		console.log("Deleted Vmesni_Postanki");
		await new bookshelfVmesne().where("tk_Pot", deleteIdPot).destroy().catch(async (err)=> {
			console.log("Error" + err);
		});
		console.log("Deleted Vmesne_Lokacije");

		await new bookshelfPot({id: deleteIdPot}).destroy().then(async()=>{
			await new bookshelfStart({id: deleteIdStart}).destroy().then(async()=>{
				await new bookshelfLokacija({id: deleteIdLocStart}).destroy();
				console.log("Deleted LokS");
				console.log("Deleted Start");
			});

			await new bookshelfKonec({id: deleteIdKonec}).destroy().then(async()=>{
				await new bookshelfLokacija({id: deleteIdLocKonec}).destroy();
				console.log("Deleted LokK");
				console.log("Deleted Konec");
			});
		});
		console.log("Deleted Pot");

		console.log("Uspesno izbrisan Pot");
		res.status(200).send("Success");
	}).catch((err)=>{console.log("Error pri brisanju:" + err)});
});

app.post("/acceptPot", async (req, res) => {
	try{
		console.log("We accepting.");
		console.log(req.body.id);
		let bookshelfPot = await createBookshelfOf("Pot");
		await new bookshelfPot().where({id: req.body.id}).save({status: "PREGLEDAN"}, {method: 'update', patch: true});
		res.status(200).send("Success");
	}
	catch (err){
		console.log("Error pri /acceptPot. " + err);
		res.json(err);
	}
});

app.post("/reportKomentar", async (req, res) => {
	try{
		console.log("We reporting.");
		console.log(req.body.id);
		let bookshelfKomentar = await createBookshelfOf("Komentar");
		await new bookshelfKomentar().where({id: req.body.id}).save({status: "NEPREGLEDAN"}, {method: 'update', patch: true});
		res.status(200).send("Success");
	}
	catch (err){
		console.log("Error pri /acceptPot. " + err);
		res.json(err);
	}
});

// Part that accepts and deletes comments (deleting comments doesnt work)

app.post("/deleteKomentar", async (req, res)=>{
	let bookshelfKomentar = await createBookshelfOf("Komentar");
	console.log(req.body.id);
	await new bookshelfKomentar().where({id: req.body.id}).destroy();
	res.status(200).send("Success");
});

app.post("/deleteFavorite", async (req, res)=>{
	let bookshelfFavorite = await createBookshelfOf("Favorites");
	console.log(req.body.pot);
	await new bookshelfFavorite().where({tk_Uporabnik: req.user.id,tk_Pot: req.body.pot}).destroy();
	res.status(200).send("Success");
});


app.post("/acceptKomentar", async (req, res) => {
	try{
		console.log("We accepting.");
		console.log(req.body.id);
		let bookshelfKomentar = await createBookshelfOf("Komentar");
		await new bookshelfKomentar().where({id: req.body.id}).save({status: "PREGLEDAN"}, {method: 'update', patch: true});
		res.status(200).send("Success");
	}
	catch (err){
		console.log("Error pri /acceptPot. " + err);
		res.json(err);
	}
});

// This is meant to get all information from Pot and Komentar.
// Function does not do anything at the moment.
app.get("/getnepregledan", async(req, res) =>{
	try{
		let bookshelfPot = await createBookshelfOf("Pot");
			await new bookshelfPot().where({status: "NEPREGLEDAN"}).fetchAll().then(async(fPoti)=>{
				res.status(200).json(fPoti.toJSON());
			});
	}
	catch (error){
		console.log(error);
		res.status(500).json(error);
	}
});
app.get("/getnepregledanKomentar", async(req, res) =>{
	try{
		let bookshelfKomentar = await createBookshelfOf("Komentar");
		let komentarji = await new bookshelfKomentar().where("status", "NEPREGLEDAN").fetchAll().then((komentarji)=>{
			console.log(komentarji);
			res.status(200).json(komentarji.toJSON());
		});
	}
	catch (error){
		console.log(error);
		res.status(500).json(error);
	}
});

app.get("/komentarji/:id", async(req, res) =>{
	try{
		let bookshelfKomentar = await createBookshelfOf("Komentar");
		await new bookshelfKomentar().where("tk_Pot", req.params.id).fetchAll().then((komentar)=>{
			console.log(komentar);
			res.status(200).json(komentar.toJSON());
		});
	}
	catch (error){
		console.log(error);
		res.status(500).json(error);
	}
});

app.get("/predlogKoles/:tip", async(req, res) =>{
	try{
		let bookshelfPredlog = await createBookshelfOf("Predlog_Koles");
		await new bookshelfPredlog().where("tip", req.params.tip).fetchAll().then(async(predlozi)=>{
			console.log(predlozi);
			let bookshelfUstreza = await createBookshelfOf("Kolo_Ustreza");
			res.status(200).json(predlozi.toJSON());
		});
	}
	catch (error){
		console.log(error);
		res.status(500).json(error);
	}
});

// Checks to see whether the user exists, according to req.body.email
app.post("/checkUser", async (req, res) => {
	try{
		let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
		let email = req.body.email;
		let checkUser = await new bookshelfUporabnik().where("email", email).fetch();

		res.redirect("/database");
	}
	catch (err){
		console.log("User doesn't exist");
		res.json(err);
	}
});

app.post("/changePassword", checkAuthenticated, async (req, res, next) => {
	try{

		let bookshelfUporabnik = await createBookshelfOf("Uporabnik");
		let hashed = await bcrypt.hash(req.body.newpassword, 10);


		await bcrypt.compare(req.body.oldpassword, req.user.geslo, async(err, result)=>{

			if(!result){
				console.log("Wrong password");
				res.status(200).send("403");
			}if(result){
				await new bookshelfUporabnik().where("id", req.user.id).save({geslo: hashed}, {method: "update", patch: true});

				req.logOut(function(err) {
					if (err) { return next(err); }
					}
				);

				//res.status(200).send("Successfully changed password");

			}
		});


		process.on('unhandledRejection', (reason, promise) => {
			console.log('reason is', reason);
			console.log('promise is', promise);
			res.status(200);
		});
	}
	catch (err){
		res.json(err);
	}
});

app.post("/getmehash", async(req, res)=>{
	let password = await bcrypt.hash(req.body.pass, 10);
	res.status(200).send(password);
});


app.listen(3000);