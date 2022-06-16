const {Client, Collection, Intents, MessageEmbed} = require("discord.js"),
	{token, db_user, db_pass} = require("./config.json"),
	{Connected, Disconnected} = require("./src/voice_handler"),
	{createConnection} = require("mysql2"),
	{version} = require("./package.json"),
	connection = createConnection({
		host:"gohellp.gq",
		user:db_user,
		database:"project_gth",
		password:db_pass
	}),
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
	msg_commands_path = path.join(__dirname, 'msg_commands'),
	commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')),
	msg_commands_files = fs.readdirSync(msg_commands_path).filter(file => file.endsWith('.js'));
bot.commands = new Collection();
bot.msg_commands = new Collection();

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	bot.commands.set(command.data.name, command);
}
for(const file of msg_commands_files){
	const file_path = path.join(msg_commands_path, file);
	const msg_command = require(file_path);
	bot.msg_commands.set(msg_command.name, msg_command)
}

let project;

bot.once("ready", ()=>{
	project=bot.guilds.cache.get("982797550769827890");
	console.log(`${bot.user.username} successfully started`);
	project.logs_channel=project.channels.cache.get("982950799791497256")
	if(process.argv.length<3){
		project.logs_channel.send({
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
		status:"dnd"
	});
});
bot.on("messageCreate", async msg=>{
	if(msg.author.bot)return;
	if(msg.content.startsWith("!")){
		debugger
		const cmd = bot.msg_commands.get(msg.content.split(" ")[0].slice(1));
		if(!cmd) return;
		try{
			await cmd.execute(msg)
		}catch (error) {
			console.log(error)
			await msg.reply({content:"There was an error while executing this command!", ephemeral: true })
		}
	}
})
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
});
bot.on("guildMemberAdd", member=>{
	if (member.user.bot)return;
	connection.query("select banned,roles from users where user_id = ?;", [member.id])
		.then(data=>{
			if(data.length===0){
				return connection.query("insert into users(user_id, roles) values ?",[member.id,null])
					.catch(err=>console.log(err));
			}else{
				data=data[0]
				if(data.banned)return member.kick("Banned");
				member.roles.add(data.roles.split("$"))
			}
		})
});
bot.on("voiceStateUpdate", async (voice_1, voice_2)=>{
	 if(voice_2.channelId==="982798820461125682"){
		await Connected(voice_1,voice_2,project,connection)
	 } else if(voice_2.channelId!==voice_1.channelId&&voice_1.channelId!==null){
		await Disconnected(voice_1,voice_2,project,connection)
	 }
});

bot.login(token);