import { Event, Signer } from 'ethers';
import {
    BasicTrade as BasicTradeContract,
    BasicTrade__factory,
    MaterialManager, MaterialManager__factory,
    ProductCategoryManager, ProductCategoryManager__factory,
} from '../smart-contracts';
import { TradeDriver } from './TradeDriver';
import { IConcreteTradeDriverInterface } from './IConcreteTradeDriver.interface';
import { BasicTrade } from '../entities/BasicTrade';
import { Line, LineRequest } from '../entities/Trade';
import { Trade } from '../smart-contracts/contracts/BasicTrade';
import { EntityBuilder } from '../utils/EntityBuilder';

export class BasicTradeDriver extends TradeDriver implements IConcreteTradeDriverInterface {
    private _basicTradeContract: BasicTradeContract;

    private _materialContract: MaterialManager;

    private _productCategoryContract: ProductCategoryManager;

    constructor(signer: Signer, basicTradeAddress: string, materialManagerAddress: string, productCategoryManagerAddress: string) {
        super(signer, basicTradeAddress);
        this._basicTradeContract = BasicTrade__factory
            .connect(basicTradeAddress, signer.provider!)
            .connect(signer);

        this._materialContract = MaterialManager__factory
            .connect(materialManagerAddress, signer.provider!)
            .connect(signer);

        this._productCategoryContract = ProductCategoryManager__factory
            .connect(productCategoryManagerAddress, signer.provider!)
            .connect(signer);
    }

    async getTrade(blockNumber?: number): Promise<BasicTrade> {
        const result = await this._basicTradeContract.getTrade({ blockTag: blockNumber });
        const lines: Line[] = await this.getLines();

        return new BasicTrade(
            result[0].toNumber(),
            result[1],
            result[2],
            result[3],
            result[4],
            lines,
            result[6],
        );
    }

    async getLines(): Promise<Line[]> {
        const counter: number = await this.getLineCounter();

        const promises = [];
        for (let i = 1; i <= counter; i++) {
            promises.push(this.getLine(i));
        }

        return Promise.all(promises);
    }

    async getLine(id: number, blockNumber?: number): Promise<Line> {
        const line: Trade.LineStructOutput = await this._basicTradeContract.getLine(id, { blockTag: blockNumber });

        let materialStruct: MaterialManager.MaterialStructOutput | undefined;
        if (line.materialId.toNumber() !== 0)
            materialStruct = await this._materialContract.getMaterial(line.materialId);

        return EntityBuilder.buildTradeLine(line, await this._productCategoryContract.getProductCategory(line.productCategoryId), materialStruct);
    }

    async addLine(line: LineRequest): Promise<Line> {
        const tx: any = await this._basicTradeContract.addLine(line.productCategoryId);
        const receipt = await tx.wait();
        const id = receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
        return this.getLine(id);
    }

    async updateLine(line: Line): Promise<Line> {
        const tx = await this._basicTradeContract.updateLine(line.id, line.productCategory.id);
        await tx.wait();
        if (line.material)
            await this.assignMaterial(line.id, line.material.id);

        return this.getLine(line.id);
    }

    async assignMaterial(lineId: number, materialId: number): Promise<void> {
        const tx = await this._basicTradeContract.assignMaterial(lineId, materialId);
        await tx.wait();
    }

    async setName(name: string): Promise<void> {
        const tx = await this._basicTradeContract.setName(name);
        await tx.wait();
    }
}
