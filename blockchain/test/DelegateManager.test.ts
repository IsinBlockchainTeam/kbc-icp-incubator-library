import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('DelegateManager', () => {
    let delegateManagerContract: Contract;
    let admin: SignerWithAddress, delegator: SignerWithAddress, delegate: SignerWithAddress, other: SignerWithAddress;

    const domain = {
        name: 'Test Delegate Manager',
        version: '1.0.1',
        chainId: 31337,
        verifyingContract: ''
    };
    const types = {
        RoleDelegation: [
            { name: 'delegateAddress', type: 'address' },
            { name: 'role', type: 'string' }
        ]
    };

    before(async () => {
        [admin, delegator, delegate, other] = await ethers.getSigners();
    });

    beforeEach(async () => {
        const DelegateManager = await ethers.getContractFactory(ContractName.DELEGATE_MANAGER);
        delegateManagerContract = await DelegateManager.deploy(domain.name, domain.version, domain.chainId);
        await delegateManagerContract.deployed();
        domain.verifyingContract = delegateManagerContract.address;
    });

    it('should have been deployed', async () => {
        expect(delegateManagerContract.address).to.properAddress;
    });

    describe('Delegators management', () => {
        it('should revert if adding a delegate when caller is not a delegator', async () => {
            expect(await delegateManagerContract.connect(admin).isDelegator(delegator.address)).to.be.false;
            await expect(delegateManagerContract.connect(other).addDelegate(delegate.address)).to.be.revertedWith(
                'DelegateManager: Caller is not a delegator'
            );
        });

        it('should add a delegator, then revoke the role', async () => {
            await delegateManagerContract.connect(admin).addDelegator(delegator.address);
            expect(await delegateManagerContract.connect(admin).isDelegator(delegator.address)).to.be.true;
            await expect(delegateManagerContract.connect(delegator).addDelegate(delegate.address)).not.to.be.reverted;

            await delegateManagerContract.connect(admin).removeDelegator(delegator.address);
            expect(await delegateManagerContract.connect(admin).isDelegator(delegator.address)).to.be.false;
            await expect(delegateManagerContract.connect(other).addDelegate(delegate.address)).to.be.revertedWith(
                'DelegateManager: Caller is not a delegator'
            );
        });

        it('should add a delegator who delegates a delegate, then revoke the delegate', async () => {
            await delegateManagerContract.connect(admin).addDelegator(delegator.address);
            await expect(delegateManagerContract.connect(delegator).addDelegate(delegate.address)).not.to.be.reverted;
            expect(await delegateManagerContract.connect(delegator).isDelegate(delegate.address)).to.be.true;

            await delegateManagerContract.connect(delegator).removeDelegate(delegate.address);
            expect(await delegateManagerContract.connect(delegator).isDelegate(delegate.address)).to.be.false;
        });

        it('should not be able to determine if a role is delegator if caller is not an admin', async () => {
            await expect(delegateManagerContract.connect(other).isDelegator(delegate.address)).to.be.revertedWith(
                'DelegateManager: Caller is not the admin'
            );
        });
    });

    describe('hasValidRole', () => {
        const message = {
            delegateAddress: '',
            role: 'Role1'
        };

        before(() => {
            message.delegateAddress = delegate.address;
        });

        beforeEach(async () => {
            await delegateManagerContract.connect(admin).addDelegator(delegator.address);
        });

        it('should return true when caller is a delegate with a valid proof', async () => {
            await delegateManagerContract.connect(delegator).addDelegate(delegate.address);
            const signature = await delegator._signTypedData(domain, types, message);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(signature, 'Role1', delegator.address)).to.be.true;
        });

        it('should return false if delegate address is different from the one in the signature', async () => {
            const message = {
                delegateAddress: other.address,
                role: 'Role1'
            };
            const signature = await delegator._signTypedData(domain, types, message);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(signature, 'Role1', delegator.address)).to.be.false;
        });

        it('should return false if claimed role is different from the one in the signature', async () => {
            const message = {
                delegateAddress: delegate.address,
                role: 'Role42'
            };
            const signature = await delegator._signTypedData(domain, types, message);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(signature, 'Role1', delegator.address)).to.be.false;
        });

        it('should return false if signer is not the delegator', async () => {
            await delegateManagerContract.connect(admin).addDelegator(other.address);
            await delegateManagerContract.connect(other).addDelegate(delegate.address);
            const signature = await delegator._signTypedData(domain, types, message);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(signature, 'Role1', delegator.address)).to.be.false;
        });

        it('should return false if delegator is not a valid delegator', async () => {
            await delegateManagerContract.connect(admin).removeDelegator(delegator.address);
            const signature = await delegator._signTypedData(domain, types, message);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(signature, 'Role1', delegator.address)).to.be.false;
        });

        it('should return false if caller is not a delegate', async () => {
            const signature = await delegator._signTypedData(domain, types, message);

            expect(await delegateManagerContract.connect(delegate).hasValidRole(signature, 'Role1', delegator.address)).to.be.false;
        });

        it('should return false if caller is no longer a delegate', async () => {
            await delegateManagerContract.connect(delegator).addDelegate(delegate.address);
            const signature = await delegator._signTypedData(domain, types, message);
            expect(await delegateManagerContract.connect(delegate).hasValidRole(signature, 'Role1', delegator.address)).to.be.true;

            await expect(delegateManagerContract.connect(delegator).removeDelegate(delegate.address));
            expect(await delegateManagerContract.connect(delegate).hasValidRole(signature, 'Role1', delegator.address)).to.be.false;
        });
    });
});
