export class Path {
    constructor(folder, file) {
        this.folder = folder;
        this.file = file;
    }

    get full() {
        return `${this.folder}/${this.file}`
    }
}