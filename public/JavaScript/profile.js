$(document).ready(function() {
	$('#formpasswordchange').submit(function (e) {
		e.preventDefault();
	});
	$.get("/getuserinfo", (data, status) => {

		if(status === 500){
			console.log("Server error");
		}
		let user = data;

		if(!user.auth){
			location.href = '/login';
		}
		document.getElementById("usernameupdate").value = user.username;
		document.getElementById("imeupdate").value = user.ime;
		document.getElementById("priimekupdate").value = user.priimek;
		document.getElementById("emailupdate").value = user.email;

	});

	$("#updateinfo").click(function () {
		const upusername = document.getElementById("usernameupdate").value;
		const upname = document.getElementById("imeupdate").value;
		const upsurname = document.getElementById("priimekupdate").value;

		const updated = {
			"username" : upusername,
			"ime" : upname,
			"priimek" : upsurname
		}
		console.log(updated);

		$.post("updateuser", updated, (data, status)=>{
			console.log(data)
			if(status === 200){
				console.log("Successfully updated user");
			}else{
				console.log(data);
			}
		});

	});




	$("#changepassword").click(function () {
		const oldpassword = document.getElementById("oldpassword").value;
		const newpassword = document.getElementById("newpassword").value;
		if(newpassword===""){
			alert("New password cannot be blank");
			return;
		}
		const change = {
			"oldpassword" : oldpassword,
			"newpassword" : newpassword
		}
		$.post("changePassword", change, function (data, response){
			// TODO figure out why response is always 'success'
			/*
			if(response === 200){
				console.log("Password changed successfully");

			}else{
				console.log(response);
			}
			*/


			if (data === "403"){
				console.log("Wrong password!");
				document.getElementById("newpassword").value="";
				document.getElementById("oldpassword").value="";
			}else{
				console.log(data);
				location.href = '/login'
			}
		});

	});


});