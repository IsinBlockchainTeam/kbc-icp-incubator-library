import { BigNumber, Signer } from 'ethers';
import { BasicTrade as BasicTradeContract, BasicTrade__factory } from '../smart-contracts';
import { TradeDriver } from './TradeDriver';

export class BasicTradeDriver extends TradeDriver {
    private _actual: BasicTradeContract;
    
    constructor(signer: Signer, basicTradeAddress: string) {
        super(signer, basicTradeAddress);
        this._actual = BasicTrade__factory
            .connect(basicTradeAddress, signer.provider!)
            .connect(signer);
    }

    async getBasicTrade(): Promise<{ tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lineIds: number[], name: string}> {
        const result = await this._actual.getBasicTrade();

        return {
            tradeId: result[0].toNumber(),
            supplier: result[1],
            customer: result[2],
            commissioner: result[3],
            externalUrl: result[4],
            lineIds: result[5].map((value: BigNumber) => value.toNumber()),
            name: result[6],
        };
    }

    async setName(name: string): Promise<void> {
        const tx = await this._actual.setName(name);
        await tx.wait();
    }
}
