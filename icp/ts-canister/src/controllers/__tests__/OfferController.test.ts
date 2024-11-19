import OfferController from "../OfferController";
import OfferService from "../../services/OfferService";
import {Offer} from "../../models/types";
import {update} from "azle";
import {AtLeastEditor, AtLeastViewer} from "../../decorators/roles";
jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/OfferService', () => {
    return {
        instance: {
            getOffers: jest.fn(),
            getOffer: jest.fn(),
            createOffer: jest.fn(),
        }
    };
});
describe('OfferController', () => {
    let offerServiceInstanceMock = OfferService.instance as jest.Mocked<OfferService>;
    let offerController = new OfferController();

    it.each([
        {
            controllerFunctionName: 'getOffers',
            controllerFunction: () => offerController.getOffers(),
            serviceFunction: offerServiceInstanceMock.getOffers,
            expectedResult: [{id: 1n} as Offer],
            expectedDecorators: [update, AtLeastViewer],
        }, {
            controllerFunctionName: 'getOffer',
            controllerFunction: () => offerController.getOffer(1n),
            serviceFunction: offerServiceInstanceMock.getOffer,
            expectedResult: {id: 1n} as Offer,
            expectedDecorators: [update, AtLeastViewer],
        }, {
            controllerFunctionName: 'createOffer',
            controllerFunction: () => offerController.createOffer(1n),
            serviceFunction: offerServiceInstanceMock.createOffer,
            expectedResult: {id: 1n} as Offer,
            expectedDecorators: [update, AtLeastEditor],
        }
    ])
    ('should cass service $serviceFunctionName', async (
        {controllerFunction, serviceFunction, expectedResult, expectedDecorators}
    ) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
