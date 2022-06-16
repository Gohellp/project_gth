const {createConnection} = require('mysql2'),
	{db_user,db_pass} = require('../config.json'),
	connection= createConnection({
		host:"gohellp.gq",
		user:db_user,
		database:"project_gth",
		password:db_pass
	})

module.exports = {
	//name:"play",
	execute(msg){
		let args = msg.content.split(" ").slice(1);
		if(!args)connection.query("select url, consumer from songs where playing <=0;")
			.then(data=>{

			})
	}
}