// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "./KBCAccessControl.sol";
import "./DocumentManager.sol";
import "../libraries/KBCCertificateLibrary.sol";

library DocumentLibrary {
    enum DocumentType {
        CERTIFICATE_OF_CONFORMITY,
        COUNTRY_OF_ORIGIN,
        SWISS_DECODE,
        PRODUCTION_REPORT,
        PRODUCTION_FACILITY_LICENSE
    }
    enum DocumentEvaluationStatus {
        NOT_EVALUATED,
        APPROVED,
        NOT_APPROVED
    }
    struct DocumentInfo {
        uint256 id;
        DocumentType documentType;
    }
}
contract CertificateManager is AccessControl, KBCAccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event CompanyCertificateRegistered(uint256 indexed id, address consigneeCompany);
//    TODO: verificare se questa dichiarazione è corretta oppure se bisogna emettere un evento per singolo process type
    event ScopeCertificateRegistered(uint256 indexed id, address indexed consigneeCompany, string[] processType);
    event MaterialCertificateRegistered(uint256 indexed id, address indexed consigneeCompany, uint256 materialId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "MaterialManager: Caller is not the admin");
        _;
    }

    enum CertificateType {
        COMPANY,
        SCOPE,
        MATERIAL
    }

    struct BaseInfo {
        uint256 id;
        address issuer;
        address consigneeCompany;
        string assessmentStandard;
        DocumentLibrary.DocumentInfo document;
        DocumentLibrary.DocumentEvaluationStatus evaluationStatus;
        CertificateType certificateType;
        uint256 issueDate;
        bool exists;
    }

    struct CompanyCertificate {
        BaseInfo baseInfo;
        uint256 validFrom;
        uint256 validUntil;
    }

    struct ScopeCertificate {
        BaseInfo baseInfo;
        string[] processTypes;
        uint256 validFrom;
        uint256 validUntil;
    }

    struct MaterialCertificate {
        BaseInfo baseInfo;
        uint256 materialId;
//        uint256 tradeId;
//        uint256 lineId;
    }

    Counters.Counter private _counter;

    // id => company certificate
    mapping(uint256 => CompanyCertificate) private _allCompanyCertificates;
    // id => scope certificate
    mapping(uint256 => ScopeCertificate) private _allScopeCertificates;
    // id => material certificate
    mapping(uint256 => MaterialCertificate) private _allMaterialCertificates;

    // company address => company certificate ids
    mapping(address => uint256[]) private _companyCertificates;
    // company address => process type => scope certificate ids
    mapping(address => mapping(string => uint256[])) private _scopeCertificates;
    // company address => material id => material certificate ids
    mapping(address => mapping(uint256 => uint256[])) private _materialCertificates;
    // company address => certificate ids
    mapping(address => uint256[]) private _allCertificatesPerCompany;

    EnumerableType private _processTypeManager;
    EnumerableType private _assessmentStandardManager;
    DocumentManager private _documentManager;

    constructor(address delegateManagerAddress, address processTypeManagerAddress, address assessmentStandardManagerAddress, address documentManagerAddress) KBCAccessControl(delegateManagerAddress) {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        grantRole(ADMIN_ROLE, _msgSender());

        _processTypeManager = EnumerableType(processTypeManagerAddress);
        _assessmentStandardManager = EnumerableType(assessmentStandardManagerAddress);
        _documentManager = DocumentManager(documentManagerAddress);
    }

    function registerCompanyCertificate(RoleProof memory roleProof, address issuer, address consigneeCompany, string memory assessmentStandard, DocumentLibrary.DocumentInfo memory document, uint256 issueDate, uint256 validFrom, uint256 validUntil) public atLeastEditor(roleProof) {
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(roleProof, issuer, consigneeCompany, assessmentStandard, document, CertificateType.COMPANY, issueDate);
        _allCompanyCertificates[certificateId] = CompanyCertificate(baseInfo, validFrom, validUntil);
        _companyCertificates[consigneeCompany].push(certificateId);
        _allCertificatesPerCompany[consigneeCompany].push(certificateId);

        emit CompanyCertificateRegistered(certificateId, consigneeCompany);
    }

    function registerScopeCertificate(RoleProof memory roleProof, address issuer, address consigneeCompany, string memory assessmentStandard, DocumentLibrary.DocumentInfo memory document, uint256 issueDate, uint256 validFrom, uint256 validUntil, string[] memory processTypes) public atLeastEditor(roleProof) {
        for(uint256 i = 0; i < processTypes.length; i++) {
            require(_processTypeManager.contains(processTypes[i]), "CertificateManager: Process type does not exist");
        }
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(roleProof, issuer, consigneeCompany, assessmentStandard, document, CertificateType.SCOPE, issueDate);
        _allScopeCertificates[certificateId] = ScopeCertificate(baseInfo, processTypes, validFrom, validUntil);
        _allCertificatesPerCompany[consigneeCompany].push(certificateId);
        // TODO: in order to check if a scope certificate is valid for a specific process type, we need to add a scope certificate per each process type
        for(uint256 i = 0; i < processTypes.length; i++) {
            _scopeCertificates[consigneeCompany][processTypes[i]].push(certificateId);
        }
        emit ScopeCertificateRegistered(certificateId, consigneeCompany, processTypes);
    }

    function registerMaterialCertificate(RoleProof memory roleProof, address issuer, address consigneeCompany, string memory assessmentStandard, DocumentLibrary.DocumentInfo memory document, uint256 issueDate, uint256 materialId) public atLeastEditor(roleProof) {
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(roleProof, issuer, consigneeCompany, assessmentStandard, document, CertificateType.MATERIAL, issueDate);
        _allMaterialCertificates[certificateId] = MaterialCertificate(baseInfo, materialId);
        _materialCertificates[consigneeCompany][materialId].push(certificateId);
        _allCertificatesPerCompany[consigneeCompany].push(certificateId);

        emit MaterialCertificateRegistered(certificateId, consigneeCompany, materialId);
    }

    function getCertificateIdsByConsigneeCompany(RoleProof memory roleProof, address consigneeCompany) public view atLeastViewer(roleProof) returns (uint256[] memory) {
        return _allCertificatesPerCompany[consigneeCompany];
    }

    function getCompanyCertificates(RoleProof memory roleProof, address consigneeCompany) public view atLeastViewer(roleProof) returns (CompanyCertificate[] memory) {
        uint256[] memory certificateIds = _companyCertificates[consigneeCompany];
        CompanyCertificate[] memory certificates = new CompanyCertificate[](certificateIds.length);
        for(uint256 i = 0; i < certificateIds.length; i++) {
            certificates[i] = _allCompanyCertificates[certificateIds[i]];
        }
        return certificates;
    }

    function getCompanyCertificate(RoleProof memory roleProof, uint256 certificateId) public view atLeastViewer(roleProof) returns (CompanyCertificate memory) {
        require(_allCompanyCertificates[certificateId].baseInfo.exists, "CertificateManager: Company certificate does not exist");
        return _allCompanyCertificates[certificateId];
    }

    function getScopeCertificates(RoleProof memory roleProof, address consigneeCompany, string memory processType) public view atLeastViewer(roleProof) returns (ScopeCertificate[] memory) {
        uint256[] memory certificateIds = _scopeCertificates[consigneeCompany][processType];
        ScopeCertificate[] memory certificates = new ScopeCertificate[](certificateIds.length);
        for(uint256 i = 0; i < certificateIds.length; i++) {
            certificates[i] = _allScopeCertificates[certificateIds[i]];
        }
        return certificates;
    }

    function getScopeCertificate(RoleProof memory roleProof, uint256 certificateId) public view atLeastViewer(roleProof) returns (ScopeCertificate memory) {
        require(_allScopeCertificates[certificateId].baseInfo.exists, "CertificateManager: Scope Certificate does not exist");
        return _allScopeCertificates[certificateId];
    }

    function getMaterialCertificates(RoleProof memory roleProof, address consigneeCompany, uint256 materialId) public view atLeastViewer(roleProof) returns (MaterialCertificate[] memory) {
        uint256[] memory certificateIds = _materialCertificates[consigneeCompany][materialId];
        MaterialCertificate[] memory certificates = new MaterialCertificate[](certificateIds.length);
        for(uint256 i = 0; i < certificateIds.length; i++) {
            certificates[i] = _allMaterialCertificates[certificateIds[i]];
        }
        return certificates;
    }

    function getMaterialCertificate(RoleProof memory roleProof, uint256 certificateId) public view atLeastViewer(roleProof) returns (MaterialCertificate memory) {
        require(_allMaterialCertificates[certificateId].baseInfo.exists, "CertificateManager: Material Certificate does not exist");
        return _allMaterialCertificates[certificateId];
    }

    function updateCompanyCertificate(RoleProof memory roleProof, uint256 certificateId, string memory assessmentStandard, uint256 issueDate, uint256 validFrom, uint256 validUntil) public atLeastEditor(roleProof) {
        require(_allCompanyCertificates[certificateId].baseInfo.exists, "CertificateManager: Company certificate does not exist");
        require(_allCompanyCertificates[certificateId].baseInfo.evaluationStatus == DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED, "CertificateManager: Certificate has already been evaluated");
        _allCompanyCertificates[certificateId].baseInfo.assessmentStandard = assessmentStandard;
        _allCompanyCertificates[certificateId].baseInfo.issueDate = issueDate;
        _allCompanyCertificates[certificateId].validFrom = validFrom;
        _allCompanyCertificates[certificateId].validUntil = validUntil;
    }

    function updateScopeCertificate(RoleProof memory roleProof, uint256 certificateId, string memory assessmentStandard, uint256 issueDate, uint256 validFrom, uint256 validUntil, string[] memory processTypes) public atLeastEditor(roleProof) {
        require(_allScopeCertificates[certificateId].baseInfo.exists, "CertificateManager: Scope certificate does not exist");
        require(_allScopeCertificates[certificateId].baseInfo.evaluationStatus == DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED, "CertificateManager: Certificate has already been evaluated");
        for(uint256 i = 0; i < processTypes.length; i++) {
            require(_processTypeManager.contains(processTypes[i]), "CertificateManager: Process type does not exist");
        }
        _allScopeCertificates[certificateId].baseInfo.assessmentStandard = assessmentStandard;
        _allScopeCertificates[certificateId].baseInfo.issueDate = issueDate;
        _allScopeCertificates[certificateId].validFrom = validFrom;
        _allScopeCertificates[certificateId].validUntil = validUntil;
        _allScopeCertificates[certificateId].processTypes = processTypes;
    }

    function updateMaterialCertificate(RoleProof memory roleProof, uint256 certificateId, string memory assessmentStandard, uint256 issueDate, uint256 materialId) public atLeastEditor(roleProof) {
        require(_allMaterialCertificates[certificateId].baseInfo.exists, "CertificateManager: Material certificate does not exist");
        require(_allMaterialCertificates[certificateId].baseInfo.evaluationStatus == DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED, "CertificateManager: Certificate has already been evaluated");
        _allMaterialCertificates[certificateId].baseInfo.assessmentStandard = assessmentStandard;
        _allMaterialCertificates[certificateId].baseInfo.issueDate = issueDate;
        _allMaterialCertificates[certificateId].materialId = materialId;
    }

    function evaluateDocument(RoleProof memory roleProof, uint256 certificateId, uint256 documentId, DocumentLibrary.DocumentEvaluationStatus evaluation) public atLeastEditor(roleProof) {
        require(evaluation != DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED, "CertificateManager: Evaluation status must be different from NOT_EVALUATED");
        BaseInfo storage certificate = _getActualCertificateById(certificateId);
        require(certificate.document.id == documentId, "CertificateManager: Document does not match the certificate");
        require(certificate.evaluationStatus == DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED, "CertificateManager: Document has already been evaluated");
        certificate.evaluationStatus = evaluation;
    }

    function updateDocument(RoleProof memory roleProof, uint256 certificationId, uint256 documentId, string memory externalUrl, string memory contentHash) public atLeastEditor(roleProof) {
        _documentManager.updateDocument(roleProof, documentId, externalUrl, contentHash, _msgSender());
        BaseInfo storage certificate = _getActualCertificateById(certificationId);
        certificate.evaluationStatus = DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED;
    }

    function getBaseCertificateInfoById(RoleProof memory roleProof, uint256 certificateId) public view atLeastViewer(roleProof) returns (BaseInfo memory) {
        return _getActualCertificateById(certificateId);
    }

    function _computeBaseInfo(RoleProof memory roleProof, address issuer, address consigneeCompany, string memory assessmentStandard, DocumentLibrary.DocumentInfo memory document, CertificateType certificateType, uint256 issueDate) private returns (BaseInfo memory, uint256) {
        require(_assessmentStandardManager.contains(assessmentStandard), "CertificateManager: Assessment standard does not exist");
        require(_documentManager.getDocumentById(roleProof, document.id).exists, "CertificateManager: Document does not exist");

        uint256 certificateId = _counter.current() + 1;
        _counter.increment();
        BaseInfo memory baseInfo = BaseInfo(certificateId, issuer, consigneeCompany, assessmentStandard, document, DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED, certificateType, issueDate, true);
        return (baseInfo, certificateId);
    }

    function _getActualCertificateById(uint256 certificateId) private view returns (BaseInfo storage) {
        if (_allCompanyCertificates[certificateId].baseInfo.exists) {
            return _allCompanyCertificates[certificateId].baseInfo;
        } else if (_allScopeCertificates[certificateId].baseInfo.exists) {
            return _allScopeCertificates[certificateId].baseInfo;
        } else if (_allMaterialCertificates[certificateId].baseInfo.exists) {
            return _allMaterialCertificates[certificateId].baseInfo;
        }
        revert("CertificateManager: Certificate does not exist");
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
