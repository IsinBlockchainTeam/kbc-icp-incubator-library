export class DocumentFile {
    private readonly _filename: string;

    private readonly _content: Blob;

    constructor(filename: string, content: Blob) {
        this._filename = filename;
        this._content = content;
    }

    get filename(): string {
        return this._filename;
    }

    get content(): Blob {
        return this._content;
    }
}
