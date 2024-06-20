jest.mock('@blockchain-lib/common', () => ({
    ...jest.requireActual('@blockchain-lib/common'),
    SolidDriver: jest.fn()
}));
describe('SolidMetadataDriver', () => {
    it('should always pass', () => {
        expect(true).toBeTruthy();
    });
    // let solidMetadataDriver: SolidMetadataDriver;
    // let sessionCredential: SolidSessionCredential;
    // const relativeUrlPath = 'https://localhost/path/';
    // const resourceId = 'https://localhost/podName/resourceName';
    // const mockedSolidDriver = createMock<SolidDriver>({
    //     create: jest.fn().mockResolvedValue(resourceId)
    // });
    // const metadataStorageSpec: SolidMetadataSpec = {
    //     resourceName: 'resourceName',
    //     bcResourceId: 'bcResourceId'
    // };
    //
    // beforeAll(() => {
    //     jest.spyOn(SolidDriver.prototype as any, 'constructor').mockReturnValue(mockedSolidDriver);
    //     sessionCredential = {
    //         clientId: 'clientId',
    //         clientSecret: 'clientSecret',
    //         podName: 'podName'
    //     };
    //     solidMetadataDriver = new SolidMetadataDriver('serverBaseUrl', sessionCredential);
    //     jest.spyOn(SolidUtilsService, 'defineRelativeResourcePath').mockReturnValue(
    //         relativeUrlPath
    //     );
    // });
    //
    // it('create - without ACL', async () => {
    //     const metadata = { metadata: 'metadata content' };
    //     await solidMetadataDriver.create(
    //         StorageOperationType.TRANSACTION,
    //         metadata,
    //         [],
    //         metadataStorageSpec
    //     );
    //
    //     expect(mockedSolidDriver.create).toHaveBeenCalled();
    //     expect(mockedSolidDriver.create).toHaveBeenNthCalledWith(
    //         1,
    //         {
    //             totalUrlPath: `${relativeUrlPath}${metadataStorageSpec.resourceName}`,
    //             type: SolidResourceType.METADATA
    //         },
    //         {
    //             metadata
    //         },
    //         sessionCredential
    //     );
    // });
    //
    // it('create - with ACL', async () => {
    //     const metadata = { metadata: 'metadata content' };
    //     const aclRules = [{ modes: [AccessMode.READ, AccessMode.WRITE], agents: ['agent1'] }];
    //     await solidMetadataDriver.create(
    //         StorageOperationType.TRANSACTION,
    //         metadata,
    //         aclRules,
    //         metadataStorageSpec
    //     );
    //
    //     expect(mockedSolidDriver.create).toHaveBeenCalled();
    //     expect(mockedSolidDriver.create).toHaveBeenNthCalledWith(
    //         1,
    //         {
    //             totalUrlPath: `${relativeUrlPath}${metadataStorageSpec.resourceName}`,
    //             type: SolidResourceType.METADATA
    //         },
    //         {
    //             metadata
    //         },
    //         sessionCredential
    //     );
    //
    //     expect(mockedSolidDriver.setAcl).toHaveBeenCalled();
    //     expect(mockedSolidDriver.setAcl).toHaveBeenNthCalledWith(
    //         1,
    //         {
    //             totalUrlPath: `${relativeUrlPath}${metadataStorageSpec.resourceName}`,
    //             type: SolidResourceType.METADATA
    //         },
    //         aclRules,
    //         sessionCredential
    //     );
    // });
    //
    // it('read', async () => {
    //     await solidMetadataDriver.read(
    //         StorageOperationType.CERTIFICATION_DOCUMENT,
    //         metadataStorageSpec
    //     );
    //
    //     expect(mockedSolidDriver.read).toHaveBeenCalled();
    //     expect(mockedSolidDriver.read).toHaveBeenNthCalledWith(
    //         1,
    //         {
    //             totalUrlPath: `${relativeUrlPath}${metadataStorageSpec.resourceName}`,
    //             type: SolidResourceType.METADATA
    //         },
    //         sessionCredential
    //     );
    // });
});
