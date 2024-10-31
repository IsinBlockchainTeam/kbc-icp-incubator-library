import { Wallet } from 'ethers';
import { OrganizationDriver } from './OrganizationDriver';
import { SiweIdentityProvider } from './SiweIdentityProvider';
import { computeRoleProof } from './proof';
import { AuthenticationDriver } from './AuthenticationDriver';
import { BroadedOrganization } from '../../entities/organization/BroadedOrganization';
import { Organization } from '../../entities/organization/Organization';

// FIXME: Move this variables to a common file?
const USER_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';
const SIWE_CANISTER_ID = 'be2us-64aaa-aaaaa-qaabq-cai';
const ENTITY_MANAGER_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
const ICP_NETWORK = 'http://127.0.0.1:4943/';

type OrganizationScratch = {
    name: string;
    description: string;
};

describe('OrganizationDriver', () => {
    let organizationDriver: OrganizationDriver;
    let organizationScratch: OrganizationScratch;
    let updatedOrganizationScratch: OrganizationScratch;
    let createdOrganization: Organization;

    const login = async (userWallet: Wallet, siweIdentityProvider: SiweIdentityProvider) => {
        const companyWallet = new Wallet(COMPANY_PRIVATE_KEY);
        const roleProof = await computeRoleProof(
            userWallet.address,
            'Signer',
            DELEGATE_CREDENTIAL_ID_HASH,
            DELEGATOR_CREDENTIAL_ID_HASH,
            companyWallet
        );
        const authenticationDriver = new AuthenticationDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            ICP_NETWORK
        );

        await authenticationDriver.login(roleProof);
    };

    beforeAll(async () => {
        const userWallet = new Wallet(USER_PRIVATE_KEY);
        const siweIdentityProvider = new SiweIdentityProvider(userWallet, SIWE_CANISTER_ID);
        await siweIdentityProvider.createIdentity();

        organizationDriver = new OrganizationDriver(
            siweIdentityProvider.identity,
            ENTITY_MANAGER_CANISTER_ID,
            ICP_NETWORK
        );

        organizationScratch = {
            name: 'Test Organization',
            description: 'Test Description'
        };
        updatedOrganizationScratch = {
            name: 'Updated Organization',
            description: 'Updated Description'
        };

        await login(userWallet, siweIdentityProvider);
    }, 15000);

    it('should get organizations', async () => {
        const organizations = await organizationDriver.getOrganizations();

        expect(organizations).toBeInstanceOf(Array);
    });

    it('should get organization - not founded', async () => {
        const getOrganizationFunction = async () => organizationDriver.getOrganization('0x0');

        await expect(getOrganizationFunction()).rejects.toThrow();
    });

    it('should create organization', async () => {
        createdOrganization = await organizationDriver.createOrganization(
            organizationScratch.name,
            organizationScratch.description
        );

        expect(createdOrganization).toBeInstanceOf(BroadedOrganization);

        const organization = createdOrganization as BroadedOrganization;

        expect(organization.name).toBe(organizationScratch.name);
        expect(organization.description).toBe(organizationScratch.description);
    });

    it('should get organization - founded', async () => {
        const retrievedOrganization = await organizationDriver.getOrganization(
            createdOrganization.ethAddress
        );

        expect(retrievedOrganization).toBeInstanceOf(BroadedOrganization);

        const organization = retrievedOrganization as BroadedOrganization;

        expect(organization.name).toBe(organizationScratch.name);
        expect(organization.description).toBe(organizationScratch.description);
    });

    it('should update organization', async () => {
        const updatedOrganization = await organizationDriver.updateOrganization(
            createdOrganization.ethAddress,
            updatedOrganizationScratch.name,
            updatedOrganizationScratch.description
        );

        expect(updatedOrganization).toBeInstanceOf(BroadedOrganization);

        const organization = updatedOrganization as BroadedOrganization;

        expect(organization.name).toBe(updatedOrganizationScratch.name);
        expect(organization.description).toBe(updatedOrganizationScratch.description);
    });

    it('should get organization - updated', async () => {
        const retrievedOrganization = await organizationDriver.getOrganization(
            createdOrganization.ethAddress
        );

        expect(retrievedOrganization).toBeInstanceOf(BroadedOrganization);

        const organization = retrievedOrganization as BroadedOrganization;

        expect(organization.name).toBe(updatedOrganizationScratch.name);
        expect(organization.description).toBe(updatedOrganizationScratch.description);
    });
});
