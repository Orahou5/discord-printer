import fs from 'fs';
import Os from 'os';
import windowsPrint from "pdf-to-printer";
import unixPrint from "unix-print";
import { sendToConsoleAndChannel } from './index.js';
import { spawn, spawnSync } from 'child_process';
import { Path } from './Path.js';

const isWindows = Os.platform() === "win32"

const isMac = Os.platform() === "darwin"

const isUnix = ["aix", "freebsd", "linux", "openbsd", "sunos", "android"].includes(Os.platform());

let printerSettings = {};

if(isWindows){
    printerSettings = {
        printer: windowsPrint,
        otherArgs : (zoom) => [(zoom === -1 ? undefined : zoom < 50 ? { scale : "shrink", silent: false } : { scale : "fit", silent: false })]
    }
} else {
    printerSettings = {
        printer: unixPrint,
        otherArgs : (zoom) => [undefined, (zoom === -1 ? undefined : [`-o fit-to-page -o scaling=${zoom}`])]
    }
}

console.log("isWindows : " ,isWindows);

console.log("isMac : ", isMac);

console.log("isUnix : ", isUnix);

export function unifiedPrinter({ path, zoom = -1, channel }){
    printerSettings.printer.print(path.full).then(value => {
        sendToConsoleAndChannel(channel, `Sent file to the printer : ${path.file}`);
    }).catch(error => {
        sendToConsoleAndChannel(channel, `An error has occured when printing the file ${path.file} \n ${error}`);
    }).finally(() => {
        deleteFile(path);
    });
}

export function printFile({ path, zoom = -1, channel }) {
    unifiedPrinter({ path, zoom, channel });
}

export async function writeAttachment(filename, stream) {
    const path = new Path("./temp", filename);

    try {
        if (!fs.existsSync(path.folder)) {
            fs.mkdirSync(path.folder);
        }
        const pdfRespone = await fetch(stream);
        const pdfBuffer = await pdfRespone.arrayBuffer();
        const binaryPdf = Buffer.from(pdfBuffer);

        fs.writeFileSync(path.full, binaryPdf);

        console.log("File written successfully\n");
    } catch (error) {
        console.log(`Writing error for file ${path.full} : ${error}`)
    }
    
    return path;
}

function deleteFile(path){
    try {
        fs.unlinkSync(path.full)
    } catch (error) {
        console.log(`An error has occured when deleting the file ${path.file} \n ${err}`)
    }
}