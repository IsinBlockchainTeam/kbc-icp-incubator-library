import { createMock } from 'ts-auto-mock';
import { BigNumber, ethers, Signer } from 'ethers';
import { MyToken, MyToken__factory } from '../../smart-contracts';
import { TokenDriver } from '../TokenDriver';

describe('TokenDriver', () => {
    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    let tokenDriver: TokenDriver;

    let mockedSigner: Signer;
    let mockedContract: MyToken;

    const mockedTokenConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();

    const companyA = ethers.Wallet.createRandom();

    beforeAll(() => {
        mockedWriteFunction.mockResolvedValue({
            wait: mockedWait
        });
        mockedReadFunction.mockResolvedValue({
            toNumber: jest.fn()
        });

        mockedContract = createMock<MyToken>({
            balanceOf: mockedReadFunction,
            symbol: mockedReadFunction,
            approve: mockedWriteFunction,
            transfer: mockedWriteFunction
        });

        mockedTokenConnect.mockReturnValue(mockedContract);
        const mockedToken = createMock<MyToken>({
            connect: mockedTokenConnect
        });
        jest.spyOn(MyToken__factory, 'connect').mockReturnValue(mockedToken);

        mockedSigner = createMock<Signer>();
        tokenDriver = new TokenDriver(mockedSigner, testAddress);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should call balanceOf', async () => {
        mockedReadFunction.mockResolvedValue(BigNumber.from(100));
        const resp = await tokenDriver.balanceOf(companyA.address);

        expect(resp).toEqual(100);
        expect(mockedReadFunction).toHaveBeenCalledTimes(1);
        expect(mockedReadFunction).toHaveBeenNthCalledWith(1, companyA.address);
    });

    it('should call symbol', async () => {
        mockedReadFunction.mockResolvedValue('SYM');
        const resp = await tokenDriver.getSymbol();

        expect(resp).toEqual('SYM');
        expect(mockedReadFunction).toHaveBeenCalledTimes(1);
    });

    it('should call and wait approve', async () => {
        await tokenDriver.approve(companyA.address, 1000);

        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWriteFunction).toHaveBeenNthCalledWith(1, companyA.address, 1000);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait transfer', async () => {
        await tokenDriver.transfer(companyA.address, 1000);

        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWriteFunction).toHaveBeenNthCalledWith(1, companyA.address, 1000);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
});
