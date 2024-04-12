import FileHelpers from "../utils/fileHelpers";
import {createActor as createStorageActor} from "icp-declarations/storage";
import {createActor as createOrganizationActor} from "icp-declarations/organization";
import {AuthClient} from "@dfinity/auth-client";
import {Identity} from "@dfinity/agent";
import {PromisePool} from "@supercharge/promise-pool";
import {debug} from "debug";
import {FileInfo} from "../declarations/storage/storage.did";

export class ICPStorageDriver {
    private identity?: Identity;

    constructor() {
        debug.enable("icp");
    }

    async login(canisterId: string) {
        const identityProvider= `http://${canisterId}.localhost:4943`;
        const client = await AuthClient.create();
        await client.login({
            identityProvider,
            onSuccess: () => {
                this.identity = client.getIdentity();
            }
        });
    }

    async createOrganization(canisterId: string, name: string, description: string) {
        if(!this.identity)
            throw new Error("You must be logged in!");

        const actor = createOrganizationActor(canisterId, {
            agentOptions: {
                identity: this.identity,
            }
        })

        const organizationId = await actor.create_organization(name, description);
        return organizationId;
    }


    async createFile(canisterId: string, size: number, bytes: Uint8Array) {
        if(!this.identity)
            throw new Error("You must be logged in!");

        const actor = createStorageActor(canisterId, {
            agentOptions: {
                identity: this.identity,
            }
        })

        const hash: Uint8Array = FileHelpers.getHash(bytes);
        const chunks: any[] = FileHelpers.getChunks(bytes);

        const fileId = await actor.create_file(
            BigInt(0),
            "prova",
            "application/pdf",
            BigInt(size),
            hash
        );

        // Create a promise pool to upload chunks in parallel
        const { results, errors } = await PromisePool.withConcurrency(20)
            .for(chunks)
            .process(async (chunk, index) => {
                return actor!.put_chunk(fileId, index, chunk);
            });

        return {results, errors};
    }

    async getFiles(canisterId: string) {
        if(!this.identity)
            throw new Error("You must be logged in!");

        const actor = createStorageActor(canisterId, {
            agentOptions: {
                identity: this.identity,
            }
        });

        return await actor.get_files_for_organization(BigInt(0));
    }

    async downloadFile(canisterId: string, file: FileInfo): Promise<Uint8Array> {
        if(!this.identity)
            throw new Error("You must be logged in!");

        const actor = createStorageActor(canisterId, {
            agentOptions: {
                identity: this.identity,
            }
        });

        // Create a download promise pool
        let { results, errors } = await PromisePool.withConcurrency(10)
            .for(Array.from({ length: Number(file.chunks) }, (_, i) => i))
            .process(async (index) => {
                const chunk = await actor.get_file_chunk(file.id, index);

                if ("Ok" in chunk) {
                    return {
                        index,
                        chunk: chunk.Ok,
                    };
                }
            });

        results = results.sort((a, b) => a!.index - b!.index);

        // Keep only the chunks
        let res = results.map((result) => result!.chunk.chunk);

        // Merge the chunks into a single buffer
        const total = res.reduce((acc, chunk) => acc + chunk!.length, 0);
        const buffer = new Uint8Array(total);
        let offset = 0;
        for (const chunk of res) {
            buffer.set(chunk!, offset);
            offset += chunk!.length;
        }

        return buffer;

        // // Create a blob from the buffer
        // const blob = new Blob([buffer], { type: file.mime_type });
        // return blob;

        // // Create a URL from the blob
        // const url = URL.createObjectURL(blob);
        //
        // return url;
    }
}