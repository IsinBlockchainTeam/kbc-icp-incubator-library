import {call} from "azle";
import {PRINCIPAL} from "azle/canisters/management";
import EmailService from "../EmailService";

jest.mock('azle', () => ({
    call: jest.fn()
}));
jest.mock('../../constants/misc', () => ({
    Misc: {
        COURIER_API_KEY: 'mock key'
    }
}));
const Template = {
    INVITE_COMPANY: "DHG79CSQWYMMZQMMAPKP2SK9JZ0K",
    SEND_CREDENTIAL: "NVPRJVMSMWMRHCH9MBWGD8VGR3T8"
};
describe("EmailService", () => {
    let emailService: EmailService;
    const httpResponseMock = {
        status: 200,
        body: 'ok'
    };
    const recipientMock = {
        email: 'recipient@email.com',
        name: 'Recipient Name',
        qrCode: 'Mock QR Code'
    }

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());

        (call as jest.Mock).mockResolvedValue(httpResponseMock);
        emailService = EmailService.instance;
        jest.clearAllMocks();
    });

    it("invites organization", async () => {
        await emailService.inviteOrganization(recipientMock.email, recipientMock.name);
        expect(call).toHaveBeenCalledTimes(1);
        const expectedBody = JSON.stringify({
            message: {
                to: {
                    email: recipientMock.email
                },
                template: Template.INVITE_COMPANY,
                data: {
                    organizationName: recipientMock.name
                }
            }
        });
        expect(call).toHaveBeenCalledWith(
            PRINCIPAL,
            'http_request',
            {
                paramIdlTypes: expect.any(Array),
                returnIdlType: expect.any(Object),
                args: [
                    {
                        url: "https://api.courier.com/send",
                        max_response_bytes: [2_000n],
                        method: {
                            post: null
                        },
                        headers: [
                            {
                                name: "Authorization",
                                value: expect.any(String)
                            },
                            {
                                name: "Idempotency-Key",
                                value: expect.any(String)
                            }
                        ],
                        body: [new TextEncoder().encode(expectedBody)],
                        transform: []
                    }
                ],
                payment: 50_000_000n
            }
        );
    });
    it("sends organization credential", async () => {
        await emailService.sendOrganizationCredential(recipientMock.email, recipientMock.name, recipientMock.qrCode);
        expect(call).toHaveBeenCalledTimes(1);
        const expectedBody = JSON.stringify({
            message: {
                to: {
                    email: recipientMock.email
                },
                template: Template.SEND_CREDENTIAL,
                data: {
                    organizationName: recipientMock.name,
                    credentialQrCode: recipientMock.qrCode
                }
            }
        });
        expect(call).toHaveBeenCalledWith(
            PRINCIPAL,
            'http_request',
            {
                paramIdlTypes: expect.any(Array),
                returnIdlType: expect.any(Object),
                args: [
                    {
                        url: "https://api.courier.com/send",
                        max_response_bytes: [2_000n],
                        method: {
                            post: null
                        },
                        headers: [
                            {
                                name: "Authorization",
                                value: expect.any(String)
                            },
                            {
                                name: "Idempotency-Key",
                                value: expect.any(String)
                            }
                        ],
                        body: [new TextEncoder().encode(expectedBody)],
                        transform: []
                    }
                ],
                payment: 50_000_000n
            }
        );
    });
});
