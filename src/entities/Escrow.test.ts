import {Escrow} from "./Escrow";
import {EscrowStatus} from "../types/EscrowStatus";

describe('Escrow', () => {
    let escrow: Escrow;

    beforeAll(() => {
        escrow = new Escrow('payee', 'payer', 0, 100, EscrowStatus.ACTIVE, 100, 'tokenAddress');
    });

    it('should correctly initialize a new Escrow', () => {
        expect(escrow.payee).toEqual('payee');
        expect(escrow.payer).toEqual('payer');
        expect(escrow.deployedAt).toEqual(0);
        expect(escrow.duration).toEqual(100);
        expect(escrow.state).toEqual(EscrowStatus.ACTIVE);
        expect(escrow.depositAmount).toEqual(100);
        expect(escrow.tokenAddress).toEqual('tokenAddress');
    });

    it('should correctly set the payee', () => {
        escrow.payee = 'payee2';
        expect(escrow.payee).toEqual('payee2');
    });

    it('should correctly set the payer', () => {
        escrow.payer = 'payer2';
        expect(escrow.payer).toEqual('payer2');
    });

    it('should correctly set the deployedAt', () => {
        escrow.deployedAt = 1;
        expect(escrow.deployedAt).toEqual(1);
    });

    it('should correctly set the duration', () => {
        escrow.duration = 101;
        expect(escrow.duration).toEqual(101);
    });

    it('should correctly set the state', () => {
        escrow.state = EscrowStatus.CLOSED;
        expect(escrow.state).toEqual(EscrowStatus.CLOSED);
    });

    it('should correctly set the depositAmount', () => {
        escrow.depositAmount = 101;
        expect(escrow.depositAmount).toEqual(101);
    });

    it('should correctly set the tokenAddress', () => {
        escrow.tokenAddress = 'tokenAddress2';
        expect(escrow.tokenAddress).toEqual('tokenAddress2');
    });
});