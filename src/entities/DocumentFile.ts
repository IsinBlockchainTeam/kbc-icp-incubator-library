import { ReadStream } from 'fs';

export class DocumentFile {
    private _filename: string;

    private _content: ReadStream;

    constructor(filename: string, content: ReadStream) {
        this._filename = filename;
        this._content = content;
    }

    get filename(): string {
        return this._filename;
    }

    get content(): ReadStream {
        return this._content;
    }
}
