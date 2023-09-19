import { IPFSService, PinataIPFSDriver } from '@blockchain-lib/common';
import { format } from 'logform';
import { envVariables } from '../utils/constants';
import { OrderMetadata } from './OrderMetadata';
import { Trade } from './Trade';
import metadata = format.metadata;
import metadata = format.metadata;

export class Order extends Trade {
    private _ipfsService?: IPFSService;

    private _offeree: string;

    private _offereeSigned: boolean;

    private _offeror: string;

    private _offerorSigned: boolean;

    private _paymentDeadline?: Date;

    private _documentDeliveryDeadline?: Date;

    private _arbiter?: string;

    private _shippingDeadline?: Date;

    private _deliveryDeadline?: Date;

    private _metadata?: OrderMetadata;

    constructor(id: number, name: string, supplier: string, customer: string, externalUrl: string, offeree: string, offeror: string, lineIds: number[], paymentDeadline: Date, documentDeliveryDeadline: Date, arbiter: string, shippingDeadline: Date, deliveryDeadline: Date) {
        super(id, name, supplier, customer, externalUrl, lineIds);
        this._offeree = offeree;
        this._offeror = offeror;
        this._offereeSigned = false;
        this._offerorSigned = false;
        this._paymentDeadline = paymentDeadline.getTime() !== 0 ? paymentDeadline : undefined;
        this._documentDeliveryDeadline = documentDeliveryDeadline.getTime() !== 0 ? documentDeliveryDeadline : undefined;
        this._arbiter = arbiter !== '' ? arbiter : undefined;
        this._shippingDeadline = shippingDeadline.getTime() !== 0 ? shippingDeadline : undefined;
        this._deliveryDeadline = deliveryDeadline.getTime() !== 0 ? deliveryDeadline : undefined;
    }

    get ipfsService(): IPFSService {
        return this._ipfsService;
    }

    set ipfsService(value: IPFSService) {
        this._ipfsService = value;
    }

    get offeree(): string {
        return this._offeree;
    }

    set offeree(value: string) {
        this._offeree = value;
    }

    get offereeSigned(): boolean {
        return this._offereeSigned;
    }

    set offereeSigned(value: boolean) {
        this._offereeSigned = value;
    }

    get offeror(): string {
        return this._offeror;
    }

    set offeror(value: string) {
        this._offeror = value;
    }

    get offerorSigned(): boolean {
        return this._offerorSigned;
    }

    set offerorSigned(value: boolean) {
        this._offerorSigned = value;
    }

    get paymentDeadline(): Date {
        return this._paymentDeadline;
    }

    set paymentDeadline(value: Date) {
        this._paymentDeadline = value;
    }

    get documentDeliveryDeadline(): Date {
        return this._documentDeliveryDeadline;
    }

    set documentDeliveryDeadline(value: Date) {
        this._documentDeliveryDeadline = value;
    }

    get arbiter(): string {
        return this._arbiter;
    }

    set arbiter(value: string) {
        this._arbiter = value;
    }

    get shippingDeadline(): Date {
        return this._shippingDeadline;
    }

    set shippingDeadline(value: Date) {
        this._shippingDeadline = value;
    }

    get deliveryDeadline(): Date {
        return this._deliveryDeadline;
    }

    set deliveryDeadline(value: Date) {
        this._deliveryDeadline = value;
    }

    // TODO: manage externally the metadata information
    get metadata(): Promise<OrderMetadata | undefined> {
        if (!this._ipfsService) this._ipfsService = new IPFSService(new PinataIPFSDriver(envVariables.PINATA_API_KEY(), envVariables.PINATA_SECRET_API_KEY()));

        return (async () => {
            if (!this._metadata) {
                try {
                    const metadata = await this._ipfsService!.retrieveJSON(this._externalUrl);
                    if (metadata) this._metadata = metadata;
                } catch (e) {
                    console.error('Error while retrieve order metadata from IPFS: ', e);
                }
            }
            return this._metadata;
        })();
    }
}
