require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./mock.db", sqlite3.OPEN_READWRITE, (err) =>{
	if(err){
		console.log(err);
	}else{
		console.log("Connection successful")
	}
});
app.use(express.static(path.join('public')));
app.use(express.json());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


app.post("/login", (req, res) => {

	// TODO authentication

	const username = req.body.username;
	const user = { name : username }

	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
	res.json({ accessToken : accessToken})

});

function authenticateToken(req, res, next){
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (token === null){
		return res.sendStatus(401);
	}
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=> {
		if(err){
			return res.sendStatus(403);
		}
		req.user = user;
		next();
	})
}

app.post("/register", (req, res) => {

});


app.listen(4000);

