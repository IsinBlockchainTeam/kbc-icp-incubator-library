import { createMock } from 'ts-auto-mock';
import {ethers} from "ethers";
import { TokenDriver } from '../drivers/TokenDriver';
import {TokenService} from "./TokenService";

describe('TokenService', () => {
    const companyA = ethers.Wallet.createRandom();

    const mockedTokenDriver = createMock<TokenDriver>({
        balanceOf: jest.fn(),
        getSymbol: jest.fn(),
        approve: jest.fn(),
    });

    const tokenService = new TokenService(mockedTokenDriver);

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'balanceOf',
            serviceFunction: () =>
                tokenService.balanceOf(
                    companyA.address
                ),
            expectedMockedFunction: mockedTokenDriver.balanceOf,
            expectedMockedFunctionArgs: [companyA.address]
        },
        {
            serviceFunctionName: 'getSymbol',
            serviceFunction: () =>
                tokenService.getSymbol(),
            expectedMockedFunction: mockedTokenDriver.getSymbol,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'approve',
            serviceFunction: () => tokenService.approve(companyA.address, 1),
            expectedMockedFunction: mockedTokenDriver.approve,
            expectedMockedFunctionArgs: [companyA.address, 1]
        },
        {
            serviceFunctionName: 'transfer',
            serviceFunction: () => tokenService.transfer(companyA.address, 1),
            expectedMockedFunction: mockedTokenDriver.transfer,
            expectedMockedFunctionArgs: [companyA.address, 1]
        }
    ])(
        'should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenNthCalledWith(
                1,
                ...expectedMockedFunctionArgs
            );
        }
    );
});
