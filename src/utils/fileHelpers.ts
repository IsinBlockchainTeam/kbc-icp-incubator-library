import CryptoJS from "crypto-js";

const DEFAULT_CHUNK_SIZE = 1900000; // 1.9MB

export type SupportedAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA224' | 'SHA512' | 'SHA384' | 'SHA3' | 'RIPEMD160';

class FileHelpers {
    public static computeHashFromBuffer(buffer: Buffer, algorithm: SupportedAlgorithm = 'SHA256'): string {
        const wordArray = CryptoJS.lib.WordArray.create(buffer);
        const hash = CryptoJS.algo[algorithm].create().finalize(wordArray);
        return hash.toString(CryptoJS.enc.Hex);
    }

    public static getHash(bytes: Uint8Array): Uint8Array {
        const wordArray = CryptoJS.lib.WordArray.create(bytes);
        const hash = CryptoJS.SHA256(wordArray);
        const hashBuffer = Buffer.from(hash.toString(CryptoJS.enc.Hex), 'hex');
        return new Uint8Array(hashBuffer);
    }

    public static getChunks(
        bytes: Uint8Array,
        chunkSize: number = DEFAULT_CHUNK_SIZE
    ) {
        const chunks = [];

        for (let i = 0; i < bytes.byteLength; i += chunkSize) {
            const chunk: Uint8Array = new Uint8Array(bytes.slice(i, i + chunkSize));
            chunks.push({
                chunk,
                hash: FileHelpers.computeHashFromBuffer(Buffer.from(chunk)),
            });
        }

        return chunks;
    }
}

export default FileHelpers;