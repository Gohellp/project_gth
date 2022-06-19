const {Client, Collection, Intents, MessageEmbed} = require("discord.js"),
	{token, db_user, db_pass} = require("./config.json"),
	{Connected, Disconnected} = require("./src/voice_handler"),
	{createConnection} = require("mysql2"),
	{version} = require("./package.json"),
	path = require('node:path'),
	fs = require('node:fs'),
	bot = new Client({
		intents:[
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.DIRECT_MESSAGES,
			Intents.FLAGS.GUILD_VOICE_STATES,
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

async function keep_connection(){
	await project.connection.promise().query('select * from voices;')
		.catch(err=>console.log(err))
		console.log("ok")
}

bot.once("ready", async ()=>{
	setInterval(keep_connection, 5_000)
	project=bot.guilds.cache.get("982797550769827890");
	project.connection = createConnection({
		host:"gohellp.gq",
		user:db_user,
		database:"project_gth",
		password:db_pass,
		bigNumberStrings: true,
		supportBigNumbers: true,
	});
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
		status:"idle"
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
bot.on("interactionCreate", async inter=>   {
	if(inter.isCommand()){
		const cmd = bot.commands.get(inter.commandName);
		if (!cmd) return;
		try {
			await cmd.execute(inter, project.connection);
		} catch (error) {
			console.error(error);
			await inter.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
bot.on("guildMemberAdd", async member=>{
	if (member.user.bot)return;
	await project.connection.promise().execute("select banned,roles from users where user_id = ?;", [member.id])
		.then(async ([data])=>{
			if(data.length===0){
				return project.connection.promise().execute(`insert into users(user_id, roles) values (?,?)`,[member.id,"null"])
					.catch(err=>console.log(err));
			}else{
				if(data[0].banned)return member.kick("Banned");
				if(data[0].roles==="null")return;
				member.roles.add(data[0].roles.split("$"))
			}
		})
		.catch(err=>console.log(err))
});
bot.on("voiceStateUpdate", async (voice_1, voice_2)=>{
	 if(voice_2.channelId==="982798820461125682"){
		await Connected(voice_1,voice_2,project)
	 } else if(voice_1.channelId!=="982798820461125682"&&voice_1.channelId!==null){
		await Disconnected(voice_1,voice_2,project)
	 }
});

bot.login(token);