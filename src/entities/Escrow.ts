import { EscrowStatus } from '../types/EscrowStatus';

export class Escrow {
    private _payee: string;

    private _deployedAt: number;

    private _duration: number;

    private _tokenAddress: string;

    private _state: EscrowStatus;

    private _feeRecipient: string;

    private _baseFee: number;

    private _percentageFee: number;

    constructor(
        payee: string,
        deployedAt: number,
        duration: number,
        tokenAddress: string,
        state: EscrowStatus,
        feeRecipient: string,
        baseFee: number,
        percentageFee: number
    ) {
        this._payee = payee;
        this._deployedAt = deployedAt;
        this._duration = duration;
        this._tokenAddress = tokenAddress;
        this._state = state;
        this._feeRecipient = feeRecipient;
        this._baseFee = baseFee;
        this._percentageFee = percentageFee;
    }

    get payee(): string {
        return this._payee;
    }

    set payee(value: string) {
        this._payee = value;
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

    get tokenAddress(): string {
        return this._tokenAddress;
    }

    set tokenAddress(value: string) {
        this._tokenAddress = value;
    }

    get state(): EscrowStatus {
        return this._state;
    }

    set state(value: EscrowStatus) {
        this._state = value;
    }

    get feeRecipient(): string {
        return this._feeRecipient;
    }

    set feeRecipient(value: string) {
        this._feeRecipient = value;
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
