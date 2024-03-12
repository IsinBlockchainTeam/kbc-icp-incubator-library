import { SolidDriver, SolidResourceType, SolidSessionCredential } from '@blockchain-lib/common';
import { createMock } from 'ts-auto-mock';
import { SolidDocumentDriver } from './SolidDocumentDriver';
import { DocumentStorage } from './IStorageDocumentDriver';
import { MetadataType } from './IStorageMetadataDriver';
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
        const documentStorage: DocumentStorage = {
            filename: 'file.pdf',
            fileBuffer: Buffer.from('file content'),
        };
        await solidDocumentDriver.create(MetadataType.TRANSACTION, documentStorage);

        expect(solidDriverMock.create).toHaveBeenCalled();
        expect(solidDriverMock.create).toHaveBeenNthCalledWith(1, {
            podName: sessionCredential.podName,
            relativeUrlPath: `${relativeUrlPath}${documentStorage.filename}`,
            type: SolidResourceType.FILE,
        }, {
            value: documentStorage.fileBuffer,
        }, sessionCredential);
    });
});
