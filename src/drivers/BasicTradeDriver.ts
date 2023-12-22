import { Event, Signer } from 'ethers';
import { BasicTrade as BasicTradeContract, BasicTrade__factory } from '../smart-contracts';
import { TradeDriver } from './TradeDriver';
import { IConcreteTradeDriver } from './IConcreteTradeDriver';
import { BasicTrade } from '../entities/BasicTrade';
import { Line, LineRequest } from '../entities/Trade';
import { Trade } from '../smart-contracts/contracts/BasicTrade';
import { EntityBuilder } from '../utils/EntityBuilder';

export class BasicTradeDriver extends TradeDriver implements IConcreteTradeDriver {
    private _actual: BasicTradeContract;
    
    constructor(signer: Signer, basicTradeAddress: string) {
        super(signer, basicTradeAddress);
        this._actual = BasicTrade__factory
            .connect(basicTradeAddress, signer.provider!)
            .connect(signer);
    }

    async getTrade(): Promise<BasicTrade> {
        const result = await this._actual.getTrade();
        const lines: Line[] | undefined = await this.getLines();
        const linesMap: Map<number, Line> = new Map<number, Line>();
        lines?.forEach((line: Line) => {
            linesMap.set(line.id, line);
        });

        return new BasicTrade(
            result[0].toNumber(),
            result[1],
            result[2],
            result[3],
            result[4],
            linesMap,
            result[6],
        );
    }

    async getLines(): Promise<Line[]> {
        const result: Trade.LineStructOutput[] = await this._actual.getLines();
        return result ? result.map((line: Trade.LineStructOutput) => EntityBuilder.buildTradeLine(line)) : [];
    }

    async getLine(id: number): Promise<Line> {
        const result: Trade.LineStructOutput = await this._actual.getLine(id);
        return EntityBuilder.buildTradeLine(result);
    }

    async addLine(line: LineRequest): Promise<Line> {
        const tx: any = await this._actual.addLine(line.materialsId, line.productCategory);
        const receipt = await tx.wait();
        const id = receipt.events.find((event: Event) => event.event === 'TradeLineAdded').args[0];
        return this.getLine(id);
    }

    async updateLine(line: Line): Promise<Line> {
        const tx = await this._actual.updateLine(line.id, line.materialsId, line.productCategory);
        await tx.wait();
        return this.getLine(line.id);
    }

    async setName(name: string): Promise<void> {
        const tx = await this._actual.setName(name);
        await tx.wait();
    }
}
