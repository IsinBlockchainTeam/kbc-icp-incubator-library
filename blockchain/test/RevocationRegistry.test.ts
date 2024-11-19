import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { ContractName } from '../constants/contracts';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';

describe('RevocationRegistry', () => {
    let revocationRegistryContract: Contract;
    let signer1: SignerWithAddress, signer2: SignerWithAddress;

    const digest1 = ethers.utils.formatBytes32String('test');
    const digest2 = ethers.utils.formatBytes32String('another test');

    before(async () => {
        [signer1, signer2] = await ethers.getSigners();
    });

    beforeEach(async () => {
        const RevocationRegistry = await ethers.getContractFactory(ContractName.REVOCATION_REGISTRY);
        revocationRegistryContract = await RevocationRegistry.deploy();
        await revocationRegistryContract.deployed();
    });

    it('should not be revoked by default', async () => {
        expect(await revocationRegistryContract.revoked(signer1.address, digest1)).to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest1)).to.equal(0);
        expect(await revocationRegistryContract.revoked(signer1.address, digest2)).to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest2)).to.equal(0);
    });

    it('should let first entity revoke', async () => {
        await revocationRegistryContract.connect(signer1).revoke(digest1);
        expect(await revocationRegistryContract.revoked(signer1.address, digest1)).not.to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest1)).to.equal(0);
        expect(await revocationRegistryContract.revoked(signer1.address, digest2)).to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest2)).to.equal(0);
    });

    it('should let second entity revoke', async () => {
        await revocationRegistryContract.connect(signer2).revoke(digest1);
        expect(await revocationRegistryContract.revoked(signer1.address, digest1)).to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest1)).not.to.equal(0);
        expect(await revocationRegistryContract.revoked(signer1.address, digest2)).to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest2)).to.equal(0);
    });

    it('should let both entities revoke', async () => {
        await revocationRegistryContract.connect(signer1).revoke(digest1);
        await revocationRegistryContract.connect(signer2).revoke(digest1);
        expect(await revocationRegistryContract.revoked(signer1.address, digest1)).not.to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest1)).not.to.equal(0);
        expect(await revocationRegistryContract.revoked(signer1.address, digest2)).to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest2)).to.equal(0);
    });

    it('should recognize the digest being revoked', async () => {
        await revocationRegistryContract.connect(signer1).revoke(digest2);
        await revocationRegistryContract.connect(signer2).revoke(digest1);
        expect(await revocationRegistryContract.revoked(signer1.address, digest1)).to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest1)).not.to.equal(0);
        expect(await revocationRegistryContract.revoked(signer1.address, digest2)).not.to.equal(0);
        expect(await revocationRegistryContract.revoked(signer2.address, digest2)).to.equal(0);
    });

    it('should revoke', async () => {
        const jwt = '0x36004afc64c313d312f3e7d4acbbee78b9a17f842d2cb4032b4ed0b7d713790f';
        await revocationRegistryContract.connect(signer1).revoke(jwt);
        expect(await revocationRegistryContract.revoked(signer1.address, jwt)).not.to.equal(0);
    });
});
