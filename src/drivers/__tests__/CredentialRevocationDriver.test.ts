import { CredentialRevocationDriver, METHOD_NAME } from '../CredentialRevocationDriver';
import { BigNumber, BytesLike, Signer } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { RevocationRegistry, RevocationRegistry__factory } from '../../smart-contracts';
import { jwtDecode } from 'jwt-decode';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';

jest.mock('jwt-decode');

describe('CredentialRevocationDriver', () => {
    let driver: CredentialRevocationDriver;
    let mockedSigner: Signer;

    const mockRevoke = jest.fn();
    const mockRevoked = jest.fn();

    const mockedRevocationRegistryConnect = jest.fn();
    const mockWait = jest.fn();

    mockRevoke.mockReturnValue({ wait: mockWait });
    mockRevoked.mockReturnValue(0);

    const mockedContract = createMock<RevocationRegistry>({
        revoke: mockRevoke,
        revoked: mockRevoked
    });

    beforeAll(() => {
        mockedRevocationRegistryConnect.mockReturnValue(mockedContract);
        const mockedCredentialRevocation = createMock<RevocationRegistry>({
            connect: mockedRevocationRegistryConnect
        });

        jest.spyOn(RevocationRegistry__factory, 'connect').mockReturnValue(
            mockedCredentialRevocation
        );

        mockedSigner = createMock<Signer>();
        driver = new CredentialRevocationDriver(mockedSigner);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockRevoked.mockReturnValue(BigNumber.from(0));
        (jwtDecode as jest.Mock).mockReturnValue({
            id: '123',
            credentialStatus: {
                id: 'hardhat:' + mockedContract.address,
                type: METHOD_NAME
            },
            iss: 'did:ethr:dev:0x123'
        });
        mockWait.mockReturnValue({
            events: [
                {
                    event: 'Revoked',
                    args: ['0x123', '0x456']
                }
            ]
        });
    });

    describe('revoke', () => {
        it('should revoke a credential', async () => {
            const result = await driver.revoke('jwt');

            expect(result).toBe('0x456');
            expect(jwtDecode).toHaveBeenCalledTimes(1);
            expect(jwtDecode).toHaveBeenCalledWith('jwt');
            expect(RevocationRegistry__factory.connect).toHaveBeenCalledTimes(1);
            expect(RevocationRegistry__factory.connect).toHaveBeenCalledWith(
                mockedContract.address,
                mockedSigner.provider!
            );
            expect(mockedRevocationRegistryConnect).toHaveBeenCalledTimes(1);
            expect(mockRevoke).toHaveBeenCalledTimes(1);
            expect(mockRevoke).toHaveBeenCalledWith('123');
            expect(mockWait).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if no events are found', async () => {
            mockWait.mockReturnValueOnce({
                events: null
            });
            await expect(driver.revoke('jwt')).rejects.toThrow(
                'Error during credential revocation, no events found'
            );
        });
    });

    describe('revoked', () => {
        it('should check status of a valid status', async () => {
            const result = await driver.revoked('jwt');

            expect(result).toStrictEqual({ revoked: false });
            expect(jwtDecode).toHaveBeenCalledTimes(1);
            expect(jwtDecode).toHaveBeenCalledWith('jwt');
            expect(RevocationRegistry__factory.connect).toHaveBeenCalledTimes(1);
            expect(RevocationRegistry__factory.connect).toHaveBeenCalledWith(
                mockedContract.address,
                mockedSigner.provider!
            );
            expect(mockedRevocationRegistryConnect).toHaveBeenCalledTimes(1);
            expect(mockRevoked).toHaveBeenCalledTimes(1);
        });

        it('should check status of a revoked credential', async () => {
            (mockRevoked as jest.Mock).mockReturnValueOnce(BigNumber.from(42));
            const result = await driver.revoked('jwt');

            expect(result).toStrictEqual({ revoked: true, blockNumber: 42 });
            expect(mockRevoked).toHaveBeenCalledTimes(1);
        });
    });

    describe('getRevocationRegistry', () => {
        it('should use statusEntry from vc if credentialStatus is missing', async () => {
            (jwtDecode as jest.Mock).mockReturnValue({
                vc: {
                    id: '123',
                    credentialStatus: {
                        id: 'hardhat:' + mockedContract.address,
                        type: METHOD_NAME
                    }
                }
            });
            await driver.revoke('jwt');

            expect(mockRevoke).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if credentialStatus is missing', async () => {
            (jwtDecode as jest.Mock).mockReturnValue({});
            await expect(driver.revoke('jwt')).rejects.toThrow(
                'Credential not revocable: credential is missing "credentialStatus" property'
            );
        });

        it('should throw an error if credentialStatus type is not supported', async () => {
            (jwtDecode as jest.Mock).mockReturnValue({
                credentialStatus: {
                    id: 'hardhat:' + mockedContract.address,
                    type: 'not_supported_type'
                }
            });
            await expect(driver.revoke('jwt')).rejects.toThrow(
                'Credential not revocable: credentialStatus type is not supported. Supported types: ' +
                    METHOD_NAME
            );
        });

        it('should throw an error if id field in credentialStatus is malformed', async () => {
            (jwtDecode as jest.Mock).mockReturnValue({
                credentialStatus: {
                    id: 'malformed_id',
                    type: METHOD_NAME
                }
            });
            await expect(driver.revoke('jwt')).rejects.toThrow(
                'Credential not revocable: malformed "id" field in "credentialStatus" entry'
            );
        });
    });

    describe('getCredentialId', () => {
        it.each([
            {
                id: 1
            },
            {
                vc: { id: 1 }
            },
            {
                jti: 1
            },
            {
                vc: { jti: 1 }
            }
        ])('should get credential id from jwt', async (jwt) => {
            (jwtDecode as jest.Mock).mockReturnValue({
                ...jwt,
                credentialStatus: {
                    id: 'hardhat:' + mockedContract.address,
                    type: METHOD_NAME
                },
                iss: 'did:ethr:dev:0x123'
            });
            await driver.revoke(JSON.stringify(jwt));

            expect(mockRevoke).toHaveBeenCalledTimes(1);
            expect(mockRevoke).toHaveBeenCalledWith(1);
        });

        it('should throw error when credentialId is not found', async () => {
            (jwtDecode as jest.Mock).mockReturnValue({
                credentialStatus: {
                    id: 'hardhat:' + mockedContract.address,
                    type: METHOD_NAME
                },
                iss: 'did:ethr:dev:0x123'
            });
            await expect(driver.revoke('jwt')).rejects.toThrow(
                'Credential not revocable: credential is missing "id" property'
            );
        });
    });
});
