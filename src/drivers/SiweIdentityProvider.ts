import type { ActorSubclass, Identity } from '@dfinity/agent';
import { Wallet } from 'ethers';
import { DelegationIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import { SIWE_IDENTITY_SERVICE, SiweDriver } from './SiweDriver';
import {ICP} from "../__shared__/constants/constants";

export class SiweIdentityProvider {
    private _icpSiweDriver: SiweDriver;

    private _signer: Wallet;

    private _identity?: Identity;

    constructor(signer: Wallet, siweCanisterId: string) {
        this._signer = signer;
        this._icpSiweDriver = new SiweDriver(siweCanisterId);
    }

    async createIdentity(): Promise<void> {
        const signerAddress = this._signer.address as `0x${string}`;
        const anonymousActor = this._icpSiweDriver.createAnonymousActor({
            httpAgentOptions: {
                host: ICP.NETWORK
            },
            actorOptions: undefined
        }) as ActorSubclass<SIWE_IDENTITY_SERVICE>;
        const siweMessage = await this._icpSiweDriver.callPrepareLogin(
            anonymousActor,
            signerAddress
        );
        const loginSignature = (await this._signer.signMessage(siweMessage)) as `0x${string}`;
        const sessionIdentity = Ed25519KeyIdentity.generate();
        const sessionPublicKey = sessionIdentity.getPublicKey().toDer();

        const loginOkResponse = await this._icpSiweDriver.callLogin(
            anonymousActor,
            loginSignature,
            signerAddress,
            sessionPublicKey
        );
        const signedDelegation = await this._icpSiweDriver.callGetDelegation(
            anonymousActor,
            signerAddress,
            sessionPublicKey,
            loginOkResponse.expiration
        );
        const delegationChain = this._icpSiweDriver.createDelegationChain(
            signedDelegation,
            loginOkResponse.user_canister_pubkey
        );
        this._identity = DelegationIdentity.fromDelegation(sessionIdentity, delegationChain);
    }

    get identity(): Identity {
        if (!this._identity) throw new Error('Identity not defined, call createIdentity() first');
        return this._identity;
    }
}
