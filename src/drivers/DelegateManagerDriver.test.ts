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
    const mockedIsDelegator = jest.fn();
    const mockedHasValidRole = jest.fn();

    mockedWriteFunction.mockReturnValue({ wait: mockedWait });
    mockedIsDelegator.mockReturnValue(true);
    mockedHasValidRole.mockReturnValue(true);

    const mockedContract = createMock<DelegateManager>({
        connect: mockedDelegateManagerConnect,
        addDelegator: mockedWriteFunction,
        removeDelegator: mockedWriteFunction,
        isDelegator: mockedIsDelegator,
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

    it('should add delegator', async () => {
        const delegator = Wallet.createRandom().address;
        await delegateManagerDriver.addDelegator(delegator);

        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWriteFunction).toHaveBeenCalledWith(delegator);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should remove delegator', async () => {
        const delegator = Wallet.createRandom().address;
        await delegateManagerDriver.removeDelegator(delegator);

        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWriteFunction).toHaveBeenCalledWith(delegator);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should check if address is delegator', async () => {
        const delegator = Wallet.createRandom().address;
        const isDelegator = await delegateManagerDriver.isDelegator(delegator);

        expect(mockedIsDelegator).toHaveBeenCalledTimes(1);
        expect(mockedIsDelegator).toHaveBeenCalledWith(delegator);
        expect(isDelegator).toBe(true);
    });

    it('should check if address has a valid role', async () => {
        const roleProof = createMock<RoleProof>();
        const hasRole = await delegateManagerDriver.hasValidRole(roleProof, 'role');

        expect(mockedHasValidRole).toHaveBeenCalledTimes(1);
        expect(mockedHasValidRole).toHaveBeenCalledWith(roleProof, 'role');
        expect(hasRole).toBe(true);
    });
});
