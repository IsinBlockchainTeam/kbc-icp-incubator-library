import { ICPSiweDriver, SIWE_IDENTITY_SERVICE } from '@isinblockchainteam/kbc-icp-incubator-common';
import type { ActorSubclass, Identity } from '@dfinity/agent';
import { Wallet } from 'ethers';
import { DelegationIdentity, Ed25519KeyIdentity } from '@dfinity/identity';

export class SiweIdentityProvider {
    private _icpSiweDriver: ICPSiweDriver;

    private _signer: Wallet;

    private _identity?: Identity;

    constructor(signer: Wallet, siweCanisterId: string) {
        this._signer = signer;
        this._icpSiweDriver = new ICPSiweDriver(siweCanisterId);
    }

    async createIdentity(): Promise<void> {
        const signerAddress = this._signer.address as `0x${string}`;
        const anonymousActor = this._icpSiweDriver.createAnonymousActor({
            httpAgentOptions: {
                host: 'http://127.0.0.1:4943'
            },
            actorOptions: undefined
        }) as ActorSubclass<SIWE_IDENTITY_SERVICE>;
        const siweMessage = await this._icpSiweDriver.callPrepareLogin(anonymousActor, signerAddress);
        const loginSignature = (await this._signer.signMessage(siweMessage)) as `0x${string}`;
        const sessionIdentity = Ed25519KeyIdentity.generate();
        const sessionPublicKey = sessionIdentity.getPublicKey().toDer();

        const loginOkResponse = await this._icpSiweDriver.callLogin(anonymousActor, loginSignature, signerAddress, sessionPublicKey);
        const signedDelegation = await this._icpSiweDriver.callGetDelegation(
            anonymousActor,
            signerAddress,
            sessionPublicKey,
            loginOkResponse.expiration
        );
        const delegationChain = this._icpSiweDriver.createDelegationChain(signedDelegation, loginOkResponse.user_canister_pubkey);
        this._identity = DelegationIdentity.fromDelegation(sessionIdentity, delegationChain);
    }

    get identity(): Identity {
        if (!this._identity) throw new Error('Identity not defined, call createIdentity() first');
        return this._identity;
    }
}
