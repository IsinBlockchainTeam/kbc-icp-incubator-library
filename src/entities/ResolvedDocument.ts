import { Document } from './Document';

export class ResolvedDocument extends Document {
    private _filename: string;

    private _content: string;

    constructor(filename: string, content: string) {
        super();
        this._filename = filename;
        this._content = content;
    }

    get filename(): string {
        return this._filename;
    }

    set filename(value: string) {
        this._filename = value;
    }

    get content(): string {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }
}
