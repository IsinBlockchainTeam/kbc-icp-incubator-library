import { update } from 'azle';
import OfferController from '../OfferController';
import OfferService from '../../services/OfferService';
import { Offer } from '../../models/types';
import { AtLeastEditor, AtLeastViewer } from '../../decorators/roles';
import { OnlyContractParty } from "../../decorators/parties";

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../decorators/parties');
jest.mock('../../models/idls');
jest.mock('../../services/OfferService', () => ({
    instance: {
        getOffers: jest.fn(),
        getOffer: jest.fn(),
        createOffer: jest.fn(),
        deleteOffer: jest.fn()
    }
}));
describe('OfferController', () => {
    const offerServiceInstanceMock = OfferService.instance as jest.Mocked<OfferService>;
    const offerController = new OfferController();

    it.each([
        {
            controllerFunctionName: 'getOffers',
            controllerFunction: () => offerController.getOffers(),
            serviceFunction: offerServiceInstanceMock.getOffers,
            expectedResult: [{ id: 1n } as Offer],
            expectedArguments: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getOffer',
            controllerFunction: () => offerController.getOffer(1n),
            serviceFunction: offerServiceInstanceMock.getOffer,
            expectedResult: { id: 1n } as Offer,
            expectedArguments: [1n],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'createOffer',
            controllerFunction: () => offerController.createOffer(1n),
            serviceFunction: offerServiceInstanceMock.createOffer,
            expectedResult: { id: 1n } as Offer,
            expectedArguments: [1n],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'deleteOffer',
            controllerFunction: () => offerController.deleteOffer(1n),
            serviceFunction: offerServiceInstanceMock.deleteOffer,
            expectedArguments: [1n],
            expectedResult: null,
            expectedDecorators: [update, AtLeastEditor, OnlyContractParty]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedArguments, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        expect(serviceFunction).toHaveBeenCalledWith(...expectedArguments);
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
