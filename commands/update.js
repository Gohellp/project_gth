const { SlashCommandBuilder } = require("@discordjs/builders"),
	{ exec } = require("child_process")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("update")
		.setDescription("Update bot's code to latest versions"),
	async execute (inter){
		exec("git pull")

		return inter.reply({
			content:"Success",
			ephemeral:true
		})
	}
}