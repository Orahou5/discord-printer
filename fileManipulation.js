import fs from 'fs';
import Os from 'os';
import windowsPrint from "pdf-to-printer";
import unixPrint from "unix-print";
import { sendToConsoleAndChannel } from './index.js';

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

export function unifiedPrinter({ path, zoom = -1, channel, filename }){
    printerSettings.printer.print(path, ...printerSettings.otherArgs(zoom)).then(value => {
        sendToConsoleAndChannel(channel, `Sent file to the printer : ${filename}`);
    }).catch(error => {
        sendToConsoleAndChannel(channel, `An error has occured when printing the file ${filename} \n ${error}`);
    }).finally(() => {
        deleteFile(path);
    });
}

export async function writeAttachment(filename, stream) {
    const path = `./temp/${filename}`;
    try {
        if (!fs.existsSync("./temp")) {
            fs.mkdirSync("./temp");
        }
        const pdfRespone = await fetch(stream);
        const pdfBuffer = await pdfRespone.arrayBuffer();
        const binaryPdf = Buffer.from(pdfBuffer);
        fs.writeFileSync(path, binaryPdf);
    } catch (error) {
        console.log(`Writing error for file ${path} : ${error}`)
    }
    
    return path;
}

function deleteFile(path){
    try {
        fs.unlinkSync(path)
    } catch (error) {
        console.log(`An error has occured when deleting the file ${path} \n ${err}`)
    }
}