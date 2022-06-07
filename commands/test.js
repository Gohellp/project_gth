const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription("Test commands"),
	async execute(interaction){
		return interaction.reply({content:"test", ephemeral: true})
	}
}