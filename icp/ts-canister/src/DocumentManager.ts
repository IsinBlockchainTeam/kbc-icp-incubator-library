import { IDL, update, StableBTreeMap } from 'azle';
import {Document} from "./models/Document";
import { Address } from './models/Address';
import { RoleProof } from './models/Proof';
import { OnlyEditor, OnlyViewer } from './decorators/roles';

class DocumentManager {
    private documents = StableBTreeMap<bigint, Document>(0);

    @update([RoleProof, IDL.Nat], IDL.Opt(Document))
    @OnlyViewer
    public async getDocument(id: bigint): Promise<[Document] | []> {
        const result = this.documents.get(id);
        return result ? [result] : [];
    }

    @update([RoleProof], IDL.Vec(Document))
    @OnlyViewer
    public async getDocuments(): Promise<Document[]> {
        return this.documents.values();
    }

    @update([RoleProof, IDL.Text, IDL.Text, Address], Document)
    @OnlyEditor
    public async registerDocument(externalUrl: string, contentHash: string, uploadedBy: Address): Promise<Document> {
        const id = this.documents.keys().length;
        const document: Document = { id, externalUrl, contentHash, uploadedBy };
        this.documents.insert(BigInt(id), document);
        return document;
    }

    @update([RoleProof, IDL.Nat, IDL.Text, IDL.Text, Address], Document)
    @OnlyEditor
    public async updateDocument(id: bigint, externalUrl: string, contentHash: string, uploadedBy: Address): Promise<Document> {
        const document = this.documents.get(id);
        if (!document) {
            throw new Error('Document not found');
        }
        document.externalUrl = externalUrl;
        document.contentHash = contentHash;
        document.uploadedBy = uploadedBy;
        this.documents.insert(BigInt(id), document);
        return document;
    }
}

export default DocumentManager;
