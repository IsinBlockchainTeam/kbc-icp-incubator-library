import { Escrow } from './Escrow';
import { EscrowStatus } from '../types/EscrowStatus';

describe('Escrow', () => {
    let escrow: Escrow;
    beforeAll(() => {
        escrow = new Escrow(
            'payee',
            0,
            1000,
            'tokenAddress',
            EscrowStatus.ACTIVE,
            'feeRecipient',
            20,
            1
        );
    });

    it('should correctly initialize a new Escrow', () => {
        expect(escrow.payee).toEqual('payee');
        expect(escrow.deployedAt).toEqual(0);
        expect(escrow.duration).toEqual(1000);
        expect(escrow.state).toEqual(EscrowStatus.ACTIVE);
        expect(escrow.tokenAddress).toEqual('tokenAddress');
        expect(escrow.feeRecipient).toEqual('feeRecipient');
        expect(escrow.baseFee).toEqual(20);
        expect(escrow.percentageFee).toEqual(1);
    });

    it('should correctly set the payee', () => {
        escrow.payee = 'payee2';
        expect(escrow.payee).toEqual('payee2');
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
        escrow.state = EscrowStatus.REFUNDING;
        expect(escrow.state).toEqual(EscrowStatus.REFUNDING);
    });

    it('should correctly set the tokenAddress', () => {
        escrow.tokenAddress = 'tokenAddress2';
        expect(escrow.tokenAddress).toEqual('tokenAddress2');
    });

    it('should correctly set the fee recipient', () => {
        escrow.feeRecipient = 'feeRecipient2';
        expect(escrow.feeRecipient).toEqual('feeRecipient2');
    });

    it('should correctly set the base fee', () => {
        escrow.baseFee = 21;
        expect(escrow.baseFee).toEqual(21);
    });

    it('should correctly set the percentage fee', () => {
        escrow.percentageFee = 2;
        expect(escrow.percentageFee).toEqual(2);
    });
});
