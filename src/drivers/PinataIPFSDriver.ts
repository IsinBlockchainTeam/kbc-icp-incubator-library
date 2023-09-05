import PinataClient, { PinataPinOptions } from '@pinata/sdk';
import fetch from 'node-fetch';
import IPFSDriver from './IPFSDriver.interface';
import ReadableStream = NodeJS.ReadableStream;

export class PinataIPFSDriver implements IPFSDriver {
    private _client: PinataClient;

    private _gateway: string = 'https://gateway.pinata.cloud';

    constructor(
        apiKey: string,
        secretApiKey: string,
        gateway?: string,
    ) {
        this._client = new PinataClient(apiKey, secretApiKey);
        if (gateway) this._gateway = gateway;
    }

    /**
     * This function takes a string content that will be saved on ipfs and returns its hash as a string
     * @param {any} content - The content to save. It must be a JSON object
     * @param {PinataPinOptions} options - Additional options to configure the pinning
     * @returns The CID of the saved content.
     */
    async storeJSON(content: any, options?: PinataPinOptions): Promise<string> {
        // serialize before store to be sure that JSON object has correct structure
        const serializedContent = JSON.stringify(content);
        const response = await this._client.pinJSONToIPFS(serializedContent, options);
        return response.IpfsHash;
    }

    /**
     * This function takes a file that will be saved on ipfs and returns its hash as a string
     * @param {any} content - The content of the file to save
     * @param {PinataPinOptions} options - Additional options to configure the pinning
     * @returns The CID of the saved content.
     */
    async storeFile(content: any, options?: PinataPinOptions): Promise<string> {
        const response = await this._client.pinFileToIPFS(content, options);
        return response.IpfsHash;
    }

    /**
     * This function takes a cid identifier of a resource and it from ipfs
     * @param {string} cid - The identifier of the object in ipfs
     * @returns The content of the JSON retrieved object.
     */
    async retrieveJSON(cid: string): Promise<any> {
        const response = await fetch(`${this._gateway}/ipfs/${cid}`);
        if (!response.ok) { throw new Error(`Error while get data from IPFS, status: ${response.status}`); }
        const jsonResponse = await response.json();
        return JSON.parse(jsonResponse);
    }

    /**
     * This function takes a cid identifier of a resource and it from ipfs
     * @param {string} cid - The identifier of the object in ipfs
     * @returns The stream of the retrieved file.
     */
    async retrieveFile(cid: string): Promise<ReadableStream> {
        const response = await fetch(`${this._gateway}/ipfs/${cid}`);
        if (!response.ok) { throw new Error(`Error while get data from IPFS, status: ${response.status}`); }
        return response.body;
    }

    /**
     * This function delete a file from ipfs by its cid
     * @param {string} cid - The identifier of the object in ipfs
     */
    async delete(cid: string): Promise<void> {
        try {
            await this._client.unpin(cid);
        } catch (e) {
            console.error(`Cannot delete file with cid ${cid}, reason: ${e}`);
        }
    }
}
export default PinataIPFSDriver;
