import {
    Order as ICPOrder,
    OrderStatus as ICPOrderStatus,
    Shipment as ICPShipment,
    Phase as ICPPhase,
    FundStatus as ICPFundStatus,
    DocumentType as ICPDocumentType,
    EvaluationStatus as ICPEvaluationStatus
} from '@kbc-lib/azle-types';
import { Order, OrderStatus } from '../../entities/icp/Order';
import { EvaluationStatus, Shipment } from '../../entities/icp/Shipment';
import { DocumentInfo, DocumentTypeEnum as DocumentType } from '@kbc-lib/azle-types';
import { Phase, FundStatus } from '../../entities/icp/Shipment';

export class EntityBuilder {
    static buildOrder(order: ICPOrder) {
        console.log(order.paymentDeadline);
        return new Order(
            Number(order.id),
            order.supplier,
            order.customer,
            order.commissioner,
            order.signatures,
            this._buildOrderStatus(order.status),
            new Date(Number(order.paymentDeadline) * 1000),
            new Date(Number(order.documentDeliveryDeadline) * 1000),
            new Date(Number(order.shippingDeadline) * 1000),
            new Date(Number(order.deliveryDeadline) * 1000),
            order.arbiter,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            order.lines.map((line) => ({
                productCategoryId: Number(line.productCategoryId),
                quantity: Number(line.quantity),
                unit: line.unit,
                price: {
                    amount: Number(line.price.amount),
                    fiat: line.price.fiat
                }
            })),
            order.token,
            Number(order.agreedAmount),
            // TODO check if this is correct
            order.shipmentId[0] ? Number(order.shipmentId[0]) : -1
        );
    }

    static _buildOrderStatus(orderStatus: ICPOrderStatus): OrderStatus {
        if (OrderStatus.PENDING in orderStatus) return OrderStatus.PENDING;
        if (OrderStatus.CONFIRMED in orderStatus) return OrderStatus.CONFIRMED;
        if (OrderStatus.EXPIRED in orderStatus) return OrderStatus.EXPIRED;
        throw new Error('Invalid document type');
    }

    static buildShipment(shipment: ICPShipment): Shipment {
        if (shipment.escrowAddress.length === 0) throw new Error('Invalid escrow address');

        return new Shipment(
            Number(shipment.id),
            shipment.supplier,
            shipment.commissioner,
            shipment.escrowAddress[0],
            this._buildEvaluationStatus(shipment.sampleEvaluationStatus),
            this._buildEvaluationStatus(shipment.detailsEvaluationStatus),
            this._buildEvaluationStatus(shipment.qualityEvaluationStatus),
            this._buildFundStatus(shipment.fundsStatus),
            shipment.detailsSet,
            shipment.sampleApprovalRequired,
            Number(shipment.shipmentNumber),
            new Date(Number(shipment.expirationDate) * 1000),
            new Date(Number(shipment.fixingDate) * 1000),
            shipment.targetExchange,
            Number(shipment.differentialApplied),
            Number(shipment.price),
            Number(shipment.quantity),
            Number(shipment.containersNumber),
            Number(shipment.netWeight),
            Number(shipment.grossWeight),
            this.buildShipmentDocuments(shipment.documents)
        );
    }

    static buildShipmentDocuments = (
        icpDocuments: Array<[ICPDocumentType, DocumentInfo[]]>
    ): Map<DocumentType, DocumentInfo[]> => {
        const documents = new Map<DocumentType, DocumentInfo[]>();

        for (const [icpDocumentType, infos] of icpDocuments) {
            const documentType = this._buildDocumentType(icpDocumentType);
            const documentInfos = documents.get(documentType) || [];
            documentInfos.push(...infos);
            documents.set(documentType, documentInfos);
        }

        return documents;
    };

