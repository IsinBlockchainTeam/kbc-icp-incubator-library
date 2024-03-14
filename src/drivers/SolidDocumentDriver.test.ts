import { SolidDriver, SolidResourceType, SolidSessionCredential } from '@blockchain-lib/common';
import { createMock } from 'ts-auto-mock';
import { SolidDocumentDriver, SolidDocumentSpec } from './SolidDocumentDriver';
import { OperationType } from './IStorageMetadataDriver';
import { SolidUtilsService } from '../services/SolidUtilsService';

jest.mock('@blockchain-lib/common', () => ({
    ...jest.requireActual('@blockchain-lib/common'),
    SolidDriver: jest.fn(),
}));
describe('SolidDocumentDriver', () => {
    let solidDocumentDriver: SolidDocumentDriver;
    let sessionCredential: SolidSessionCredential;
    const relativeUrlPath = 'https://localhost/path';
    const solidDriverMock = createMock<SolidDriver>({
        create: jest.fn(),
    });

    beforeAll(() => {
        jest.spyOn(SolidDriver.prototype as any, 'constructor').mockReturnValue(solidDriverMock);
        sessionCredential = {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            podName: 'podName',
        };
        solidDocumentDriver = new SolidDocumentDriver('serverBaseUrl', sessionCredential);
        jest.spyOn(SolidUtilsService, 'defineRelativeResourcePath').mockReturnValue(relativeUrlPath);
    });

    it('create', async () => {
        const documentBuffer = Buffer.from('file content');
        const documentSpec: SolidDocumentSpec = {
            filename: 'file.pdf',
        };
        await solidDocumentDriver.create(OperationType.TRANSACTION, documentBuffer, documentSpec);

        expect(solidDriverMock.create).toHaveBeenCalled();
        expect(solidDriverMock.create).toHaveBeenNthCalledWith(1, {
            podName: sessionCredential.podName,
            relativeUrlPath: `${relativeUrlPath}${documentSpec.filename}`,
            type: SolidResourceType.FILE,
        }, {
            value: documentBuffer,
        }, sessionCredential);
    });
});
