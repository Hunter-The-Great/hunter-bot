const{Client, GatewayIntentBits}  = require('discord.js')
require('dotenv/config')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.on('ready', () => {
    console.log('yee')
})
//client.channels.cache.get(message.channelId).send('idk man')
client.on('messageCreate', message => {
    if(message.content.toLowerCase == "hello there"){
         client.channels.cache.get(message.channelId).send('General Kenobi')
    }
})

client.login(process.env.TOKEN)

process.on('disconnect', () => {
    client.destroy()
})