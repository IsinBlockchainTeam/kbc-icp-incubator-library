import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { ContractName } from '../utils/constants';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('DelegateManager', () => {
    let delegateManagerContract: Contract;
    let delegator: SignerWithAddress, delegate: SignerWithAddress, other: SignerWithAddress;

    const domain = {
        name: 'Test Delegate Manager',
        version: '1.0.1',
        chainId: 31337
    };
    const types = {
        RoleDelegation: [
            { name: 'delegateAddress', type: 'address' },
            { name: 'role', type: 'string' }
        ]
    };

    before(async () => {
        [delegator, delegate, other] = await ethers.getSigners();
    });

    beforeEach(async () => {
        const DelegateManager = await ethers.getContractFactory(ContractName.DELEGATE_MANAGER);
        delegateManagerContract = await DelegateManager.deploy(domain.name, domain.version, domain.chainId);
        await delegateManagerContract.deployed();
    });

    it('should have been deployed', async () => {
        expect(delegateManagerContract.address).to.properAddress;
    });

    it('should check for a role', async () => {
        await delegateManagerContract.addDelegate(delegate.address);
        const message = {
            delegateAddress: delegate.address,
            role: 'Role1'
        };
        console.log('delegator:', delegator.address);
        console.log('delegate:', delegate.address);
        const signature = await delegator._signTypedData(domain, types, message);

        const hasRole = await delegateManagerContract.connect(delegate).hasRole(signature, 'Role1', delegator.address);
        expect(hasRole).to.be.true;
    });
});
