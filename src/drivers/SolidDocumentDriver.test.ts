import { SolidDriver, SolidResourceType, SolidSessionCredential } from '@blockchain-lib/common';
import { createMock } from 'ts-auto-mock';
import { SolidDocumentDriver, SolidDocumentSpec } from './SolidDocumentDriver';
import { SolidUtilsService } from '../services/SolidUtilsService';
import { StorageOperationType } from '../types/StorageOperationType';

jest.mock('@blockchain-lib/common', () => ({
    ...jest.requireActual('@blockchain-lib/common'),
    SolidDriver: jest.fn(),
}));
describe('SolidDocumentDriver', () => {
    let solidDocumentDriver: SolidDocumentDriver;
    let sessionCredential: SolidSessionCredential;
    const relativeUrlPath = 'https://localhost/path';
    const resourceId = 'https://localhost/podName/resourceName';
    const mockedSolidDriver = createMock<SolidDriver>({
        create: jest.fn().mockResolvedValue(resourceId),
    });
    const documentSpec: SolidDocumentSpec = {
        filename: 'file.pdf',
    };

    beforeAll(() => {
        jest.spyOn(SolidDriver.prototype as any, 'constructor').mockReturnValue(mockedSolidDriver);
        sessionCredential = {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            podName: 'podName',
        };
        solidDocumentDriver = new SolidDocumentDriver('serverBaseUrl', sessionCredential);
        jest.spyOn(SolidUtilsService, 'defineRelativeResourcePath').mockReturnValue(relativeUrlPath);
    });

    it('create', async () => {
        const documentBuffer = new Uint8Array([1, 2, 3]);
        await solidDocumentDriver.create(StorageOperationType.TRANSACTION, documentBuffer, documentSpec);

        expect(mockedSolidDriver.create).toHaveBeenCalled();
        expect(mockedSolidDriver.create).toHaveBeenNthCalledWith(1, {
            totalUrlPath: `${relativeUrlPath}${documentSpec.filename}`,
            type: SolidResourceType.FILE,
        }, {
            value: documentBuffer,
        }, sessionCredential);
    });

    it('read', async () => {
        await solidDocumentDriver.read(StorageOperationType.CERTIFICATION_DOCUMENT, documentSpec);

        expect(mockedSolidDriver.read).toHaveBeenCalled();
        expect(mockedSolidDriver.read).toHaveBeenNthCalledWith(1, {
            totalUrlPath: `${relativeUrlPath}${documentSpec.filename}`,
            type: SolidResourceType.FILE,
        }, sessionCredential);
    });
});
