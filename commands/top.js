const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders"),
	{createConnection} = require("mysql2"),
	{db_user,db_pass} = require("../config.json"),
	connection = createConnection({
		host:"gohellp.gq",
		user:db_user,
		password:db_pass,
		database:"project_gth"
	})

module.exports = {
	data: new SlashCommandBuilder()
		.setName("top")
		.setDescription("User's top 10"),
	async execute(inter){
		let embeds=[]
		connection.query("select user_id,msg_count,level from users order by msg_count limit 10;", (err,res)=>{//Запрос к базе данных, внутри которого всё будет вариться
			if(err)console.log(err)
			res.map((user,i)=>{
				embeds.push(
					new EmbedBuilder()
						.setColor("#9bff00")
						.addField("#"+i+1, `<@${user.user_id}> msg: ${user.msg_count}, lvl: ${user.level}`)
				)
			})
			inter.reply({
				content:"User's top 10",
				embeds:embeds
			})
		})
	}
}