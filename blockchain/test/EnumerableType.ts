import { ethers } from 'hardhat';
import { expect } from 'chai';
// @ts-ignore

describe('EnumerableType', () => {

    let snapshotID: Promise<any>;

    beforeEach(async () => {
        snapshotID = await ethers.provider.send('evm_snapshot', []);
    });

    afterEach(async () => {
        await ethers.provider.send('evm_revert', [snapshotID]);
    });


    it('constructor should add admin role to owner', async () => {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAddr, mockContractAddr] = await ethers.getSigners();
        const enumerableTypeFactory = await ethers.getContractFactory('EnumerableType');
        const enumerableType = await enumerableTypeFactory.deploy();

        expect(await enumerableType.hasRole(enumerableType.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

    });

    it('contains should behave correctly', async () => {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAddr, mockContractAddr] = await ethers.getSigners();
        const enumerableTypeFactory = await ethers.getContractFactory('EnumerableType');
        const enumerableType = await enumerableTypeFactory.deploy();

        expect(await enumerableType.contains('test')).to.be.false;
        await enumerableType.add( 'test');
        expect(await enumerableType.contains('test')).to.be.true;
    });

    it('should correctly add types', async () => {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAddr, mockContractAddr] = await ethers.getSigners();
        const enumerableTypeFactory = await ethers.getContractFactory('EnumerableType');
        const enumerableType = await enumerableTypeFactory.deploy();


        await enumerableType.add('test');
        const contained = await enumerableType.contains('test');
        expect(contained).to.eq(true);
    });

    it('add should revert if name already contained', async () => {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAddr, mockContractAddr] = await ethers.getSigners();
        const enumerableTypeFactory = await ethers.getContractFactory('EnumerableType');
        const enumerableType = await enumerableTypeFactory.deploy();

        await enumerableType.add( 'test');
        await expect(enumerableType.add( 'test')).to.be.rejectedWith('EnumTypeAlreadyAvailable');

    });

    it('add should not work if account not owner', async () => {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAddr1, otherAddr2] = await ethers.getSigners();
        const enumerableTypeFactory = await ethers.getContractFactory('EnumerableType');
        const enumerableType = await enumerableTypeFactory.deploy();

        const newConnection = await enumerableType.connect(otherAddr1);

        await expect(newConnection.add( 'test')).to.be.rejectedWith('AccessControl');
    });

    it('remove should revert if name not present', async () => {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAddr, mockContractAddr] = await ethers.getSigners();
        const enumerableTypeFactory = await ethers.getContractFactory('EnumerableType');
        const enumerableType = await enumerableTypeFactory.deploy();

        await expect(enumerableType.remove('test')).to.be.rejectedWith('EnumTypeNotFound');
    });

    it('remove should work if name is present', async () => {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAddr, mockContractAddr] = await ethers.getSigners();
        const enumerableTypeFactory = await ethers.getContractFactory('EnumerableType');
        const enumerableType = await enumerableTypeFactory.deploy();

        await enumerableType.add( 'test1');
        await enumerableType.add( 'test2');
        await enumerableType.add( 'test3');
        await expect(enumerableType.remove('test2')).not.to.be.rejectedWith('EnumTypeNotFound');
        expect(await enumerableType.getTypeListLength()).to.eq(2);
    });

    it('remove should not work if account not owner', async () => {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAddr1, otherAddr2] = await ethers.getSigners();
        const enumerableTypeFactory = await ethers.getContractFactory('EnumerableType');
        const enumerableType = await enumerableTypeFactory.deploy();

        await expect(enumerableType.add( 'test')).not.to.be.rejectedWith('AccessControl');

        const newConnection = await enumerableType.connect(otherAddr1);

        await expect(newConnection.remove('test')).to.be.rejectedWith('AccessControl');
    });

    it('getTypeListLength should return the right length', async () => {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAddr1, otherAddr2] = await ethers.getSigners();
        const enumerableTypeFactory = await ethers.getContractFactory('EnumerableType');
        const enumerableType = await enumerableTypeFactory.deploy();

        await enumerableType.add( 'test1');
        await enumerableType.add( 'test2');
        await enumerableType.add( 'test3');

        const len = await enumerableType.getTypeListLength();
        expect(len).to.equal(3);
    });

});
