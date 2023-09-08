describe('PinataIPFSDriver', () => {
    // let pinataIPFSDriver: PinataIPFSDriver;
    // const mockedJSONContent = { body: 'values to store' };
    // const mockedFileStream = createMock<ReadableStream>();
    // const customGateway = 'http://customGateway.pinata.cloud';
    //
    // const mockedPinataClient: PinataClient = createMock<PinataClient>({
    //     pinJSONToIPFS: jest.fn().mockResolvedValue({ IpfsHash: 'ipfsHash' }),
    //     pinFileToIPFS: jest.fn().mockResolvedValue({ IpfsHash: 'ipfsHash' }),
    //     unpin: jest.fn().mockReturnValue(Promise.resolve()),
    // });
    //
    // const mockedPinataSDK = jest.mocked(PinataClient);
    // mockedPinataSDK.mockReturnValue(mockedPinataClient);
    //
    // const mockedFetch = jest.mocked(fetch);
    // const ipfsHash = 'cid_ipfsHash';
    //
    // beforeAll(() => {
    //     pinataIPFSDriver = new PinataIPFSDriver(
    //         'apiKeyTest',
    //         'secretApiKey',
    //         customGateway,
    //     );
    // });
    //
    // afterAll(() => {
    //     jest.restoreAllMocks();
    // });
    //
    // it('should correctly store JSON object to ipfs', async () => {
    //     const response = await pinataIPFSDriver.storeJSON(mockedJSONContent);
    //     expect(mockedPinataClient.pinJSONToIPFS).toHaveBeenCalledTimes(1);
    //     expect(mockedPinataClient.pinJSONToIPFS).toHaveBeenNthCalledWith(1, JSON.stringify(mockedJSONContent), undefined);
    //     expect(response).toEqual('ipfsHash');
    // });
    //
    // it('should correctly store file to ipfs', async () => {
    //     const response = await pinataIPFSDriver.storeFile(mockedFileStream);
    //     expect(mockedPinataClient.pinFileToIPFS).toHaveBeenCalledTimes(1);
    //     expect(mockedPinataClient.pinFileToIPFS).toHaveBeenNthCalledWith(1, mockedFileStream, undefined);
    //     expect(response).toEqual('ipfsHash');
    // });
    //
    // it('should retrieve the json content from ipfs', async () => {
    //     mockedFetch.mockResolvedValue({ json: () => Promise.resolve(JSON.stringify(mockedJSONContent)), ok: true } as Response);
    //     const response = await pinataIPFSDriver.retrieveJSON(ipfsHash);
    //
    //     expect(mockedFetch).toHaveBeenCalledTimes(1);
    //     expect(mockedFetch).toHaveBeenNthCalledWith(1, `${customGateway}/ipfs/${ipfsHash}`);
    //     expect(response).toEqual(mockedJSONContent);
    // });
    //
    // it('should retrieve the file stream from ipfs', async () => {
    //     mockedFetch.mockResolvedValue({ body: mockedFileStream, ok: true } as Response);
    //     const response = await pinataIPFSDriver.retrieveFile(ipfsHash);
    //
    //     expect(mockedFetch).toHaveBeenCalledTimes(1);
    //     expect(mockedFetch).toHaveBeenNthCalledWith(1, `${customGateway}/ipfs/${ipfsHash}`);
    //     expect(response).toEqual(mockedFileStream);
    // });
    //
    // it('should delete the ipfs file stored', async () => {
    //     await pinataIPFSDriver.delete(ipfsHash);
    //
    //     expect(mockedPinataClient.unpin).toHaveBeenCalledTimes(1);
    //     expect(mockedPinataClient.unpin).toHaveBeenNthCalledWith(1, ipfsHash);
    // });
});
