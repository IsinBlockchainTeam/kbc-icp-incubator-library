import { query, update } from 'azle';
import CertificationController from '../CertificationController';
import CertificationService from '../../services/CertificationService';
import { BaseCertificate, CertificateDocumentInfo, CompanyCertificate, MaterialCertificate, ScopeCertificate } from '../../models/types';
import { AtLeastEditor, AtLeastViewer } from '../../decorators/roles';

jest.mock('azle');
jest.mock('../../decorators/parties');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/CertificationService', () => ({
    instance: {
        registerCompanyCertificate: jest.fn(),
        registerScopeCertificate: jest.fn(),
        registerMaterialCertificate: jest.fn(),
        getBaseCertificateById: jest.fn(),
        getBaseCertificatesInfoBySubject: jest.fn(),
        getCompanyCertificates: jest.fn(),
        getScopeCertificates: jest.fn(),
        getMaterialCertificates: jest.fn(),
        getCompanyCertificate: jest.fn(),
        getScopeCertificate: jest.fn(),
        getMaterialCertificate: jest.fn(),
        updateCompanyCertificate: jest.fn(),
        updateScopeCertificate: jest.fn(),
        updateMaterialCertificate: jest.fn(),
        updateDocument: jest.fn(),
        evaluateDocument: jest.fn()
    }
}));
describe('CertificationController', () => {
    const certificationServiceInstanceMock = CertificationService.instance as jest.Mocked<CertificationService>;
    const certificationController = new CertificationController();

    it.each([
        {
            controllerFunctionName: 'registerCompanyCertificate',
            controllerFunction: () => certificationController.registerCompanyCertificate('0xissuer', '0xsubject', 1n, 'assessmentAssuranceLevel', {} as CertificateDocumentInfo, 1n, 2n, 'notes'),
            serviceFunction: certificationServiceInstanceMock.registerCompanyCertificate,
            expectedResult: [{ id: 1n } as CompanyCertificate],
            expectedArguments: ['0xissuer', '0xsubject', 1n, 'assessmentAssuranceLevel', {} as CertificateDocumentInfo, 1n, 2n, 'notes'],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'registerScopeCertificate',
            controllerFunction: () =>
                certificationController.registerScopeCertificate('0xissuer', '0xsubject', 1n, 'assessmentAssuranceLevel', {} as CertificateDocumentInfo, 1n, 2n, ['processType1'], 'notes'),
            serviceFunction: certificationServiceInstanceMock.registerScopeCertificate,
            expectedResult: { id: 1n } as ScopeCertificate,
            expectedArguments: ['0xissuer', '0xsubject', 1n, 'assessmentAssuranceLevel', {} as CertificateDocumentInfo, 1n, 2n, ['processType1'], 'notes'],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'registerMaterialCertificate',
            controllerFunction: () => certificationController.registerMaterialCertificate('0xissuer', '0xsubject', 1n, 'assessmentAssuranceLevel', {} as CertificateDocumentInfo, 1n, 'notes'),
            serviceFunction: certificationServiceInstanceMock.registerMaterialCertificate,
            expectedResult: { id: 1n } as ScopeCertificate,
            expectedArguments: ['0xissuer', '0xsubject', 1n, 'assessmentAssuranceLevel', {} as CertificateDocumentInfo, 1n, 'notes'],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'getBaseCertificateById',
            controllerFunction: () => certificationController.getBaseCertificateById(1n),
            serviceFunction: certificationServiceInstanceMock.getBaseCertificateById,
            expectedResult: { id: 1n } as BaseCertificate,
            expectedArguments: [1n],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getBaseCertificatesInfoBySubject',
            controllerFunction: () => certificationController.getBaseCertificatesInfoBySubject('0xsubject'),
            serviceFunction: certificationServiceInstanceMock.getBaseCertificatesInfoBySubject,
            expectedResult: [{ id: 1n }] as BaseCertificate[],
            expectedArguments: ['0xsubject'],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getCompanyCertificates',
            controllerFunction: () => certificationController.getCompanyCertificates('0xsubject'),
            serviceFunction: certificationServiceInstanceMock.getCompanyCertificates,
            expectedResult: [{ id: 1n }] as CompanyCertificate[],
            expectedArguments: ['0xsubject'],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getScopeCertificates',
            controllerFunction: () => certificationController.getScopeCertificates('0xsubject'),
            serviceFunction: certificationServiceInstanceMock.getScopeCertificates,
            expectedResult: [{ id: 1n }] as ScopeCertificate[],
            expectedArguments: ['0xsubject'],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getMaterialCertificates',
            controllerFunction: () => certificationController.getMaterialCertificates('0xsubject'),
            serviceFunction: certificationServiceInstanceMock.getMaterialCertificates,
            expectedResult: [{ id: 1n }] as ScopeCertificate[],
            expectedArguments: ['0xsubject'],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getCompanyCertificate',
            controllerFunction: () => certificationController.getCompanyCertificate('0xsubject', 1n),
            serviceFunction: certificationServiceInstanceMock.getCompanyCertificate,
            expectedResult: { id: 1n } as CompanyCertificate,
            expectedArguments: ['0xsubject', 1n],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getScopeCertificate',
            controllerFunction: () => certificationController.getScopeCertificate('0xsubject', 1n),
            serviceFunction: certificationServiceInstanceMock.getScopeCertificate,
            expectedResult: { id: 1n } as ScopeCertificate,
            expectedArguments: ['0xsubject', 1n],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getMaterialCertificate',
            controllerFunction: () => certificationController.getMaterialCertificate('0xsubject', 1n),
            serviceFunction: certificationServiceInstanceMock.getMaterialCertificate,
            expectedResult: { id: 1n } as MaterialCertificate,
            expectedArguments: ['0xsubject', 1n],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'updateCompanyCertificate',
            controllerFunction: () => certificationController.updateCompanyCertificate(1n, 2n, 'assessmentAssuranceLevel', 1n, 2n, 'notes'),
            serviceFunction: certificationServiceInstanceMock.updateCompanyCertificate,
            expectedResult: { id: 1n } as CompanyCertificate,
            expectedArguments: [1n, 2n, 'assessmentAssuranceLevel', 1n, 2n, 'notes'],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'updateScopeCertificate',
            controllerFunction: () => certificationController.updateScopeCertificate(1n, 2n, 'assessmentAssuranceLevel', 1n, 2n, ['processType1'], 'notes'),
            serviceFunction: certificationServiceInstanceMock.updateScopeCertificate,
            expectedResult: { id: 1n } as ScopeCertificate,
            expectedArguments: [1n, 2n, 'assessmentAssuranceLevel', 1n, 2n, ['processType1'], 'notes'],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'updateMaterialCertificate',
            controllerFunction: () => certificationController.updateMaterialCertificate(1n, 2n, 'assessmentAssuranceLevel', 1n, 'notes'),
            serviceFunction: certificationServiceInstanceMock.updateMaterialCertificate,
            expectedResult: { id: 1n } as MaterialCertificate,
            expectedArguments: [1n, 2n, 'assessmentAssuranceLevel', 1n, 'notes'],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'updateCertificateDocument',
            controllerFunction: () => certificationController.updateCertificateDocument(1n, {} as CertificateDocumentInfo),
            serviceFunction: certificationServiceInstanceMock.updateDocument,
            expectedResult: { id: 1n } as BaseCertificate,
            expectedArguments: [1n, {} as CertificateDocumentInfo],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'evaluateCertificateDocument',
            controllerFunction: () => certificationController.evaluateCertificateDocument(1n, { APPROVED: null }),
            serviceFunction: certificationServiceInstanceMock.evaluateDocument,
            expectedResult: { id: 1n } as BaseCertificate,
            expectedArguments: [1n, { APPROVED: null }],
            expectedDecorators: [update, AtLeastEditor]
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
