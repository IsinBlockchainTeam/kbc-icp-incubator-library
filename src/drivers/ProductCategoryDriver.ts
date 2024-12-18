import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { EntityBuilder } from '../utils/EntityBuilder';
import { ProductCategory } from '../entities/ProductCategory';
import { HandleIcpError } from '../decorators/HandleIcpError';

export class ProductCategoryDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    @HandleIcpError()
    async getProductCategories(): Promise<ProductCategory[]> {
        const resp = await this._actor.getProductCategories();
        return resp.map((rawProductCategory) =>
            EntityBuilder.buildProductCategory(rawProductCategory)
        );
    }

    @HandleIcpError()
    async getProductCategory(id: number): Promise<ProductCategory> {
        const resp = await this._actor.getProductCategory(BigInt(id));
        return EntityBuilder.buildProductCategory(resp);
    }

    @HandleIcpError()
    async createProductCategory(name: string, quality: number, description: string) {
        const resp = await this._actor.createProductCategory(name, BigInt(quality), description);
        return EntityBuilder.buildProductCategory(resp);
    }

    @HandleIcpError()
    async updateProductCategory(id: number, name: string, quality: number, description: string) {
        const resp = await this._actor.updateProductCategory(
            BigInt(id),
            name,
            BigInt(quality),
            description
        );
        return EntityBuilder.buildProductCategory(resp);
    }

    async deleteProductCategory(id: number): Promise<boolean> {
        return this._actor.deleteProductCategory(BigInt(id));
    }
}
