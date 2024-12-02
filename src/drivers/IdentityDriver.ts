import { Identity } from '@dfinity/agent';

export class IdentityDriver {
    private readonly _identity: Identity;

    public constructor(identity: Identity) {
        this._identity = identity;
    }

    getIdentity(): Identity {
        return this._identity;
    }
}
