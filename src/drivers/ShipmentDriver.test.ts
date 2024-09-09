import {createMock} from "ts-auto-mock";
import {Signer, Wallet} from "ethers";
import {Shipment as ShipmentContract, Shipment__factory} from "../smart-contracts";
import {ShipmentDriver} from "./ShipmentDriver";
import {RoleProof} from "../types/RoleProof";
import {DocumentEvaluationStatus, DocumentType, EvaluationStatus, Phase} from "../entities/Shipment";

describe("ShipmentDriver", () => {
    let shipmentDriver: ShipmentDriver;
    const roleProof: RoleProof = {
        signedProof: 'signedProof',
        delegator: 'delegator'
    };
    const contractAddress: string = Wallet.createRandom().address;
    let mockedSigner: Signer;
    const mockedConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();
    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait
    });

    const mockedContract = createMock<ShipmentContract>({
        getShipment: mockedReadFunction,
        getPhase: mockedReadFunction,
        getDocumentsIds: mockedReadFunction,
        getDocumentInfo: mockedReadFunction,
        setDetails: mockedWriteFunction,
        evaluateSample: mockedWriteFunction,
        evaluateDetails: mockedWriteFunction,
        evaluateQuality: mockedWriteFunction,
        depositFunds: mockedWriteFunction,
        addDocument: mockedWriteFunction,
        updateDocument: mockedWriteFunction,
        evaluateDocument: mockedWriteFunction,
        getUploadableDocuments: mockedReadFunction,
        getRequiredDocuments: mockedReadFunction
    });

    beforeEach(async () => {
        mockedConnect.mockReturnValue(mockedContract);
        const mockedShipmentContract = createMock<ShipmentContract>({
            connect: mockedConnect
        });
        jest.spyOn(Shipment__factory, "connect").mockReturnValue(mockedShipmentContract);
        mockedSigner = createMock<Signer>();
        shipmentDriver = new ShipmentDriver(mockedSigner, contractAddress);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it("retrieves shipment details successfully", async () => {
        mockedToNumber.mockReturnValue(1);
        const rawShipment = [
            Wallet.createRandom().address,
            Wallet.createRandom().address,
            "http://example.com",
            Wallet.createRandom().address,
            Wallet.createRandom().address,
            0,
            0,
            0,
            0,
            true,
            {toNumber: mockedToNumber},
            {toNumber: mockedToNumber},
            {toNumber: mockedToNumber},
            "USD",
            {toNumber: mockedToNumber},
            {toNumber: mockedToNumber},
            {toNumber: mockedToNumber},
            {toNumber: mockedToNumber},
            {toNumber: mockedToNumber},
            {toNumber: mockedToNumber}
        ];
        mockedReadFunction.mockResolvedValueOnce(rawShipment)
        const shipment = await shipmentDriver.getShipment(roleProof);
        expect(shipment.supplierAddress).toEqual(rawShipment[0]);
        expect(shipment.commissionerAddress).toEqual(rawShipment[1]);
        expect(shipment.externalUrl).toEqual(rawShipment[2]);
        expect(shipment.escrowAddress).toEqual(rawShipment[3]);
        expect(shipment.documentManagerAddress).toEqual(rawShipment[4]);
        expect(shipment.sampleEvaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(shipment.detailsEvaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(shipment.qualityEvaluationStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(shipment.fundsStatus).toEqual(EvaluationStatus.NOT_EVALUATED);
        expect(shipment.detailsSet).toEqual(true);
        expect(shipment.shipmentNumber).toEqual(1);
        expect(shipment.expirationDate).toEqual(new Date(1));
        expect(shipment.fixingDate).toEqual(new Date(1));
        expect(shipment.targetExchange).toEqual("USD");
        expect(shipment.differentialApplied).toEqual(1);
        expect(shipment.price).toEqual(1);
        expect(shipment.quantity).toEqual(1);
        expect(shipment.containersNumber).toEqual(1);
        expect(shipment.netWeight).toEqual(1);
        expect(shipment.grossWeight).toEqual(1);
    });
    it("retrieves shipment phase successfully", async () => {
        mockedReadFunction.mockResolvedValueOnce(0);
        const phase = await shipmentDriver.getPhase(roleProof);
        expect(phase).toEqual(Phase.PHASE_1);
    });
    it("retrieves document ids successfully", async () => {
        mockedToNumber.mockReturnValue(1);
        mockedReadFunction.mockResolvedValueOnce([{toNumber: mockedToNumber}]);
        const documentIds = await shipmentDriver.getDocumentsIds(roleProof, 0);
        expect(documentIds).toEqual([1]);
    });
    it("retrieves document info successfully", async () => {
        mockedToNumber.mockReturnValue(1);
        const rawDocumentInfo = [
            {toNumber: mockedToNumber},
            0,
            0,
            "uploader",
            true
        ];
        mockedReadFunction.mockResolvedValueOnce(rawDocumentInfo);
        const documentInfo = await shipmentDriver.getDocumentInfo(roleProof, 1);
        expect(documentInfo).not.toBeNull();
        expect(documentInfo!.id).toEqual(1);
        expect(documentInfo!.type).toEqual(DocumentType.SERVICE_GUIDE);
        expect(documentInfo!.status).toEqual(DocumentEvaluationStatus.NOT_EVALUATED);
        expect(documentInfo!.uploader).toEqual("uploader");
    });
    it('throws an error when document id is less than 0', async () => {
        await expect(shipmentDriver.getDocumentInfo(roleProof, -1)).rejects.toThrow('Document ID must be greater than or equal to 0');
    });
    it('returns null when document info is not found', async () => {
        mockedReadFunction.mockResolvedValueOnce([{toNumber: mockedToNumber}, 0, 0, "", false]);
        const documentInfo = await shipmentDriver.getDocumentInfo(roleProof, 1);
        expect(documentInfo).toBeNull();
    });
    it('sets shipment details successfully', async () => {
        await shipmentDriver.setDetails(
            roleProof,
            1,
            new Date(1),
            new Date(1),
            "USD",
            1,
            1,
            1,
            1,
            1,
            1
        );
        expect(mockedWriteFunction).toBeCalledWith(roleProof, 1, 1, 1, "USD", 1, 1, 1, 1, 1, 1);
        expect(mockedWait).toBeCalled();
    });
    it('throws an error when shipment details contain invalid data', async () => {
        await expect(shipmentDriver.setDetails(roleProof, -1, new Date(), new Date(), "USD", 1, 1, 1, 1, 1, 1)).rejects.toThrow('Invalid arguments');
    });
    it('evaluates sample successfully', async () => {
        await shipmentDriver.evaluateSample(roleProof, EvaluationStatus.APPROVED);
        expect(mockedWriteFunction).toHaveBeenCalledWith(roleProof, EvaluationStatus.APPROVED);
        expect(mockedWait).toHaveBeenCalled();
    });
    it('evaluates details successfully', async () => {
        await shipmentDriver.evaluateDetails(roleProof, EvaluationStatus.APPROVED);
        expect(mockedWriteFunction).toHaveBeenCalledWith(roleProof, EvaluationStatus.APPROVED);
        expect(mockedWait).toHaveBeenCalled();
    });
    it('evaluates quality successfully', async () => {
        await shipmentDriver.evaluateQuality(roleProof, EvaluationStatus.APPROVED);
        expect(mockedWriteFunction).toHaveBeenCalledWith(roleProof, EvaluationStatus.APPROVED);
        expect(mockedWait).toHaveBeenCalled();
    });
    it('deposits funds successfully', async () => {
        await shipmentDriver.depositFunds(roleProof, 1);
        expect(mockedWriteFunction).toHaveBeenCalledWith(roleProof, 1);
        expect(mockedWait).toHaveBeenCalled();
    });
    it('throws an error when deposit amount is less than or equal to 0', async () => {
        await expect(shipmentDriver.depositFunds(roleProof, 0)).rejects.toThrow('Amount must be greater than 0');
    });
    it('adds document successfully', async () => {
        await shipmentDriver.addDocument(roleProof, DocumentType.SERVICE_GUIDE, "http://example.com", "hash");
        expect(mockedWriteFunction).toHaveBeenCalledWith(roleProof, DocumentType.SERVICE_GUIDE, "http://example.com", "hash");
        expect(mockedWait).toHaveBeenCalled();
    });
    it('updates document successfully', async () => {
        await shipmentDriver.updateDocument(roleProof, 1, "http://example.com", "hash");
        expect(mockedWriteFunction).toHaveBeenCalledWith(roleProof, 1, "http://example.com", "hash");
        expect(mockedWait).toHaveBeenCalled();
    });
    it('evaluates document successfully', async () => {
        await shipmentDriver.evaluateDocument(roleProof, 1, DocumentEvaluationStatus.APPROVED);
        expect(mockedWriteFunction).toHaveBeenCalledWith(roleProof, 1, DocumentEvaluationStatus.APPROVED);
        expect(mockedWait).toHaveBeenCalled();
    });
    it('throws an error when document id is less than 0', async () => {
        await expect(shipmentDriver.evaluateDocument(roleProof, -1, DocumentEvaluationStatus.APPROVED)).rejects.toThrow('Document ID must be greater than or equal to 0');
    });
    it('retrieves uploadable documents successfully', async () => {
        mockedReadFunction.mockResolvedValueOnce([0]);
        const documentIds = await shipmentDriver.getUploadableDocuments(Phase.PHASE_1);
        expect(documentIds).toEqual([DocumentType.SERVICE_GUIDE]);
        expect(mockedReadFunction).toHaveBeenCalledWith(Phase.PHASE_1);
    });
    it('retrieves required documents successfully', async () => {
        mockedReadFunction.mockResolvedValueOnce([0]);
        const documentIds = await shipmentDriver.getRequiredDocuments(Phase.PHASE_1);
        expect(documentIds).toEqual([DocumentType.SERVICE_GUIDE]);
        expect(mockedReadFunction).toHaveBeenCalledWith(Phase.PHASE_1);
    });
});
