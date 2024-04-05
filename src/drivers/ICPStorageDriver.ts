import FileHelpers from "../utils/fileHelpers";
import { createActor } from "icp-declarations/storage";
import {AuthClient} from "@dfinity/auth-client";
import {Buffer} from "buffer";
import {ActorSubclass} from "@dfinity/agent";
import {_SERVICE} from "icp-declarations/storage/storage.did";
import {PromisePool} from "@supercharge/promise-pool";

export class ICPStorageDriver {
    private actor?: ActorSubclass<_SERVICE>;

    async login(canisterId: string) {
        const identityProvider= `http://${canisterId}.localhost:4943`;
        const client = await AuthClient.create();
        let identity;
        await client.login({
            identityProvider,
            onSuccess: () => {
                identity = client.getIdentity();
                console.log("IDENTITY:", identity);
            }
        });

        this.actor = createActor(canisterId, {
            agentOptions: {
                identity
            }
        })
    }

    async create(bytes: Uint8Array) {
        if(!this.actor)
            throw new Error("You must be logged in!")

        const file = Buffer.from(bytes);
        const hash: Uint8Array = FileHelpers.getHash(file);
        const chunks: any[] = FileHelpers.getChunks(file);

        const fileId = await this.actor.create_file(
            BigInt(1),
            "prova",
            "application/pdf",
            BigInt(file.length),
            hash
        )

        // Create a promise pool to upload chunks in parallel
        await PromisePool.withConcurrency(20)
            .for(chunks)
            .process(async (chunk, index) => {
                return this.actor!.put_chunk(fileId, index, chunk);
            });

        console.log(`File uploaded successfully, fileId: ${fileId}`);
    }
}