    static buildShipmentPhase = (phase: ICPPhase): Phase => {
        if (Phase.PHASE_1 in phase) return Phase.PHASE_1;
        if (Phase.PHASE_2 in phase) return Phase.PHASE_2;
        if (Phase.PHASE_3 in phase) return Phase.PHASE_3;
        if (Phase.PHASE_4 in phase) return Phase.PHASE_4;
        if (Phase.PHASE_5 in phase) return Phase.PHASE_5;
        if (Phase.CONFIRMED in phase) return Phase.CONFIRMED;
        if (Phase.ARBITRATION in phase) return Phase.ARBITRATION;
        throw new Error('Invalid phase');
    };

    static _buildFundStatus = (status: ICPFundStatus): FundStatus => {
        if (FundStatus.NOT_LOCKED in status) return FundStatus.NOT_LOCKED;
        if (FundStatus.LOCKED in status) return FundStatus.LOCKED;
        if (FundStatus.RELEASED in status) return FundStatus.RELEASED;
        throw new Error('Invalid fund status');
    };

    static _buildEvaluationStatus = (status: ICPEvaluationStatus): EvaluationStatus => {
        if (EvaluationStatus.NOT_EVALUATED in status) return EvaluationStatus.NOT_EVALUATED;
        if (EvaluationStatus.APPROVED in status) return EvaluationStatus.APPROVED;
        if (EvaluationStatus.NOT_APPROVED in status) return EvaluationStatus.NOT_APPROVED;
        throw new Error('Invalid evaluation status');
    };

    static _buildDocumentType = (type: ICPDocumentType): DocumentType => {
        if (DocumentType.SERVICE_GUIDE in type) return DocumentType.SERVICE_GUIDE;
        if (DocumentType.SENSORY_EVALUATION_ANALYSIS_REPORT in type)
            return DocumentType.SENSORY_EVALUATION_ANALYSIS_REPORT;
        if (DocumentType.SUBJECT_TO_APPROVAL_OF_SAMPLE in type)
            return DocumentType.SUBJECT_TO_APPROVAL_OF_SAMPLE;
        if (DocumentType.PRE_SHIPMENT_SAMPLE in type) return DocumentType.PRE_SHIPMENT_SAMPLE;
        if (DocumentType.SHIPPING_INSTRUCTIONS in type) return DocumentType.SHIPPING_INSTRUCTIONS;
        if (DocumentType.SHIPPING_NOTE in type) return DocumentType.SHIPPING_NOTE;
        if (DocumentType.BOOKING_CONFIRMATION in type) return DocumentType.BOOKING_CONFIRMATION;
        if (DocumentType.CARGO_COLLECTION_ORDER in type) return DocumentType.CARGO_COLLECTION_ORDER;
        if (DocumentType.EXPORT_INVOICE in type) return DocumentType.EXPORT_INVOICE;
        if (DocumentType.TRANSPORT_CONTRACT in type) return DocumentType.TRANSPORT_CONTRACT;
        if (DocumentType.TO_BE_FREED_SINGLE_EXPORT_DECLARATION in type)
            return DocumentType.TO_BE_FREED_SINGLE_EXPORT_DECLARATION;
        if (DocumentType.EXPORT_CONFIRMATION in type) return DocumentType.EXPORT_CONFIRMATION;
        if (DocumentType.FREED_SINGLE_EXPORT_DECLARATION in type)
            return DocumentType.FREED_SINGLE_EXPORT_DECLARATION;
        if (DocumentType.CONTAINER_PROOF_OF_DELIVERY in type)
            return DocumentType.CONTAINER_PROOF_OF_DELIVERY;
        if (DocumentType.PHYTOSANITARY_CERTIFICATE in type)
            return DocumentType.PHYTOSANITARY_CERTIFICATE;
        if (DocumentType.BILL_OF_LADING in type) return DocumentType.BILL_OF_LADING;
        if (DocumentType.ORIGIN_CERTIFICATE_ICO in type) return DocumentType.ORIGIN_CERTIFICATE_ICO;
        if (DocumentType.WEIGHT_CERTIFICATE in type) return DocumentType.WEIGHT_CERTIFICATE;
        if (DocumentType.GENERIC in type) return DocumentType.GENERIC;
        throw new Error('Invalid document');
    };
}
