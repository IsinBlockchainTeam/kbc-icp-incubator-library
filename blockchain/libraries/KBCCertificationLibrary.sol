// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../contracts/CertificateManager.sol";

library KBCCertificationLibrary {
    enum CertificationType {
        COMPANY,
        SCOPE,
        MATERIAL
    }

    function getDocumentTypesByCertificationType(CertificationType certificationType) public pure returns (DocumentLibrary.DocumentType[] memory) {
        if (certificationType == CertificationType.COMPANY) {
            return [DocumentLibrary.DocumentType.CERTIFICATE_OF_CONFORMITY, DocumentLibrary.DocumentType.COUNTRY_OF_ORIGIN];
        } else if (certificationType == CertificationType.SCOPE) {
            return [DocumentLibrary.DocumentType.CERTIFICATE_OF_CONFORMITY, DocumentLibrary.DocumentType.COUNTRY_OF_ORIGIN, DocumentLibrary.DocumentType.PRODUCTION_REPORT, DocumentLibrary.DocumentType.PRODUCTION_FACILITY_LICENSE];
        } else if (certificationType == CertificationType.MATERIAL) {
            return [DocumentLibrary.DocumentType.SWISS_DECODE];
        }
        else {
            revert("Invalid certification type");
        }
    }
}
