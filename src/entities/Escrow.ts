import { EscrowStatus } from '../types/EscrowStatus';

export class Escrow {
    private _payee: string;

    private _purchaser: string;

    private _payers: string[];

    private _agreedAmount: number;

    private _deployedAt: number;

    private _duration: number;

    private _state: EscrowStatus;

    private _tokenAddress: string;

    private _commissioner: string;

    private _baseFee: number;

    private _percentageFee: number;

    constructor(
        payee: string,
        purchaser: string,
        payers: string[],
        agreedAmount: number,
        deployedAt: number,
        duration: number,
        state: EscrowStatus,
        tokenAddress: string,
        commissioner: string,
        baseFee: number,
        percentageFee: number
    ) {
        this._payee = payee;
        this._purchaser = purchaser;
        this._payers = payers;
        this._agreedAmount = agreedAmount;
        this._deployedAt = deployedAt;
        this._duration = duration;
        this._state = state;
        this._tokenAddress = tokenAddress;
        this._commissioner = commissioner;
        this._baseFee = baseFee;
        this._percentageFee = percentageFee;
    }

    get payee(): string {
        return this._payee;
    }

    set payee(value: string) {
        this._payee = value;
    }

    get purchaser(): string {
        return this._purchaser;
    }

    set purchaser(value: string) {
        this._purchaser = value;
    }

    get payers(): string[] {
        return this._payers;
    }

    set payers(value: string[]) {
        this._payers = value;
    }

    get agreedAmount(): number {
        return this._agreedAmount;
    }

    set agreedAmount(value: number) {
        this._agreedAmount = value;
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

    get tokenAddress(): string {
        return this._tokenAddress;
    }

    set tokenAddress(value: string) {
        this._tokenAddress = value;
    }

    get commissioner(): string {
        return this._commissioner;
    }

    set commissioner(value: string) {
        this._commissioner = value;
    }

    get baseFee(): number {
        return this._baseFee;
    }

    set baseFee(value: number) {
        this._baseFee = value;
    }

    get percentageFee(): number {
        return this._percentageFee;
    }

    set percentageFee(value: number) {
        this._percentageFee = value;
    }
}
