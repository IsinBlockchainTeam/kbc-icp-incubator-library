import {Signer} from "ethers";
import {MyToken, MyToken__factory} from "../smart-contracts";

export class TokenDriver {
    private readonly _contract: MyToken;

    constructor(signer: Signer, tokenAddress: string) {
        this._contract = MyToken__factory.connect(tokenAddress, signer.provider!).connect(signer);
    }

    async balanceOf(address: string): Promise<number> {
        return (await this._contract.balanceOf(address)).toNumber();
    }

    async getSymbol(): Promise<string> {
        return this._contract.symbol();
    }

    async approve(spender: string, amount: number): Promise<void> {
        const tx = await this._contract.approve(spender, amount);
        await tx.wait();
    }

    async transfer(to: string, amount: number): Promise<void> {
        const tx = await this._contract.transfer(to, amount);
        await tx.wait();
    }
}
