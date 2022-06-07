const { SlashCommandBuilder,SlashCommandIntegerOption } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rm')
		.setDescription("Remove messages")
		.addIntegerOption(
			new SlashCommandIntegerOption()
				.setName("number")
				.setDescription("Inter the number between 1 and 100")
				.setRequired(true)
		),
	async execute(interaction){
		let deleteCount = 0;
		try {
			deleteCount = parseInt(interaction.options._hoistedOptions[0].value, 10);
		}catch(err) {
			return interaction.reply({
				content:'Please provide the number of messages to delete. (max 100)',
				ephemeral:true
			});
		}
		if (!deleteCount || deleteCount < 1 || deleteCount > 100)
			return interaction.reply({
				content:'Please provide a number between 1 and 100 for the number of messages to delete',
				ephemeral:true
			});

		interaction.channel.bulkDelete(deleteCount)
			.then(()=> interaction.reply({content:"Success", ephemeral: true}))
			.catch((error) => interaction.reply({
				content:`Couldn't delete messages because of: ${error}`,
				ephemeral:true
			}));
	}
}
