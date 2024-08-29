import { CredentialRevocationDriver, METHOD_NAME } from './CredentialRevocationDriver';
import { BigNumber, BytesLike, Signer, Wallet } from 'ethers';
import { RoleProof } from '../types/RoleProof';
import { createMock } from 'ts-auto-mock';
import { RevocationRegistry, RevocationRegistry__factory } from '../smart-contracts';
import { jwtDecode } from 'jwt-decode';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';

jest.mock('jwt-decode');
jest.mock('ethers/lib/utils');

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
            credentialStatus: {
                id: 'hardhat:' + mockedContract.address,
                type: METHOD_NAME
            },
            iss: 'did:ethr:dev:0x123'
        });
        (toUtf8Bytes as jest.Mock).mockReturnValue('bytes' as BytesLike);
        (keccak256 as jest.Mock).mockReturnValue('hash');
    });

    describe('revoke', () => {
        it('should revoke a credential', async () => {
            await driver.revoke('jwt');

            expect(jwtDecode).toHaveBeenCalledTimes(1);
            expect(jwtDecode).toHaveBeenCalledWith('jwt');
            expect(RevocationRegistry__factory.connect).toHaveBeenCalledTimes(1);
            expect(RevocationRegistry__factory.connect).toHaveBeenCalledWith(
                mockedContract.address,
                mockedSigner.provider!
            );
            expect(mockedRevocationRegistryConnect).toHaveBeenCalledTimes(1);
            expect(toUtf8Bytes).toHaveBeenCalledTimes(1);
            expect(toUtf8Bytes).toHaveBeenCalledWith('jwt');
            expect(keccak256).toHaveBeenCalledTimes(1);
            expect(keccak256).toHaveBeenCalledWith('bytes');
            expect(mockRevoke).toHaveBeenCalledTimes(1);
            expect(mockRevoke).toHaveBeenCalledWith('hash');
            expect(mockWait).toHaveBeenCalledTimes(1);
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
            expect(toUtf8Bytes).toHaveBeenCalledTimes(1);
            expect(toUtf8Bytes).toHaveBeenCalledWith('jwt');
            expect(keccak256).toHaveBeenCalledTimes(1);
            expect(keccak256).toHaveBeenCalledWith('bytes');
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
});
