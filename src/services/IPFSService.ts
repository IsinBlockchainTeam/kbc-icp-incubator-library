import { PinataPinOptions } from '@pinata/sdk';
import IPFSDriverInterface from '../drivers/IPFSDriver.interface';
import ReadableStream = NodeJS.ReadableStream;

export class IPFSService {
    private _ipfsDriver: IPFSDriverInterface;

    constructor(ipfsDriver: IPFSDriverInterface) {
        this._ipfsDriver = ipfsDriver;
    }

    storeJSON(content: any, options?: PinataPinOptions): Promise<string> {
        return this._ipfsDriver.storeJSON(content, options);
    }

    storeFile(content: any, options?: PinataPinOptions): Promise<string> {
        return this._ipfsDriver.storeFile(content, options);
    }

    retrieveJSON(cid: string): Promise<any> {
        return this._ipfsDriver.retrieveJSON(cid);
    }

    retrieveFile(cid: string): Promise<ReadableStream> {
        return this._ipfsDriver.retrieveFile(cid);
    }
}
