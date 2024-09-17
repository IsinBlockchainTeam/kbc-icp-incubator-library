// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../contracts/CertificateManager.sol";

library KBCCertificateLibrary {
    enum CertificateType {
        COMPANY,
        SCOPE,
        MATERIAL
    }

//    TODO: uncomment this function when the DocumentLibrary has been moved to an independent library, in order to avoid circular dependencies
//    function getDocumentTypesByCertificateType(CertificateType certificateType) public pure returns (DocumentLibrary.DocumentType[] memory) {
//        if (certificateType == CertificateType.COMPANY) {
//            return [DocumentLibrary.DocumentType.CERTIFICATE_OF_CONFORMITY, DocumentLibrary.DocumentType.COUNTRY_OF_ORIGIN];
//        } else if (certificateType == CertificateType.SCOPE) {
//            return [DocumentLibrary.DocumentType.CERTIFICATE_OF_CONFORMITY, DocumentLibrary.DocumentType.COUNTRY_OF_ORIGIN, DocumentLibrary.DocumentType.PRODUCTION_REPORT, DocumentLibrary.DocumentType.PRODUCTION_FACILITY_LICENSE];
//        } else if (certificateType == CertificateType.MATERIAL) {
//            return [DocumentLibrary.DocumentType.SWISS_DECODE];
//        }
//        else {
//            revert("Invalid certificate type");
//        }
//    }
}
