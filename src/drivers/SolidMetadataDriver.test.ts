import { SolidDriver, SolidResourceType, SolidSessionCredential } from '@blockchain-lib/common';
import { createMock } from 'ts-auto-mock';
import { OperationType } from './IStorageMetadataDriver';
import { SolidUtilsService } from '../services/SolidUtilsService';
import { SolidMetadataDriver, SolidMetadataSpec } from './SolidMetadataDriver';

jest.mock('@blockchain-lib/common', () => ({
    ...jest.requireActual('@blockchain-lib/common'),
    SolidDriver: jest.fn(),
}));
describe('SolidDocumentDriver', () => {
    let solidMetadataDriver: SolidMetadataDriver;
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
        solidMetadataDriver = new SolidMetadataDriver('serverBaseUrl', sessionCredential);
        jest.spyOn(SolidUtilsService, 'defineRelativeResourcePath').mockReturnValue(relativeUrlPath);
    });

    it('create', async () => {
        const metadata = { metadata: 'metadata content' };
        const metadataStorage: SolidMetadataSpec = {
            resourceName: 'resourceName',
            bcResourceId: 'bcResourceId',
        };
        await solidMetadataDriver.create(OperationType.TRANSACTION, metadata, metadataStorage);

        expect(solidDriverMock.create).toHaveBeenCalled();
        expect(solidDriverMock.create).toHaveBeenNthCalledWith(1, {
            podName: sessionCredential.podName,
            relativeUrlPath: `${relativeUrlPath}${metadataStorage.resourceName}`,
            type: SolidResourceType.METADATA,
        }, {
            metadata,
        }, sessionCredential);
    });
});
