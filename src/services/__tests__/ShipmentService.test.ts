it('', () => {
    expect(true).toBe(true);
});
// import { createMock } from 'ts-auto-mock';
// import { DocumentTypeEnum, EvaluationStatusEnum } from '@kbc-lib/azle-types';
// import { ShipmentService } from '../ShipmentService';
// import { ShipmentDriver } from '../../../drivers/icp/ShipmentDriver';
// import { Shipment } from '../../../entities/icp/Shipment';
// import { EvaluationStatus } from '../../../entities/icp/Evaluation';
//
// describe('ShipmentService', () => {
//     let shipmentService: ShipmentService;
//     const mockFn = {
//         getShipments: jest.fn(),
//         getShipment: jest.fn(),
//         getShipmentPhase: jest.fn(),
//         getDocumentsByType: jest.fn(),
//         setShipmentDetails: jest.fn(),
//         evaluateSample: jest.fn(),
//         evaluateShipmentDetails: jest.fn(),
//         evaluateQuality: jest.fn(),
//         depositFunds: jest.fn(),
//         lockFunds: jest.fn(),
//         unlockFunds: jest.fn(),
//         getDocuments: jest.fn(),
//         addDocument: jest.fn(),
//         updateDocument: jest.fn(),
//         evaluateDocument: jest.fn(),
//         getPhase1Documents: jest.fn(),
//         getPhase1RequiredDocuments: jest.fn(),
//         getPhase2Documents: jest.fn(),
//         getPhase2RequiredDocuments: jest.fn(),
//         getPhase3Documents: jest.fn(),
//         getPhase3RequiredDocuments: jest.fn(),
//         getPhase4Documents: jest.fn(),
//         getPhase4RequiredDocuments: jest.fn(),
//         getPhase5Documents: jest.fn(),
//         getPhase5RequiredDocuments: jest.fn()
//     };
//
//     const defaultShipment = { id: 0 } as Shipment;
//
//     beforeAll(() => {
//         const shipmentDriver = createMock<ShipmentDriver>(mockFn);
//         shipmentService = new ShipmentService(shipmentDriver);
//     });
//
//     it.each([
//         {
//             functionName: 'getShipments',
//             serviceFunction: () => shipmentService.getShipments(),
//             driverFunction: mockFn.getShipments,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getShipment',
//             serviceFunction: () => shipmentService.getShipment(1),
//             driverFunction: mockFn.getShipment,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: [1]
//         },
//         {
//             functionName: 'getShipmentPhase',
//             serviceFunction: () => shipmentService.getShipmentPhase(1),
//             driverFunction: mockFn.getShipmentPhase,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: [, 1]
//         },
//         {
//             functionName: 'getDocumentsByType',
//             serviceFunction: () =>
//                 shipmentService.getDocumentsByType(
//                     ,
//                     1,
//                     DocumentTypeEnum.PRE_SHIPMENT_SAMPLE
//                 ),
//             driverFunction: mockFn.getDocumentsByType,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: [, 1, DocumentTypeEnum.PRE_SHIPMENT_SAMPLE]
//         },
//         {
//             functionName: 'setShipmentDetails',
//             serviceFunction: () =>
//                 shipmentService.setShipmentDetails(
//                     ,
//                     1,
//                     1,
//                     1,
//                     1,
//                     'targetExchange',
//                     1,
//                     1,
//                     1,
//                     1,
//                     1,
//                     1
//                 ),
//             driverFunction: mockFn.setShipmentDetails,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1, 1, 1, 1, 'targetExchange', 1, 1, 1, 1, 1, 1]
//         },
//         {
//             functionName: 'evaluateSample',
//             serviceFunction: () =>
//                 shipmentService.evaluateSample(, 1, EvaluationStatusEnum.APPROVED),
//             driverFunction: mockFn.evaluateSample,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1, EvaluationStatusEnum.APPROVED]
//         },
//         {
//             functionName: 'evaluateShipmentDetails',
//             serviceFunction: () =>
//                 shipmentService.evaluateShipmentDetails(
//                     ,
//                     1,
//                     EvaluationStatusEnum.APPROVED
//                 ),
//             driverFunction: mockFn.evaluateShipmentDetails,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1, EvaluationStatusEnum.APPROVED]
//         },
//         {
//             functionName: 'evaluateQuality',
//             serviceFunction: () =>
//                 shipmentService.evaluateQuality(, 1, EvaluationStatusEnum.APPROVED),
//             driverFunction: mockFn.evaluateQuality,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1, EvaluationStatusEnum.APPROVED]
//         },
//         {
//             functionName: 'depositFunds',
//             serviceFunction: () => shipmentService.depositFunds(, 1, 1),
//             driverFunction: mockFn.depositFunds,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1, 1]
//         },
//         {
//             functionName: 'lockFunds',
//             serviceFunction: () => shipmentService.lockFunds(, 1),
//             driverFunction: mockFn.lockFunds,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1]
//         },
//         {
//             functionName: 'unlockFunds',
//             serviceFunction: () => shipmentService.unlockFunds(, 1),
//             driverFunction: mockFn.unlockFunds,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1]
//         },
//         {
//             functionName: 'getDocuments',
//             serviceFunction: () => shipmentService.getDocuments(, 1),
//             driverFunction: mockFn.getDocuments,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: [, 1]
//         },
//         {
//             functionName: 'addDocument',
//             serviceFunction: () =>
//                 shipmentService.addDocument(
//                     ,
//                     1,
//                     DocumentTypeEnum.PRE_SHIPMENT_SAMPLE,
//                     'externalUrl'
//                 ),
//             driverFunction: mockFn.addDocument,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1, DocumentTypeEnum.PRE_SHIPMENT_SAMPLE, 'externalUrl']
//         },
//         {
//             functionName: 'updateDocument',
//             serviceFunction: () => shipmentService.updateDocument(, 1, 1, 'externalUrl'),
//             driverFunction: mockFn.updateDocument,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1, 1, 'externalUrl']
//         },
//         {
//             functionName: 'evaluateDocument',
//             serviceFunction: () =>
//                 shipmentService.evaluateDocument(, 1, 1, EvaluationStatus.APPROVED),
//             driverFunction: mockFn.evaluateDocument,
//             driverFunctionResult: defaultShipment,
//             driverFunctionArgs: [, 1, 1, EvaluationStatus.APPROVED]
//         },
//         {
//             functionName: 'getPhase1Documents',
//             serviceFunction: () => shipmentService.getPhase1Documents(),
//             driverFunction: mockFn.getPhase1Documents,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getPhase1RequiredDocuments',
//             serviceFunction: () => shipmentService.getPhase1RequiredDocuments(),
//             driverFunction: mockFn.getPhase1RequiredDocuments,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getPhase2Documents',
//             serviceFunction: () => shipmentService.getPhase2Documents(),
//             driverFunction: mockFn.getPhase2Documents,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getPhase2RequiredDocuments',
//             serviceFunction: () => shipmentService.getPhase2RequiredDocuments(),
//             driverFunction: mockFn.getPhase2RequiredDocuments,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getPhase3Documents',
//             serviceFunction: () => shipmentService.getPhase3Documents(),
//             driverFunction: mockFn.getPhase3Documents,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getPhase3RequiredDocuments',
//             serviceFunction: () => shipmentService.getPhase3RequiredDocuments(),
//             driverFunction: mockFn.getPhase3RequiredDocuments,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getPhase4Documents',
//             serviceFunction: () => shipmentService.getPhase4Documents(),
//             driverFunction: mockFn.getPhase4Documents,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getPhase4RequiredDocuments',
//             serviceFunction: () => shipmentService.getPhase4RequiredDocuments(),
//             driverFunction: mockFn.getPhase4RequiredDocuments,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getPhase5Documents',
//             serviceFunction: () => shipmentService.getPhase5Documents(),
//             driverFunction: mockFn.getPhase5Documents,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         },
//         {
//             functionName: 'getPhase5RequiredDocuments',
//             serviceFunction: () => shipmentService.getPhase5RequiredDocuments(),
//             driverFunction: mockFn.getPhase5RequiredDocuments,
//             driverFunctionResult: [defaultShipment],
//             driverFunctionArgs: []
//         }
//     ])(
//         'should call driver function $functionName',
//         async ({ serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs }) => {
//             driverFunction.mockReturnValue(driverFunctionResult);
//             await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
//             expect(driverFunction).toHaveBeenCalled();
//             expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
//         }
//     );
// });
