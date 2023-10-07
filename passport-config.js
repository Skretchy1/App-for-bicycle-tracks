const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {

	console.log("Passport initialized");

	const authenticateUser = async (email, password, done) => {
		const user = await getUserByEmail(email);

		if (user == null) {
			console.log("No user with that email");
			return done(null, false, { message: 'No user with that email' });

		}

		try {
			await bcrypt.compare(password, user.geslo, (err, result)=>{
				if (!result){
					console.log("Password incorrect");
					return done(null, false, { message: 'Password incorrect' });
				}
				if(result){
					console.log("User logged in successfully: " + user.username);
					return done(null, user);
				}
			});
		} catch (e) {
			console.log(e);
			return done(e)
		}
	}



	passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
	passport.serializeUser((user, done) => done(null, user.id));
	passport.deserializeUser(async(id, done) => {
		return done(null, await getUserById(id));
	})
}


module.exports = initialize
