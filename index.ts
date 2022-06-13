'use strict'
import {Message, TextChannel} from "discord.js";
const ranges = require('./ranges.json')

const dotenv = require('dotenv')
const sorted = require('./sorted_collection.json')
const Discord = require('discord.js')

dotenv.config()

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]})

client.login(process.env.DISCORD_TOKEN);

const TOTAL_NFTS = sorted.length
const PREFIX = process.env.PREFIX || "!"
const COMMAND = process.env.COMMAND || "rarity"
const COLLECTION_NAME = process.env.COLLECTION_NAME || "noname"
const SERVER_ID = process.env.SERVER_ID || ""
const ALLOWED_CHANNELS = JSON.parse(process.env.ALLOWED_CHANNELS || "[]")
const ALLOW_ALL_CHANNELS = process.env.ALLOW_ALL_CHANNELS || true

client.once('ready', () => {
    console.log("Bot online")
})

client.on("messageCreate", (message: Message) => {
    if(!ALLOW_ALL_CHANNELS) {
        if(message?.guild?.id !== SERVER_ID || !ALLOWED_CHANNELS.includes(message.channelId)) return
    }
    if(!message?.content?.startsWith(PREFIX) || message.author.bot) return

    const args = message.content.slice(PREFIX.length).split(/ +/)
    const command = args.shift()
    if(command === COMMAND) {
        const index = getIndex(`${COLLECTION_NAME} ${args[0]}`)
        if(index < 0) {
            if(parseInt(args[0].substring(1)) > (TOTAL_NFTS)) {
                //@ts-ignore
                (message.channel).send(`There are only ${TOTAL_NFTS} NFTs in the collection.`)
                return
            }
            //@ts-ignore
            (message.channel).send(`Invalid format. Example - "${PREFIX}${COMMAND} #123"`)
        } else {
            let item = sorted[index]
            let rank = "COMMON"
            for(let range of ranges) {
                if(between(index, range.min, range.max)) {
                    rank = range.name
                    break
                }
            }

            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${COLLECTION_NAME} ${args[0]}`)
                .setDescription('A rarity tool provided by Peninsola.io')
                .setURL(`https://magiceden.io/item-details/${item.mint}`)
                .setImage(item.image)
                .setThumbnail('https://i.imgur.com/KeUTSdT.png')
                .setAuthor({ name: 'Peninsola.io', url: 'https://peninsola.io' })
                .addFields(
                    { name: 'Rank', value: `🏆 ${index}`, inline: true },
                    { name: 'Score', value: `🥇 ${rank}`, inline: true },
                    { name: 'Supply', value: `📦 ${sorted.length}`, inline: true }
                )
            //@ts-ignore
            message.channel.send({embeds: [embed]})
        }
    }
})

function between(x: number, min: number, max: number): boolean {
  return x >= min && x <= max;
}

function getIndex(name: string) {
        return sorted.findIndex( (item: {name: string}) => item.name === name)
}

