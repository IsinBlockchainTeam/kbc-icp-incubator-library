import { DownPayment } from './DownPayment';
import { DownPaymentStatus } from '../types/DownPaymentStatus';

describe('Down payment', () => {
    let downPayment: DownPayment;
    beforeAll(() => {
        downPayment = new DownPayment(
            'payee',
            0,
            1000,
            'tokenAddress',
            DownPaymentStatus.ACTIVE,
            'feeRecipient',
            20,
            1
        );
    });

    it('should correctly initialize a new down payment', () => {
        expect(downPayment.payee).toEqual('payee');
        expect(downPayment.deployedAt).toEqual(0);
        expect(downPayment.duration).toEqual(1000);
        expect(downPayment.state).toEqual(DownPaymentStatus.ACTIVE);
        expect(downPayment.tokenAddress).toEqual('tokenAddress');
        expect(downPayment.feeRecipient).toEqual('feeRecipient');
        expect(downPayment.baseFee).toEqual(20);
        expect(downPayment.percentageFee).toEqual(1);
    });

    it('should correctly set the payee', () => {
        downPayment.payee = 'payee2';
        expect(downPayment.payee).toEqual('payee2');
    });

    it('should correctly set the deployedAt', () => {
        downPayment.deployedAt = 1;
        expect(downPayment.deployedAt).toEqual(1);
    });

    it('should correctly set the duration', () => {
        downPayment.duration = 101;
        expect(downPayment.duration).toEqual(101);
    });

    it('should correctly set the state', () => {
        downPayment.state = DownPaymentStatus.REFUNDING;
        expect(downPayment.state).toEqual(DownPaymentStatus.REFUNDING);
    });

    it('should correctly set the tokenAddress', () => {
        downPayment.tokenAddress = 'tokenAddress2';
        expect(downPayment.tokenAddress).toEqual('tokenAddress2');
    });

    it('should correctly set the fee recipient', () => {
        downPayment.feeRecipient = 'feeRecipient2';
        expect(downPayment.feeRecipient).toEqual('feeRecipient2');
    });

    it('should correctly set the base fee', () => {
        downPayment.baseFee = 21;
        expect(downPayment.baseFee).toEqual(21);
    });

    it('should correctly set the percentage fee', () => {
        downPayment.percentageFee = 2;
        expect(downPayment.percentageFee).toEqual(2);
    });
});
