const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
module.exports = {
	data: new SlashCommandBuilder()
		.setName("top")
		.setDescription("User's top 10"),
	async execute(inter){
		let embeds=[]
		await project.connection.promise().query("select user_id,msg_count,level from users order by msg_count limit 10;")//Запрос к базе данных, внутри которого всё будет вариться
			.then(([res])=>{
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
			.catch(err=>console.log(err))
	}
}