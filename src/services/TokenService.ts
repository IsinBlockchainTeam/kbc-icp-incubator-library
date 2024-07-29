import {TokenDriver} from "../drivers/TokenDriver";

export class TokenService {
    private _tokenDriver: TokenDriver;
    constructor(tokenDriver: TokenDriver) {
        this._tokenDriver = tokenDriver;
    }
    async balanceOf(address: string): Promise<number> {
        return this._tokenDriver.balanceOf(address);
    }
    async getSymbol(): Promise<string> {
        return this._tokenDriver.getSymbol();
    }
    async approve(spender: string, amount: number): Promise<void> {
        return this._tokenDriver.approve(spender, amount);
    }
}
