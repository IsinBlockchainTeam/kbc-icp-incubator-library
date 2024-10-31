import { Organization } from './Organization';

export class NarrowedOrganization extends Organization {
    // eslint-disable-next-line no-useless-constructor
    constructor(ethAddress: string, name: string) {
        super(ethAddress, name);
    }
}
