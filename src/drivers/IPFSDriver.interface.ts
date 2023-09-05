import { PinataPinOptions } from '@pinata/sdk';

export interface IPFSDriver {
    storeJSON(content: any, options?: PinataPinOptions): Promise<string>;

    storeFile(content: any, options?: PinataPinOptions): Promise<string>;

    retrieveJSON(cid: string): Promise<any>;

    retrieveFile(cid: string): Promise<any>;

    delete(cid: string): Promise<void>;

}
export default IPFSDriver;
