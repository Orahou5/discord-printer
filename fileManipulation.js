import fs from 'fs';
import Os from 'os';
import windowsPrint from "pdf-to-printer";
import unixPrint from "unix-print";
import { sendToConsoleAndChannel } from './index.js';
import { pdfToPng } from 'pdf-to-png-converter';

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

class FilePath {
    constructor(folder, filename) {
        this.path = `${folder}/${filename}`;
        this.filename = filename;
    }

}

export async function writeAttachment(filename, stream) {
    const files = [];
    try {
        if (!fs.existsSync("./temp")) {
            fs.mkdirSync("./temp");
        }
        let pdfRespone = await fetch(stream);
        let pdfBuffer = await pdfRespone.arrayBuffer();
        pdfRespone = null;
        let binaryPdf = Buffer.from(pdfBuffer);
        pdfBuffer = null;
        if(filename.endsWith(".pdf")) {
            const pages = await pdfToPng(binaryPdf, 
                {
                    disableFontFace: true, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
                    useSystemFonts: false, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false.
                    enableXfa: false, // Render Xfa forms if any. Default value is false.
                    viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0.
                    outputFolder: './temp', // Folder to write output PNG files. If not specified, PNG output will be available only as a Buffer content, without saving to a file.
                    outputFileMask: `${filename}`, // Output filename mask. Default value is 'buffer'.
                    //pdfFilePassword: '', // Password for encrypted PDF.
                    pagesToProcess: [1],   // Subset of pages to convert (first page = 1), other pages will be skipped if specified.
                    strictPagesToProcess: false, // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
                    verbosityLevel: 5 // Verbosity level. ERRORS: 0, WARNINGS: 1, INFOS: 5. Default value is 0.
                }
            )

            binaryPdf = null;

            console.log(pages);

            //files.push(...pages.map(page => new FilePath("./temp", page.name)));
        } else {
            const file = new FilePath("./temp", filename);
            fs.writeFileSync(file.path, binaryPdf);
            files.push(file);
        }
    } catch (error) {
        console.log(`Writing error for file ./temp/${filename} : ${error}`)
    }
    
    return files;
}

function deleteFile(path){
    try {
        fs.unlinkSync(path)
    } catch (error) {
        console.log(`An error has occured when deleting the file ${path} \n ${err}`)
    }
}