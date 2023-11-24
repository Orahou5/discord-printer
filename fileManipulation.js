import Os from 'os'
import windowsPrint from "pdf-to-printer";
import unixPrint from "unix-print";
import fs from 'fs';

const isWindows = Os.platform() === "win32"

const isMac = Os.platform() === "darwin"

const isUnix = ["aix", "freebsd", "linux", "openbsd", "sunos", "android"].includes(Os.platform());


console.log(isWindows);

console.log(isMac);

console.log(isUnix);

export function getPrinterApi(){
    
    if(isWindows) return windowsPrintFn
    else return unixPrintFn
}

function unixPrintFn(path, zoom = 100){
    unixPrint.print(path, undefined, [`-o fit-to-page -o scaling=${zoom}`]).then(value => {
        console.log(`Sent file : ${path}`);
    }).catch(error => {
        console.log(`An error has occured when printing the file ${path} \n ${error}`);
    }).finally(() => {
        deleteFile(path);
    });
}


function windowsPrintFn(path, zoom = 100){
    const zoomer = zoom < 50 ? "shrink" : "fit"
    windowsPrint.print(path, {
        scale: `${zoomer}`
    }).then(value => {
        console.log(`Sent file : ${path}`)
    }).catch(error => {
        console.log(`An error has occured when printing the file ${path} \n ${error}`)
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
        fs.writeFileSync(path, binaryPdf, 'binary');
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