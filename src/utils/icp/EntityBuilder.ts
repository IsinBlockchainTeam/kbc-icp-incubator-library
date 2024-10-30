import {
    ProductCategory as ICPProductCategory,
    Material as ICPMaterial,
    Order as ICPOrder,
    OrderStatus as ICPOrderStatus,
    Shipment as ICPShipment,
    Phase as ICPPhase,
    FundStatus as ICPFundStatus,
    DocumentType as IDLDocumentType,
    DocumentInfo as IDLDocumentInfo,
    EvaluationStatus as ICPEvaluationStatus,
    OrderStatusEnum as OrderStatus
} from '@kbc-lib/azle-types';
import { Order } from '../../entities/icp/Order';
import { Shipment , Phase, FundStatus } from '../../entities/icp/Shipment';
import { DocumentInfo, DocumentType } from '../../entities/icp/Document';
import { EvaluationStatus } from '../../entities/icp/Evaluation';
import { ProductCategory } from '../../entities/ProductCategory';
import { Material } from '../../entities/Material';

export class EntityBuilder {
    static buildProductCategory(productCategory: ICPProductCategory) {
        return new ProductCategory(
            Number(productCategory.id),
            productCategory.name,
            Number(productCategory.quality),
            productCategory.description
        );
    }

    static buildMaterial(material: ICPMaterial) {
        return new Material(
            Number(material.id),
            this.buildProductCategory(material.productCategory)
        );
    }

    static buildOrder(order: ICPOrder) {
        const shipment = order.shipment.map((s) => this.buildShipment(s))[0] || null;
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
                productCategory: this.buildProductCategory(line.productCategory),
                quantity: Number(line.quantity),
                unit: line.unit,
                price: {
                    amount: Number(line.price.amount),
                    fiat: line.price.fiat
                }
            })),
            order.token,
            Number(order.agreedAmount),
            shipment
        );
    }

    static _buildOrderStatus(orderStatus: ICPOrderStatus): OrderStatus {
        if (OrderStatus.PENDING in orderStatus) return OrderStatus.PENDING;
        if (OrderStatus.CONFIRMED in orderStatus) return OrderStatus.CONFIRMED;
        if (OrderStatus.EXPIRED in orderStatus) return OrderStatus.EXPIRED;
        throw new Error('Invalid document type');
    }

    static buildShipment(shipment: ICPShipment): Shipment {
        // TODO: understand how to manage escrow
        // if (shipment.escrowAddress.length === 0) throw new Error('Invalid escrow address');

        return new Shipment(
            Number(shipment.id),
            shipment.supplier,
            shipment.commissioner,
            shipment.escrowAddress[0] ? shipment.escrowAddress[0] : '',
            this.buildEvaluationStatus(shipment.sampleEvaluationStatus),
            this.buildEvaluationStatus(shipment.detailsEvaluationStatus),
            this.buildEvaluationStatus(shipment.qualityEvaluationStatus),
            this.buildFundStatus(shipment.fundsStatus),
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
        icpDocuments: Array<[IDLDocumentType, IDLDocumentInfo[]]>
    ): Map<DocumentType, DocumentInfo[]> => icpDocuments.reduce(
            (acc, [documentType, documentInfos]) =>
                acc.set(
                    EntityBuilder.buildDocumentType(documentType),
                    documentInfos.map((documentInfo) =>
                        EntityBuilder.buildDocumentInfo(documentInfo)
                    )
                ),
            new Map<DocumentType, DocumentInfo[]>()
        );

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

    static buildShipmentIDLPhase = (phase: Phase): ICPPhase => ({
            [phase]: null
        } as ICPPhase);

    static buildFundStatus = (status: ICPFundStatus): FundStatus => {
        if (FundStatus.NOT_LOCKED in status) return FundStatus.NOT_LOCKED;
        if (FundStatus.LOCKED in status) return FundStatus.LOCKED;
        if (FundStatus.RELEASED in status) return FundStatus.RELEASED;
        throw new Error('Invalid fund status');
    };

    static buildEvaluationStatus = (status: ICPEvaluationStatus): EvaluationStatus => {
        if (EvaluationStatus.NOT_EVALUATED in status) return EvaluationStatus.NOT_EVALUATED;
        if (EvaluationStatus.APPROVED in status) return EvaluationStatus.APPROVED;
        if (EvaluationStatus.NOT_APPROVED in status) return EvaluationStatus.NOT_APPROVED;
        throw new Error('Invalid evaluation status');
    };

    static buildIDLEvaluationStatus = (status: EvaluationStatus): ICPEvaluationStatus => ({
            [status]: null
        } as ICPEvaluationStatus);

    static buildDocumentType = (type: IDLDocumentType): DocumentType => {
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

    static buildIDLDocumentType = (docType: DocumentType): IDLDocumentType => ({
            [docType]: null
        } as IDLDocumentType);

    static buildDocumentInfo = (info: IDLDocumentInfo): DocumentInfo => ({
            id: Number(info.id),
            documentType: this.buildDocumentType(info.documentType),
            evaluationStatus: this.buildEvaluationStatus(info.evaluationStatus),
            uploadedBy: info.uploadedBy,
            externalUrl: info.externalUrl
        });
}
