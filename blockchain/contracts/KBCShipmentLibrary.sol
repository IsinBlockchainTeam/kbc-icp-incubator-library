// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./Shipment.sol";

library KBCShipmentLibrary {
    function getPhase1Documents() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase1Documents = new DocumentLibrary.DocumentType[](4);
        phase1Documents[0] = DocumentLibrary.DocumentType.SERVICE_GUIDE;
        phase1Documents[1] = DocumentLibrary.DocumentType.SENSORY_EVALUATION_ANALYSIS_REPORT;
        phase1Documents[2] = DocumentLibrary.DocumentType.SUBJECT_TO_APPROVAL_OF_SAMPLE;
        phase1Documents[3] = DocumentLibrary.DocumentType.PRE_SHIPMENT_SAMPLE;
        return phase1Documents;
    }

    function getPhase1RequiredDocuments() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase1Documents = new DocumentLibrary.DocumentType[](1);
        phase1Documents[0] = DocumentLibrary.DocumentType.PRE_SHIPMENT_SAMPLE;
        return phase1Documents;
    }

    function getPhase2Documents() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase2Documents = new DocumentLibrary.DocumentType[](2);
        phase2Documents[0] = DocumentLibrary.DocumentType.SHIPPING_INSTRUCTIONS;
        phase2Documents[1] = DocumentLibrary.DocumentType.SHIPPING_NOTE;
        return phase2Documents;
    }

    function getPhase2RequiredDocuments() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase2Documents = new DocumentLibrary.DocumentType[](2);
        phase2Documents[0] = DocumentLibrary.DocumentType.SHIPPING_INSTRUCTIONS;
        phase2Documents[1] = DocumentLibrary.DocumentType.SHIPPING_NOTE;
        return phase2Documents;
    }

    function getPhase3Documents() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase3Documents = new DocumentLibrary.DocumentType[](5);
        phase3Documents[0] = DocumentLibrary.DocumentType.BOOKING_CONFIRMATION;
        phase3Documents[1] = DocumentLibrary.DocumentType.CARGO_COLLECTION_ORDER;
        phase3Documents[2] = DocumentLibrary.DocumentType.EXPORT_INVOICE;
        phase3Documents[3] = DocumentLibrary.DocumentType.TRANSPORT_CONTRACT;
        phase3Documents[4] = DocumentLibrary.DocumentType.TO_BE_FREED_SINGLE_EXPORT_DECLARATION;
        return phase3Documents;
    }

    function getPhase3RequiredDocuments() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase3Documents = new DocumentLibrary.DocumentType[](1);
        phase3Documents[0] = DocumentLibrary.DocumentType.BOOKING_CONFIRMATION;
        return phase3Documents;
    }

    function getPhase4Documents() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase4Documents = new DocumentLibrary.DocumentType[](7);
        phase4Documents[0] = DocumentLibrary.DocumentType.EXPORT_CONFIRMATION;
        phase4Documents[1] = DocumentLibrary.DocumentType.FREED_SINGLE_EXPORT_DECLARATION;
        phase4Documents[2] = DocumentLibrary.DocumentType.CONTAINER_PROOF_OF_DELIVERY;
        phase4Documents[3] = DocumentLibrary.DocumentType.PHYTOSANITARY_CERTIFICATE;
        phase4Documents[4] = DocumentLibrary.DocumentType.BILL_OF_LADING;
        phase4Documents[5] = DocumentLibrary.DocumentType.ORIGIN_CERTIFICATE_ICO;
        phase4Documents[6] = DocumentLibrary.DocumentType.WEIGHT_CERTIFICATE;
        return phase4Documents;
    }

    function getPhase4RequiredDocuments() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase4Documents = new DocumentLibrary.DocumentType[](3);
        phase4Documents[0] = DocumentLibrary.DocumentType.PHYTOSANITARY_CERTIFICATE;
        phase4Documents[1] = DocumentLibrary.DocumentType.BILL_OF_LADING;
        phase4Documents[2] = DocumentLibrary.DocumentType.ORIGIN_CERTIFICATE_ICO;
        return phase4Documents;
    }

    function getPhase5Documents() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase5Documents = new DocumentLibrary.DocumentType[](0);
        return phase5Documents;
    }

    function getPhase5RequiredDocuments() public pure returns (DocumentLibrary.DocumentType[] memory) {
        DocumentLibrary.DocumentType[] memory phase5Documents = new DocumentLibrary.DocumentType[](0);
        return phase5Documents;
    }
}
