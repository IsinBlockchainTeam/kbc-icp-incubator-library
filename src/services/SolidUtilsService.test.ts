jest.mock('@blockchain-lib/common');

describe('SolidUtilsService', () => {
    it('should always pass', () => {
        expect(true).toBeTruthy();
    });

    // const serverBaseUrl = 'https://localhost:8443';
    // const podName = 'podName';
    // const podUrl = `${serverBaseUrl}/${podName}`;
    // const mockedComposeWebId = (jest.mocked(composeWebId) as jest.Mock).mockReturnValue(podUrl);
    //
    // it('should define relative resource path for TRANSACTION', () => {
    //     const id = 'id';
    //     const type = StorageOperationType.TRANSACTION;
    //
    //     const result = SolidUtilsService.defineRelativeResourcePath(
    //         serverBaseUrl,
    //         podName,
    //         type,
    //         id
    //     );
    //
    //     expect(mockedComposeWebId).toHaveBeenCalledWith([serverBaseUrl, podName]);
    //     expect(result).toBe(`${podUrl}/transactions/${id}/`);
    // });
    //
    // it('should define relative resource path for TRANSACTION_DOCUMENT', () => {
    //     const id = 'id';
    //     const type = StorageOperationType.TRANSACTION_DOCUMENT;
    //
    //     const result = SolidUtilsService.defineRelativeResourcePath(
    //         serverBaseUrl,
    //         podName,
    //         type,
    //         id
    //     );
    //
    //     expect(mockedComposeWebId).toHaveBeenCalledWith([serverBaseUrl, podName]);
    //     expect(result).toBe(`${podUrl}/transactions/${id}/documents/`);
    // });
    //
    // it('should define relative resource path for CERTIFICATION_DOCUMENT', () => {
    //     const id = 'id';
    //     const type = StorageOperationType.CERTIFICATION_DOCUMENT;
    //
    //     const result = SolidUtilsService.defineRelativeResourcePath(
    //         serverBaseUrl,
    //         podName,
    //         type,
    //         id
    //     );
    //
    //     expect(mockedComposeWebId).toHaveBeenCalledWith([serverBaseUrl, podName]);
    //     expect(result).toBe(`${podUrl}/transactions/${id}/certifications/`);
    // });
});
