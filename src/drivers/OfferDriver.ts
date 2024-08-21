/* eslint-disable camelcase */

import { Signer, utils } from 'ethers';
import {
    OfferManager,
    OfferManager__factory,
    ProductCategoryManager,
    ProductCategoryManager__factory
} from '../smart-contracts';
import { Offer } from '../entities/Offer';
import { EntityBuilder } from '../utils/EntityBuilder';
import { RoleProof } from '../types/RoleProof';

export class OfferDriver {
    private _offerManagerContract: OfferManager;

    private _productCategoryManagerContract: ProductCategoryManager;

    constructor(
        signer: Signer,
        offerManagerAddress: string,
        productCategoryManagerAddress: string
    ) {
        this._offerManagerContract = OfferManager__factory.connect(
            offerManagerAddress,
            signer.provider!
        ).connect(signer);
        this._productCategoryManagerContract = ProductCategoryManager__factory.connect(
            productCategoryManagerAddress,
            signer.provider!
        ).connect(signer);
    }

    async registerSupplier(companyAddress: string, name: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');
        const tx = await this._offerManagerContract.registerSupplier(companyAddress, name);
        await tx.wait();
    }

    async registerOffer(
        roleProof: RoleProof,
        companyAddress: string,
        productCategoryId: number
    ): Promise<void> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');
        const tx = await this._offerManagerContract.registerOffer(
            roleProof,
            companyAddress,
            productCategoryId
        );
        await tx.wait();
    }

    async getLastId(): Promise<number> {
        const counter = await this._offerManagerContract.getLastId();
        return counter.toNumber();
    }

    async getOfferIdsByCompany(companyAddress: string): Promise<number[]> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');

        const ids = await this._offerManagerContract.getOfferIdsByCompany(companyAddress);
        return ids.map((id) => id.toNumber());
    }

    async getSupplierName(companyAddress: string, blockNumber?: number): Promise<string> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');
        return this._offerManagerContract.getSupplierName(companyAddress, {
            blockTag: blockNumber
        });
    }

    async getOffer(roleProof: RoleProof, offerId: number, blockNumber?: number): Promise<Offer> {
        const rawOffer = await this._offerManagerContract.getOffer(offerId, {
            blockTag: blockNumber
        });
        const rawProductCategory = await this._productCategoryManagerContract.getProductCategory(
            roleProof,
            rawOffer.productCategoryId
        );
        return EntityBuilder.buildOffer(rawOffer, rawProductCategory);
    }

    async updateSupplier(companyAddress: string, newName: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) throw new Error('Not an address');
        const tx = await this._offerManagerContract.updateSupplier(companyAddress, newName);
        await tx.wait();
    }

    async updateOffer(
        roleProof: RoleProof,
        offerId: number,
        productCategoryId: number
    ): Promise<void> {
        const tx = await this._offerManagerContract.updateOffer(
            roleProof,
            offerId,
            productCategoryId
        );
        await tx.wait();
    }

    async deleteSupplier(companyAddress: string): Promise<void> {
        const tx = await this._offerManagerContract.deleteSupplier(companyAddress);
        await tx.wait();
    }

    async deleteOffer(offerId: number): Promise<void> {
        const tx = await this._offerManagerContract.deleteOffer(offerId);
        await tx.wait();
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._offerManagerContract.addAdmin(address);
        await tx.wait();
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');
        const tx = await this._offerManagerContract.removeAdmin(address);
        await tx.wait();
    }
}
