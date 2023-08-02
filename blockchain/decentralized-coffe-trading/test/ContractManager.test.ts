/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ContractName } from '../utils/constants';

let contractManagerContract: Contract;
let enumerableFiatManagerContract: Contract;
let enumerableProductCategoryManagerContract: Contract;
let owner: SignerWithAddress;
let admin: SignerWithAddress;
let supplier: SignerWithAddress;
let customer: SignerWithAddress;
let orderManager: SignerWithAddress;
let otherAccount: SignerWithAddress;
let contractCounterId: BigNumber;

describe('ContractManager', () => {
    const rawContract = {
        externalUrl: 'https://testurl.ch',
    };

    before(async () => {
        [owner, admin, supplier, customer, orderManager, otherAccount] = await ethers.getSigners();

        const ContractManager = await ethers.getContractFactory(ContractName.CONTRACT_MANAGER);
        const EnumerableFiatManager = await ethers.getContractFactory(ContractName.ENUMERABLE_TYPE_MANAGER);
        const EnumerableProductCategoryManager = await ethers.getContractFactory(ContractName.ENUMERABLE_TYPE_MANAGER);

        enumerableFiatManagerContract = await EnumerableFiatManager.deploy();
        await enumerableFiatManagerContract.deployed();
        await enumerableFiatManagerContract.add('CHF');

        enumerableProductCategoryManagerContract = await EnumerableProductCategoryManager.deploy();
        await enumerableProductCategoryManagerContract.deployed();
        await enumerableProductCategoryManagerContract.add('categoryA');
        await enumerableProductCategoryManagerContract.add('categoryB');

        contractManagerContract = await ContractManager.deploy([admin.address], enumerableFiatManagerContract.address, enumerableProductCategoryManagerContract.address);
        await contractManagerContract.deployed();
    });

    describe('registerContract', () => {
        it('should register and retrieve a contract', async () => {
            await contractManagerContract.connect(supplier).registerContract(supplier.address, customer.address, customer.address, rawContract.externalUrl);
            contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);

            const contract = await contractManagerContract.connect(supplier).getContractInfo(supplier.address, contractCounterId.toNumber());
            expect(contract.id).to.equal(contractCounterId.toNumber());
            expect(contract.supplier).to.equal(supplier.address);
            expect(contract.customer).to.equal(customer.address);
            expect(contract.offeree).to.equal(customer.address);
            expect(contract.offeror).to.equal(supplier.address);
            expect(contract.offerorSigned).to.be.undefined;
            expect(contract.offereeSigned).to.be.undefined;
            expect(contract.externalUrl).to.equal(rawContract.externalUrl);
        });

        it('should register a contract - FAIL (sender is neither supplier nor customer)', async () => {
            await expect(contractManagerContract.connect(otherAccount).registerContract(supplier.address, customer.address, customer.address, rawContract.externalUrl)).to.be.revertedWith('Sender is neither supplier nor customer');
        });

        it('should try to retrieve a contract - FAIL(Contract does not exist)', async () => {
            await expect(contractManagerContract.connect(supplier).getContractInfo(supplier.address, 50)).to.be.revertedWith('Contract does not exist');
        });

        it('should emit ContractRegistered event', async () => {
            contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
            await expect(contractManagerContract.connect(supplier).registerContract(supplier.address, customer.address, customer.address, rawContract.externalUrl))
                .to.emit(contractManagerContract, 'ContractRegistered')
                .withArgs(contractCounterId.toNumber() + 1, supplier.address);
        });

        it('should check if contract exists', async () => {
            await contractManagerContract.connect(supplier).registerContract(supplier.address, customer.address, customer.address, rawContract.externalUrl);
            contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
            const exist = await contractManagerContract.connect(supplier).contractExists(supplier.address, contractCounterId.toNumber());
            expect(exist).to.be.true;
        });
    });

    describe('manipulate contract by adding/updating lines', () => {
        let contractLineCounterId: BigNumber;
        const initialProductCategory = 'categoryA';
        const price = {
            amount: BigNumber.from(100),
            decimals: BigNumber.from(2),
            fiat: 'CHF',
        };
        const contractLine = {
            id: BigNumber.from(0),
            productCategory: initialProductCategory,
            quantity: BigNumber.from(10),
            price,
            exists: true,
        };

        before(async () => {
            await contractManagerContract.connect(supplier).registerContract(supplier.address, customer.address, customer.address, rawContract.externalUrl);
            contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
        });

        describe('addContractLine', () => {
            it('should add and retrieve a contract line', async () => {
                await contractManagerContract.connect(supplier).addContractLine(supplier.address, contractCounterId.toNumber(), contractLine);

                const { lineIds } = await contractManagerContract.connect(supplier).getContractInfo(supplier.address, contractCounterId.toNumber());
                contractLineCounterId = lineIds.slice(-1)[0];

                const savedContractLine = await contractManagerContract.connect(supplier).getContractLine(supplier.address, contractCounterId.toNumber(), contractLineCounterId.toNumber());
                expect(savedContractLine.id.toNumber()).to.equal(contractLineCounterId.toNumber());
                expect(savedContractLine.productCategory.toString()).to.equal(initialProductCategory);
                expect(savedContractLine.quantity.toNumber()).to.equal(10);
                expect(savedContractLine.price.fiat).to.equal(price.fiat);
                expect(savedContractLine.price.amount.toNumber()).to.equal(price.amount);
                expect(savedContractLine.price.decimals.toNumber()).to.equal(price.decimals);
            });

            it('should emit ContractLineAdded event', async () => {
                contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
                const { lineIds } = await contractManagerContract.connect(supplier).getContractInfo(supplier.address, contractCounterId.toNumber());
                contractLineCounterId = lineIds.slice(-1)[0];

                await expect(contractManagerContract.connect(supplier).addContractLine(supplier.address, contractCounterId.toNumber(), contractLine))
                    .to.emit(contractManagerContract, 'ContractLineAdded')
                    .withArgs(contractCounterId.toNumber(), supplier.address, contractLineCounterId.toNumber() + 1);
            });

            it('should add a contract line - FAIL (Contract does not exist)', async () => {
                const otherContractId = 50;
                await expect(contractManagerContract.connect(supplier).addContractLine(supplier.address, otherContractId, contractLine)).to.be.revertedWith('Contract does not exist');
            });

            it('should add a contract line - FAIL (Sender is neither offeree nor offeror)', async () => {
                await expect(contractManagerContract.connect(otherAccount).addContractLine(supplier.address, contractCounterId.toNumber(), contractLine)).to.be.revertedWith('Sender is neither offeree nor offeror');
            });

            it('should add a contract line - FAIL (The fiat of the contract line isn\'t registered)', async () => {
                const oldFiat = contractLine.price.fiat;
                contractLine.price.fiat = 'FIAT';
                contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
                await expect(contractManagerContract.connect(supplier).addContractLine(supplier.address, contractCounterId.toNumber(), contractLine)).to.be.revertedWith("The fiat of the contract line isn't registered");
                contractLine.price.fiat = oldFiat;
            });

            it('should add a contract line - FAIL (The contract has been confirmed, it cannot be changed)', async () => {
                contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
                contractManagerContract.connect(supplier).confirmContract(supplier.address, contractCounterId);
                contractManagerContract.connect(customer).confirmContract(supplier.address, contractCounterId);

                await expect(contractManagerContract.connect(supplier).addContractLine(supplier.address, contractCounterId.toNumber(), contractLine)).to.be.revertedWith('The contract has been confirmed, it cannot be changed');
            });
        });

        describe('getContractLine', () => {
            before(async () => {
                await contractManagerContract.connect(supplier).registerContract(supplier.address, customer.address, customer.address, rawContract.externalUrl);
                contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
                await contractManagerContract.connect(supplier).addContractLine(supplier.address, contractCounterId.toNumber(), contractLine);
                const { lineIds } = await contractManagerContract.connect(supplier).getContractInfo(supplier.address, contractCounterId.toNumber());
                contractLineCounterId = lineIds.slice(-1)[0];
            });

            it('should get an contract line', async () => {
                const cl = await contractManagerContract.connect(supplier).getContractLine(supplier.address, contractCounterId.toNumber(), contractLineCounterId.toNumber());
                expect(cl.id.toNumber()).to.equal(contractLineCounterId.toNumber());
                expect(cl.productCategory.toString()).to.equal(initialProductCategory);
                expect(cl.quantity.toNumber()).to.equal(10);

                expect(cl.price.fiat).to.equal(price.fiat);
                expect(cl.price.amount.toNumber()).to.equal(price.amount);
                expect(cl.price.decimals.toNumber()).to.equal(price.decimals);
            });

            it('should get an contract line - FAIL (Contract does not exist)', async () => {
                const otherContractId = 50;
                await expect(contractManagerContract.connect(supplier).getContractLine(supplier.address, otherContractId, contractLineCounterId.toNumber())).to.be.revertedWith('Contract does not exist');
            });
        });

        describe('updateContractLine', () => {
            // ...contractLine non effettua una deep copy dei nested object (price)
            //     const updatedContractLine = { ...contractLine, productCategory: 'categoryUpdated' };
            const updatedContractLine = {
                ...JSON.parse(JSON.stringify(contractLine)),
                productCategory: 'categoryUpdated',
            };

            before(async () => {
                contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
                await contractManagerContract.connect(supplier).addContractLine(supplier.address, contractCounterId.toNumber(), contractLine);
                const { lineIds } = await contractManagerContract.connect(supplier).getContractInfo(supplier.address, contractCounterId.toNumber());
                contractLineCounterId = lineIds.slice(-1)[0];
            });

            it('should update a contract line', async () => {
                await contractManagerContract.connect(supplier).updateContractLine(supplier.address, contractCounterId.toNumber(), contractLineCounterId.toNumber(), updatedContractLine);

                const savedContractLine = await contractManagerContract.connect(supplier).getContractLine(supplier.address, contractCounterId.toNumber(), contractLineCounterId.toNumber());
                expect(savedContractLine.id.toNumber()).to.equal(contractLineCounterId.toNumber());
                expect(savedContractLine.productCategory.toString()).to.not.equal(initialProductCategory);
                expect(savedContractLine.productCategory.toString()).to.equal(updatedContractLine.productCategory);
            });

            it('should emit ContractLineUpdated event', async () => {
                await expect(contractManagerContract.connect(supplier).updateContractLine(supplier.address, contractCounterId.toNumber(), contractLineCounterId.toNumber(), updatedContractLine))
                    .to.emit(contractManagerContract, 'ContractLineUpdated')
                    .withArgs(contractCounterId.toNumber(), supplier.address, contractLineCounterId.toNumber());
            });

            it('should update a contract line - FAIL (Contract does not exist)', async () => {
                const otherContractId = 50;
                await expect(contractManagerContract.connect(supplier).updateContractLine(supplier.address, otherContractId, contractLineCounterId.toNumber(), updatedContractLine)).to.be.revertedWith('Contract does not exist');
            });

            it('should update a contract line - FAIL (Sender is neither offeree nor offeror)', async () => {
                await expect(contractManagerContract.connect(otherAccount).updateContractLine(supplier.address, contractCounterId.toNumber(), contractLineCounterId.toNumber(), updatedContractLine)).to.be.revertedWith('Sender is neither offeree nor offeror');
            });

            it('should update a contract line - FAIL (The fiat of the contract line isn\'t registered)', async () => {
                updatedContractLine.price.fiat = 'FIAT';
                await expect(contractManagerContract.connect(supplier).updateContractLine(supplier.address, contractCounterId.toNumber(), contractLineCounterId.toNumber(), updatedContractLine)).to.be.revertedWith("The fiat of the contract line isn't registered");
            });
        });

        describe('getContractStatus', () => {
            let contractStatus;

            before(async () => {
                await contractManagerContract.connect(supplier).registerContract(supplier.address, customer.address, customer.address, rawContract.externalUrl);
                contractCounterId = await contractManagerContract.connect(supplier).getContractCounter(supplier.address);
            });

            it('should try to get contract status - FAIL (Contract does not exist)', async () => {
                await expect(contractManagerContract.connect(supplier).getContractStatus(supplier.address, 50)).to.be.revertedWith('Contract does not exist');
            });

            it('neither supplier nor customer have been confirmed the contract, result = INITIALIZED', async () => {
                contractStatus = await contractManagerContract.connect(supplier).getContractStatus(supplier.address, contractCounterId.toNumber());
                expect(contractStatus).to.equal(0);
            });

            it('the supplier should change the contract status by adding line, result = PENDING', async () => {
                await contractManagerContract.connect(supplier).addContractLine(supplier.address, contractCounterId, contractLine);
                contractStatus = await contractManagerContract.connect(supplier).getContractStatus(supplier.address, contractCounterId.toNumber());
                expect(contractStatus).to.equal(1);
            });

            it('the customer should change again the contract by adding a line, result = PENDING', async () => {
                await contractManagerContract.connect(customer).addContractLine(supplier.address, contractCounterId, contractLine);
                contractStatus = await contractManagerContract.connect(customer).getContractStatus(supplier.address, contractCounterId.toNumber());
                expect(contractStatus).to.equal(1);
            });

            it('the supplier should try to confirm the contract - FAIL (Only an offeree or an offeror can confirm the contract)', async () => {
                await expect(contractManagerContract.connect(otherAccount).confirmContract(supplier.address, contractCounterId)).to.be.revertedWith('Only an offeree or an offeror can confirm the contract');
            });

            it('the supplier should confirm the contract, result = CONFIRMED', async () => {
                await contractManagerContract.connect(supplier).confirmContract(supplier.address, contractCounterId);
                contractStatus = await contractManagerContract.connect(supplier).getContractStatus(supplier.address, contractCounterId.toNumber());
                expect(contractStatus).to.equal(2);
            });
        });
    });

    describe('isSupplierOrCustomer', () => {
        it('should check that the sender is supplier or customer', async () => {
            const isParty = await contractManagerContract.connect(supplier).isSupplierOrCustomer(supplier.address, contractCounterId, customer.address);
            expect(isParty).to.be.true;
        });

        it('should check that the sender is supplier or customer', async () => {
            const isParty = await contractManagerContract.connect(supplier).isSupplierOrCustomer(supplier.address, contractCounterId, otherAccount.address);
            expect(isParty).to.be.false;
        });
    });

    describe('roles', () => {
        it('should add and remove admin roles', async () => {
            await contractManagerContract.connect(owner).addAdmin(admin.address);
            expect(await contractManagerContract.hasRole(await contractManagerContract.ADMIN_ROLE(), admin.address)).to.be.true;
            await contractManagerContract.connect(owner).removeAdmin(admin.address);
            expect(await contractManagerContract.hasRole(await contractManagerContract.ADMIN_ROLE(), admin.address)).to.be.false;
        });

        it('should fail to add and remove admin roles if the caller is not an admin', async () => {
            await expect(contractManagerContract.connect(supplier).addAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
            await expect(contractManagerContract.connect(supplier).removeAdmin(admin.address)).to.be.revertedWith('Caller is not the admin');
        });
    });
});
