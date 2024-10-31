import { Organization } from './Organization';

export class NarrowedOrganization extends Organization {
    // eslint-disable-next-line no-useless-constructor
    constructor(id: number, name: string) {
        super(id, name);
    }
}
