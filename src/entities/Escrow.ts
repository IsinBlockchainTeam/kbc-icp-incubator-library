import {EscrowStatus} from "../types/EscrowStatus";

export class Escrow {
    private _payee: string;

    private _payer: string;

    private _deployedAt: number;

    private _duration: number;

    private _state: EscrowStatus;

    private _depositAmount: number;

    private _tokenAddress: string;

    //private _token: ERC20;

    constructor(payee: string, payer: string, deployedAt: number, duration: number, state: EscrowStatus, depositAmount: number, tokenAddress: string) {
        this._payee = payee;
        this._payer = payer;
        this._deployedAt = deployedAt;
        this._duration = duration;
        this._state = state;
        this._depositAmount = depositAmount;
        this._tokenAddress = tokenAddress;
    }

    get payee(): string {
        return this._payee;
    }

    set payee(value: string) {
        this._payee = value;
    }

    get payer(): string {
        return this._payer;
    }

    set payer(value: string) {
        this._payer = value;
    }

    get deployedAt(): number {
        return this._deployedAt;
    }

    set deployedAt(value: number) {
        this._deployedAt = value;
    }

    get duration(): number {
        return this._duration;
    }

    set duration(value: number) {
        this._duration = value;
    }

    get state(): EscrowStatus {
        return this._state;
    }

    set state(value: EscrowStatus) {
        this._state = value;
    }

    get depositAmount(): number {
        return this._depositAmount;
    }

    set depositAmount(value: number) {
        this._depositAmount = value;
    }

    get tokenAddress(): string {
        return this._tokenAddress;
    }

    set tokenAddress(value: string) {
        this._tokenAddress = value;
    }
}