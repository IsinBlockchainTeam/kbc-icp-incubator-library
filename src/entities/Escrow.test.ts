import {Escrow} from "./Escrow";
import {EscrowStatus} from "../types/EscrowStatus";

describe('Escrow', () => {
    let escrow: Escrow;

    const payers: string[] = ['payer1', 'payer2'];

    beforeAll(() => {
        escrow = new Escrow('payee', 'purchaser', payers, 1000, 0, 1000, EscrowStatus.ACTIVE, 'tokenAddress', 'commissioner', 20, 1);
    });

    it('should correctly initialize a new Escrow', () => {
        expect(escrow.payee).toEqual('payee');
        expect(escrow.purchaser).toEqual('purchaser');
        expect(escrow.payers).toEqual(payers);
        expect(escrow.agreedAmount).toEqual(1000);
        expect(escrow.deployedAt).toEqual(0);
        expect(escrow.duration).toEqual(1000);
        expect(escrow.state).toEqual(EscrowStatus.ACTIVE);
        expect(escrow.tokenAddress).toEqual('tokenAddress');
        expect(escrow.commissioner).toEqual('commissioner');
    });

    it('should correctly set the payee', () => {
        escrow.payee = 'payee2';
        expect(escrow.payee).toEqual('payee2');
    });

    it('should correctly set the purchaser', () => {
        escrow.purchaser = 'purchaser2';
        expect(escrow.purchaser).toEqual('purchaser2');
    });

    it('should correctly set the payers', () => {
        const newPayers: string[] = ['payer3', 'payer4'];
        escrow.payers = newPayers;
        expect(escrow.payers).toEqual(newPayers);
    });

    it('should correctly set the agreed amount', () => {
        escrow.agreedAmount = 1001;
        expect(escrow.agreedAmount).toEqual(1001);
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

    it('should correctly set the tokenAddress', () => {
        escrow.tokenAddress = 'tokenAddress2';
        expect(escrow.tokenAddress).toEqual('tokenAddress2');
    });

    it('should correctly set the commissioner', () => {
        escrow.commissioner = 'commissioner2';
        expect(escrow.commissioner).toEqual('commissioner2');
    });

    it('should correctly set the base fee', () => {
        escrow.baseFee = 21;
        expect(escrow.baseFee).toEqual(21);
    })

    it('should correctly set the percentage fee', () => {
        escrow.percentageFee = 2;
        expect(escrow.percentageFee).toEqual(2);
    })
});