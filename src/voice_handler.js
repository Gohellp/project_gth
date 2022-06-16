'use strict';
const { EmbedBuilder } = require("@discordjs/builders")

module.exports = {
	async Connected(voice_old, voice_new, project, connection){
		if(voice_old.channelId!==null&&!voice_old.channel.members.size){
			project.channels.cache.get(voice_old.channelId).delete()
				.then(() => {
					connection.query('DELETE FROM voices WHERE own_id=?;', [voice_old.id])
						.catch(err=>console.log(err))
				})
		}

		project.channels.create(`${project.members.cache.find(m=>m.id===voice_new.id).user.username}'s channel`,{
		type:'GUILD_VOICE',
		parent:'897986118954414101',//ID of category
		permissionOverwrites:[
			{
				id: voice_new.id,
				allow: ['MANAGE_CHANNELS','MANAGE_ROLES']
			}
		]
	})
			.then(voice=>{
				voice_new.setChannel(voice)
				connection.query('insert into voices(own_id, voice_id) values ?;',[voice_new.id,voice.id])
					.catch(err=> console.log(err))
			})
	},
	async Disconnected (voice_old, voice_new, project, connection){
		connection.query('select own_id from voices where voice_id =?;', [voice_old.channelId])
			.then(res=>{
				if(!res) return project.logs_channel.send({
					embeds:[
						new EmbedBuilder()
							.setTitle("ERROR")
							.setColor("#FF0000")
							.addField("Error in Disconnected\/connection","I can't get the own_id from db")
					]
				})
				if(res[0].own_id===voice_old.id){
					if(voice_old.channel.members.size){
						let new_owner = voice_old.channel.members.toJSON()[Math.floor(Math.random() * (voice_old.channel.members.size - 1))]
						voice_old.channel.edit({
							name:new_owner.user.username+"'s channel",
							permissionOverwrites: [
								{
									id: new_owner.id,
									allow: ['MANAGE_CHANNELS', 'MANAGE_ROLES']
								}
							]
						})
						connection.query("update voices set own_id=? where own_id=?;",[new_owner.id,voice_old.id])
							.catch(err=>console.log(err))
					}else{
						try {
							voice_old.channel.delete()
								.then(()=>{
									connection.query("delete from voices where own_id=?;", [voice_old.id])
										.catch(err=>console.log(err))
								})
						} catch (e) {
							project.logs_channel.send({
								embeds:[
									new EmbedBuilder()
										.setColor("#ff0000")
										.setTitle("ERROR")
										.addField("Error with deleting channel",e)
								]
							})
						}
						project.channels.cache.get(voice_old.channelId)
					}
				}
			})
			.catch(err=>console.log(err))
	}
}