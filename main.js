const {Client, Collection, Intents, MessageEmbed, WebhookClient} = require("discord.js"),
	{version} = require("./package.json"),
	{token} = require("./config.json"),
	path = require('node:path'),
	fs = require('node:fs'),
	bot = new Client({
		intents:[
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.DIRECT_MESSAGES,
			Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
		]
	}),
	commandsPath = path.join(__dirname, 'commands'),
	commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
bot.commands = new Collection();

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	bot.commands.set(command.data.name, command);
}

let project,
	logs_channel;

bot.once("ready", ()=>{
	project=bot.guilds.cache.get("982797550769827890");
	console.log(`${bot.user.username} successfully started`);
	logs_channel=project.channels.cache.get("982950799791497256")
	if(process.argv.length<3){
		logs_channel.send({
			embeds: [
				new MessageEmbed()
					.setColor("#00ff00")
					.setTitle("Main event: Ready")
			]
		})
	}
	bot.user.setPresence({
		activities:[
			{
				name:`version `+version,
				type:"PLAYING"
			}
		],
		status:"idle"
	});
});
bot.on("interactionCreate", async inter=>{
	if(inter.isCommand()){
		const cmd = bot.commands.get(inter.commandName);
		if (!cmd) return;
		try {
			await cmd.execute(inter);
		} catch (error) {
			console.error(error);
			await inter.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
})
bot.on("guildMemberAdd", (member)=>{

})

bot.login(token);