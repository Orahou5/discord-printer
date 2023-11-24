import "dotenv/config.js";
import { Client } from "oceanic.js";
import { getPrinterApi, writeAttachment } from './fileManipulation.js';

const printFile = getPrinterApi();

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
    msg.attachments.forEach(async (attachment) => {
        const path = await writeAttachment(attachment.filename, attachment.url);
        printFile(path);
    });
});

client.on("error", (err) => {
    console.error("Something Broke!", err);
});

client.connect();
