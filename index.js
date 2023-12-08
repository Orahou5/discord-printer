import "dotenv/config.js";
import { Client } from "oceanic.js";
import { unifiedPrinter, writeAttachment } from './fileManipulation.js';

const client = new Client({ 
    auth: `Bot ${process.env.DISCORD_PRINT}`,
    gateway: {
        intents: ["GUILDS", "GUILD_MESSAGES", "MESSAGE_CONTENT"]
    }
 });

client.once("ready", async() => {
    console.log("Ready as", client.user.tag);
});

client.on("messageCreate", (msg) => {
    let zoom = 100;
    if(msg.content.includes("--zoom")){
        const regex = /--zoom (100|[1-9]?[0-9])\b/; // 100 or 0-99
        zoom = +(msg.content.match(regex)?.[1] ?? 100);
    }

    msg.attachments.forEach(async (attachment) => {
        const extension = attachment.filename.split(".").at(-1);
        if(!["pdf", "jpg", "jpeg", "png"].includes(extension)) {
            sendToConsoleAndChannel(msg.channel, `File ${attachment.filename} is not a pdf, jpg, jpeg or png file`);
        };

        const files = await writeAttachment(attachment.filename, attachment.url);
        files.forEach(file => {
            unifiedPrinter({ 
                path: file.path, 
                channel: msg.channel,
                zoom,
                filename: file.filename
            });
        });
    });
});

client.on("error", (err) => {
    console.error("Something Broke!", err);
});

function sendMessage(channel, content) {
    channel.createMessage({
        content,
    })
}

export function sendToConsoleAndChannel(channel, str){
    console.log(str);
    sendMessage(channel, str);
}

client.connect();
