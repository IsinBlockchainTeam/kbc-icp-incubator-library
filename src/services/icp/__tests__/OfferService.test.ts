import {createMock} from "ts-auto-mock";
import {OfferService} from "../OfferService";
import {OfferDriver} from "../../../drivers/icp/OfferDriver";

describe('OfferService', () => {
    let offerService: OfferService;
    const mockedFn = {
        getOffers: jest.fn(),
        getOffer: jest.fn(),
        createOffer: jest.fn(),
    }

    beforeAll(() => {
        const offerDriver = createMock<OfferDriver>({
            getOffers: mockedFn.getOffers,
            getOffer: mockedFn.getOffer,
            createOffer: mockedFn.createOffer,

        });
        offerService = new OfferService(offerDriver);
    });

    it.each([
        {
            functionName: 'getOffers',
            serviceFunction: () => offerService.getOffers(),
            driverFunction: mockedFn.getOffers,
            driverFunctionResult: [],
            driverFunctionArgs: []
        }, {
            functionName: 'getOffer',
            serviceFunction: () => offerService.getOffer(1),
            driverFunction: mockedFn.getOffer,
            driverFunctionResult: {},
            driverFunctionArgs: [1]
        }, {
            functionName: 'createOffer',
            serviceFunction: () => offerService.createOffer(1),
            driverFunction: mockedFn.createOffer,
            driverFunctionResult: {},
            driverFunctionArgs: [1]
        }
    ])(`should call driver function $functionName`, async ({serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs}) => {
        driverFunction.mockReturnValue(driverFunctionResult);
        await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
        expect(driverFunction).toHaveBeenCalled();
        expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
    });
});
