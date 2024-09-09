import { DocumentType, DocumentEvaluationStatus, DocumentInfo, EvaluationStatus, FundsStatus, Shipment } from "./Shipment";

describe("Shipment Entity", () => {
    it("initializes shipment with correct values", () => {
        const shipment = new Shipment(
            "0xSupplierAddress",
            "0xCommissionerAddress",
            "http://external.url",
            "0xEscrowAddress",
            "0xDocumentManagerAddress",
            EvaluationStatus.NOT_EVALUATED,
            EvaluationStatus.NOT_EVALUATED,
            EvaluationStatus.NOT_EVALUATED,
            FundsStatus.NOT_LOCKED,
            false,
            1,
            new Date("2023-01-01"),
            new Date("2023-01-02"),
            "USD",
            0,
            100,
            10,
            1000,
            1100,
            100
        );

        expect(shipment.supplierAddress).toEqual("0xSupplierAddress");
        expect(shipment.commissionerAddress).toEqual("0xCommissionerAddress");
        expect(shipment.externalUrl).toEqual("http://external.url");
        expect(shipment.escrowAddress).toEqual("0xEscrowAddress");
        expect(shipment.documentManagerAddress).toEqual("0xDocumentManagerAddress");
        expect(shipment.sampleEvaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(shipment.detailsEvaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(shipment.qualityEvaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(shipment.fundsStatus).toEqual(FundsStatus.NOT_LOCKED);
        expect(shipment.detailsSet).toEqual(false);
        expect(shipment.shipmentNumber).toEqual(1);
        expect(shipment.expirationDate).toEqual(new Date("2023-01-01"));
        expect(shipment.fixingDate).toEqual(new Date("2023-01-02"));
        expect(shipment.targetExchange).toEqual("USD");
        expect(shipment.differentialApplied).toEqual(0);
        expect(shipment.price).toEqual(100);
        expect(shipment.quantity).toEqual(10);
        expect(shipment.containersNumber).toEqual(1000);
        expect(shipment.netWeight).toEqual(1100);
        expect(shipment.grossWeight).toEqual(100);
    });

    it("updates shipment details correctly", () => {
        const shipment = new Shipment(
            "0xSupplierAddress",
            "0xCommissionerAddress",
            "http://external.url",
            "0xEscrowAddress",
            "0xDocumentManagerAddress",
            EvaluationStatus.NOT_EVALUATED,
            EvaluationStatus.NOT_EVALUATED,
            EvaluationStatus.NOT_EVALUATED,
            FundsStatus.NOT_LOCKED,
            false,
            1,
            new Date("2023-01-01"),
            new Date("2023-01-02"),
            "USD",
            0,
            100,
            10,
            1000,
            1100,
            100
        );

        shipment.supplierAddress = "0xNewSupplierAddress";
        shipment.commissionerAddress = "0xNewCommissionerAddress";
        shipment.externalUrl = "http://new.external.url";
        shipment.escrowAddress = "0xNewEscrowAddress";
        shipment.documentManagerAddress = "0xNewDocumentManagerAddress";
        shipment.sampleEvaluationStatus = EvaluationStatus.APPROVED;
        shipment.detailsEvaluationStatus = EvaluationStatus.APPROVED;
        shipment.qualityEvaluationStatus = EvaluationStatus.APPROVED;
        shipment.fundsStatus = FundsStatus.LOCKED;
        shipment.detailsSet = true;
        shipment.shipmentNumber = 2;
        shipment.expirationDate = new Date("2023-02-01");
        shipment.fixingDate = new Date("2023-02-02");
        shipment.targetExchange = "EUR";
        shipment.differentialApplied = 1;
        shipment.price = 200;
        shipment.quantity = 20;
        shipment.containersNumber = 2000;
        shipment.netWeight = 2200;
        shipment.grossWeight = 2200;

        expect(shipment.supplierAddress).toEqual("0xNewSupplierAddress");
        expect(shipment.commissionerAddress).toEqual("0xNewCommissionerAddress");
        expect(shipment.externalUrl).toEqual("http://new.external.url");
        expect(shipment.escrowAddress).toEqual("0xNewEscrowAddress");
        expect(shipment.documentManagerAddress).toEqual("0xNewDocumentManagerAddress");
        expect(shipment.sampleEvaluationStatus).toEqual(EvaluationStatus.APPROVED);
        expect(shipment.detailsEvaluationStatus).toEqual(EvaluationStatus.APPROVED);
        expect(shipment.qualityEvaluationStatus).toEqual(EvaluationStatus.APPROVED);
        expect(shipment.fundsStatus).toEqual(FundsStatus.LOCKED);
        expect(shipment.detailsSet).toEqual(true);
        expect(shipment.shipmentNumber).toEqual(2);
        expect(shipment.expirationDate).toEqual(new Date("2023-02-01"));
        expect(shipment.fixingDate).toEqual(new Date("2023-02-02"));
        expect(shipment.targetExchange).toEqual("EUR");
        expect(shipment.differentialApplied).toEqual(1);
        expect(shipment.price).toEqual(200);
        expect(shipment.quantity).toEqual(20);
        expect(shipment.containersNumber).toEqual(2000);
        expect(shipment.netWeight).toEqual(2200);
        expect(shipment.grossWeight).toEqual(2200);
    });

    it("initializes document info with correct values", () => {
        const documentInfo = new DocumentInfo(1, DocumentType.SERVICE_GUIDE, DocumentEvaluationStatus.NOT_EVALUATED, "0xUploaderAddress");

        expect(documentInfo.id).toEqual(1);
        expect(documentInfo.type).toEqual(DocumentType.SERVICE_GUIDE);
        expect(documentInfo.status).toEqual(DocumentEvaluationStatus.NOT_EVALUATED);
        expect(documentInfo.uploader).toEqual("0xUploaderAddress");
    });

    it("updates document info correctly", () => {
        const documentInfo = new DocumentInfo(1, DocumentType.SERVICE_GUIDE, DocumentEvaluationStatus.NOT_EVALUATED, "0xUploaderAddress");

        documentInfo.id = 2;
        documentInfo.type = DocumentType.BILL_OF_LADING;
        documentInfo.status = DocumentEvaluationStatus.APPROVED;
        documentInfo.uploader = "0xNewUploaderAddress";

        expect(documentInfo.id).toEqual(2);
        expect(documentInfo.type).toEqual(DocumentType.BILL_OF_LADING);
        expect(documentInfo.status).toEqual(DocumentEvaluationStatus.APPROVED);
        expect(documentInfo.uploader).toEqual("0xNewUploaderAddress");
    });
});
