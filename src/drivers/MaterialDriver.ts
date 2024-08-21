import { BigNumber, Event, Signer } from 'ethers';
import {
    MaterialManager,
    MaterialManager__factory,
    ProductCategoryManager,
    ProductCategoryManager__factory
} from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Material } from '../entities/Material';
import { RoleProof } from '../types/RoleProof';

export class MaterialDriver {
    private _materialContract: MaterialManager;

    private _productCategoryContract: ProductCategoryManager;

    constructor(
        signer: Signer,
        materialManagerAddress: string,
        productCategoryManagerAddress: string
    ) {
        this._materialContract = MaterialManager__factory.connect(
            materialManagerAddress,
            signer.provider!
        ).connect(signer);
        this._productCategoryContract = ProductCategoryManager__factory.connect(
            productCategoryManagerAddress,
            signer.provider!
        ).connect(signer);
    }

    async getMaterialsCounter(): Promise<number> {
        const counter = await this._materialContract.getMaterialsCounter();
        return counter.toNumber();
    }

    async getMaterialExists(id: number): Promise<boolean> {
        return this._materialContract.getMaterialExists(id);
    }

    async getMaterial(roleProof: RoleProof, id: number): Promise<Material> {
        const material = await this._materialContract.getMaterial(id);
        const productCategory = await this._productCategoryContract.getProductCategory(
            roleProof,
            material.productCategoryId
        );
        return EntityBuilder.buildMaterial(material, productCategory);
    }

    async getMaterials(roleProof: RoleProof): Promise<Material[]> {
        const counter: number = await this.getMaterialsCounter();

        const promises = [];
        for (let i = 1; i <= counter; i++) {
            promises.push(this.getMaterial(roleProof, i));
        }

        return Promise.all(promises);
    }

    async getMaterialsOfCreator(roleProof: RoleProof, creator: string): Promise<Material[]> {
        const ids: number[] = (await this._materialContract.getMaterialIdsOfCreator(creator)).map(
            (id: BigNumber) => id.toNumber()
        );

        const promises = ids.map((id: number) => this.getMaterial(roleProof, id));

        return Promise.all(promises);
    }

    async registerMaterial(roleProof: RoleProof, productCategoryId: number): Promise<number> {
        const tx: any = await this._materialContract.registerMaterial(roleProof, productCategoryId);
        const { events } = await tx.wait();

        if (!events) {
            throw new Error('Error during material registration, no events found');
        }
        return events
            .find((event: Event) => event.event === 'MaterialRegistered')
            .args.id.toNumber();
    }

    async updateMaterial(
        roleProof: RoleProof,
        id: number,
        productCategoryId: number
    ): Promise<void> {
        const tx: any = await this._materialContract.updateMaterial(
            roleProof,
            id,
            productCategoryId
        );
        await tx.wait();
    }
}
