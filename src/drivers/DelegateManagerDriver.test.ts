import { DelegateManagerDriver } from './DelegateManagerDriver';
import { Signer, Wallet } from 'ethers';
import { DelegateManager, DelegateManager__factory } from '../smart-contracts';
import { createMock } from 'ts-auto-mock';
import { RoleProof } from '../types/RoleProof';

describe('DelegateManagerDriver', () => {
    let delegateManagerDriver: DelegateManagerDriver;
    let mockedSigner: Signer;

    const mockedDelegateManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetRevocationRegistry = jest.fn();
    const mockedHasValidRole = jest.fn();

    mockedWriteFunction.mockReturnValue({ wait: mockedWait });
    mockedGetRevocationRegistry.mockReturnValue('revocationRegistryAddress');
    mockedHasValidRole.mockReturnValue(true);

    const mockedContract = createMock<DelegateManager>({
        connect: mockedDelegateManagerConnect,
        getRevocationRegistry: mockedGetRevocationRegistry,
        hasValidRole: mockedHasValidRole
    });

    beforeAll(() => {
        jest.clearAllMocks();
        mockedDelegateManagerConnect.mockReturnValue(mockedContract);
        const mockedDelegateManager = createMock<DelegateManager>({
            connect: mockedDelegateManagerConnect
        });
        jest.spyOn(DelegateManager__factory, 'connect').mockReturnValue(mockedDelegateManager);

        mockedSigner = createMock<Signer>();
        delegateManagerDriver = new DelegateManagerDriver(
            mockedSigner,
            Wallet.createRandom().address
        );
    });

    it('should get revocation registry address', async () => {
        const revocationRegistryAddress =
            await delegateManagerDriver.getRevocationRegistryAddress();

        expect(mockedGetRevocationRegistry).toHaveBeenCalledTimes(1);
        expect(revocationRegistryAddress).toBe('revocationRegistryAddress');
    });

    it('should check if address has a valid role', async () => {
        const roleProof = createMock<RoleProof>();
        const hasRole = await delegateManagerDriver.hasValidRole(roleProof, 'role');

        expect(mockedHasValidRole).toHaveBeenCalledTimes(1);
        expect(mockedHasValidRole).toHaveBeenCalledWith(roleProof, 'role');
        expect(hasRole).toBe(true);
    });
});
