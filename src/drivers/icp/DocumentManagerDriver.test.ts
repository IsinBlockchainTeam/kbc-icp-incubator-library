import { DocumentManagerDriver } from './DocumentManagerDriver';
import { Wallet } from 'ethers';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { RoleProof } from '../../../icp/ts-canister/src/models/Proof';
import { computeRoleProof } from './proof';

const PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
const SIWE_CANISTER_ID = 'bw4dl-smaaa-aaaaa-qaacq-cai';
const DOCUMENT_MANAGER_CANISTER_ID = 'bd3sg-teaaa-aaaaa-qaaba-cai';

describe('DocumentManagerDriver', () => {
    let wallet: Wallet;
    let documentManagerDriver: DocumentManagerDriver;
    let viewerRoleProof: RoleProof;
    let signerRoleProof: RoleProof;

    beforeAll(async () => {
        wallet = new Wallet(PRIVATE_KEY);
        const siweIdentityProvider = new SiweIdentityProvider(wallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();
        documentManagerDriver = new DocumentManagerDriver(
            siweIdentityProvider.identity,
            DOCUMENT_MANAGER_CANISTER_ID,
            'http://127.0.0.1:4943/'
        );
        viewerRoleProof = await computeRoleProof(
            wallet.address,
            'Viewer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            COMPANY_PRIVATE_KEY
        );
        signerRoleProof = await computeRoleProof(
            wallet.address,
            'Signer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            COMPANY_PRIVATE_KEY
        );
    });

    it('should retrieve a document', async () => {
        const document = await documentManagerDriver.getDocument(viewerRoleProof, 0);
        console.log(document);
        expect(document).toBeDefined();
    }, 15000);

    it('should retrieve documents', async () => {
        const documents = await documentManagerDriver.getDocuments(viewerRoleProof);
        console.log(documents);
        expect(documents).toBeDefined();
    }, 15000);

    it('should create a document', async () => {
        const document = await documentManagerDriver.createDocument(
            signerRoleProof,
            'https://example.com',
            'hash',
            wallet.address
        );
        console.log(document);
        expect(document).toBeDefined();
    }, 15000);

    it('should fail to create a document if the role is not allowed', async () => {
        await expect(
            documentManagerDriver.createDocument(
                viewerRoleProof,
                'https://example.com',
                'hash',
                wallet.address
            )
        ).rejects.toThrowError();
    }, 15000);

    it('should update a document', async () => {
        const document = await documentManagerDriver.updateDocument(
            signerRoleProof,
            0,
            'https://example.com/updated',
            'hash2',
            wallet.address
        );
        console.log(document);
        expect(document).toBeDefined();
    }, 15000);
});
