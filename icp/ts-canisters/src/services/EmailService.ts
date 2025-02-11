import {call} from "azle";
import {HttpRequestArgs, HttpResponse, PRINCIPAL} from "azle/canisters/management";
import { v4 as uuidv4 } from 'uuid';
import {Misc} from "../constants/misc";
import {EmailNotSentError} from "../models/errors/EmailError";

const Template = {
    INVITE_COMPANY: "DHG79CSQWYMMZQMMAPKP2SK9JZ0K",
    SEND_CREDENTIAL: "NVPRJVMSMWMRHCH9MBWGD8VGR3T8"
};
class EmailService {
    private static _instance: EmailService;

    static get instance() {
        if (!EmailService._instance) {
            EmailService._instance = new EmailService();
        }
        return EmailService._instance;
    }

    private async sendEmail(recipient: string, template: string, data: {[key: string]: string} = {}): Promise<void> {
        const body = JSON.stringify({
            message: {
                to: {
                    email: recipient
                },
                template,
                data
            }
        });
        const bodyArray = new TextEncoder().encode(body);
        try {
            const httpResponse = await call(PRINCIPAL, 'http_request', {
                paramIdlTypes: [HttpRequestArgs],
                returnIdlType: HttpResponse,
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
                                value: `Bearer ${Misc.COURIER_API_KEY}`
                            },
                            {
                                name: "Idempotency-Key",
                                value: uuidv4()
                            }
                        ],
                        body: [bodyArray],
                        transform: []
                    }
                ],
                payment: 50_000_000n
            });
            const c = new TextDecoder().decode(Uint8Array.from(httpResponse.body));
            console.log("Email sent", c);
        } catch (error) {
            console.error("Email not sent", error);
            throw new EmailNotSentError();
        }
    }

    async inviteOrganization(recipient: string, name: string): Promise<void> {
        await this.sendEmail(recipient, Template.INVITE_COMPANY, {
            organizationName: name
        });
    }

    async sendOrganizationCredential(recipient: string, name: string, credentialQrCode: string): Promise<void> {
        await this.sendEmail(recipient, Template.SEND_CREDENTIAL, {
            organizationName: name,
            credentialQrCode
        });
    }
}
export default EmailService;
