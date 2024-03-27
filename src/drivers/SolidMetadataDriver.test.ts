import { AccessMode, SolidDriver, SolidResourceType, SolidSessionCredential } from '@blockchain-lib/common';
import { createMock } from 'ts-auto-mock';
import { SolidUtilsService } from '../services/SolidUtilsService';
import { SolidMetadataDriver, SolidMetadataSpec } from './SolidMetadataDriver';
import { StorageOperationType } from '../types/StorageOperationType';

jest.mock('@blockchain-lib/common', () => ({
    ...jest.requireActual('@blockchain-lib/common'),
    SolidDriver: jest.fn(),
}));
describe('SolidMetadataDriver', () => {
    let solidMetadataDriver: SolidMetadataDriver;
    let sessionCredential: SolidSessionCredential;
    const relativeUrlPath = 'https://localhost/path/';
    const resourceId = 'https://localhost/podName/resourceName';
    const mockedSolidDriver = createMock<SolidDriver>({
        create: jest.fn().mockResolvedValue(resourceId),
    });

    beforeAll(() => {
        jest.spyOn(SolidDriver.prototype as any, 'constructor').mockReturnValue(mockedSolidDriver);
        sessionCredential = {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            podName: 'podName',
        };
        solidMetadataDriver = new SolidMetadataDriver('serverBaseUrl', sessionCredential);
        jest.spyOn(SolidUtilsService, 'defineRelativeResourcePath').mockReturnValue(relativeUrlPath);
    });

    it('create - without ACL', async () => {
        const metadata = { metadata: 'metadata content' };
        const metadataStorage: SolidMetadataSpec = {
            resourceName: 'resourceName',
            bcResourceId: 'bcResourceId',
        };
        await solidMetadataDriver.create(StorageOperationType.TRANSACTION, metadata, [], metadataStorage);

        expect(mockedSolidDriver.create).toHaveBeenCalled();
        expect(mockedSolidDriver.create).toHaveBeenNthCalledWith(1, {
            totalUrlPath: `${relativeUrlPath}${metadataStorage.resourceName}`,
            type: SolidResourceType.METADATA,
        }, {
            metadata,
        }, sessionCredential);
    });

    it('create - with ACL', async () => {
        const metadata = { metadata: 'metadata content' };
        const metadataStorage: SolidMetadataSpec = {
            resourceName: 'resourceName',
            bcResourceId: 'bcResourceId',
        };
        const aclRules = [{ modes: [AccessMode.READ, AccessMode.WRITE], agents: ['agent1'] }];
        await solidMetadataDriver.create(StorageOperationType.TRANSACTION, metadata, aclRules, metadataStorage);

        expect(mockedSolidDriver.create).toHaveBeenCalled();
        expect(mockedSolidDriver.create).toHaveBeenNthCalledWith(1, {
            totalUrlPath: `${relativeUrlPath}${metadataStorage.resourceName}`,
            type: SolidResourceType.METADATA,
        }, {
            metadata,
        }, sessionCredential);

        expect(mockedSolidDriver.setAcl).toHaveBeenCalled();
        expect(mockedSolidDriver.setAcl).toHaveBeenNthCalledWith(1, {
            totalUrlPath: `${relativeUrlPath}${metadataStorage.resourceName}`,
            type: SolidResourceType.METADATA,
        }, aclRules, sessionCredential);
    });
});
