// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "./KBCAccessControl.sol";

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
        uint id;
        DocumentType dType;
        DocumentEvaluationStatus status;
        address uploader;
        bool exists;
    }
}
contract CertificateManager is AccessControl, KBCAccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event CompanyCertificateRegistered(uint256 indexed id, address consigneeCompany);
//    TODO: verificare se questa dichiarazione è corretta oppure se bisogna emettere un evento per singolo process type
    event ScopeCertificateRegistered(uint256 indexed id, address indexed consigneeCompany, string[] processType);
    event MaterialCertificateRegistered(uint256 indexed id, uint256 tradeId, uint256 lineId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "MaterialManager: Caller is not the admin");
        _;
    }

    enum CertificationType {
        COMPANY,
        SCOPE,
        MATERIAL
    }

    struct BaseInfo {
        uint256 id;
        address issuer;
        address consigneeCompany;
        string assessmentStandard;
        uint256 documentId;
        CertificationType certificationType;
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
        uint256 tradeId;
        uint256 lineId;
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
    // trade id => trade line id => material certificate ids
    mapping(uint256 => mapping(uint256 => uint256[])) private _materialCertificates;
    // company address => certificate ids
    mapping(address => uint256[]) private _certificatesPerCompany;

    mapping(CertificationType => uint256[]) private _documentsIdsByCertificationType;

    EnumerableType private _processTypeManager;
    EnumerableType private _assessmentStandardManager;

    constructor(address processTypeManagerAddress, address assessmentStandardManagerAddress) {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        grantRole(ADMIN_ROLE, _msgSender());

        _processTypeManager = EnumerableType(processTypeManagerAddress);
        _assessmentStandardManager = EnumerableType(assessmentStandardManagerAddress);
    }

    function registerCompanyCertificate(RoleProof memory roleProof, address issuer, address consigneeCompany, string memory assessmentStandard, uint256 documentId, uint256 issueDate, uint256 validFrom, uint256 validUntil) public atLeastEditor(roleProof) {
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(issuer, consigneeCompany, assessmentStandard, documentId, CertificationType.COMPANY, issueDate);
        _allCompanyCertificates[certificateId] = CompanyCertificate(baseInfo, validFrom, validUntil);
        _companyCertificates[consigneeCompany].push(certificateId);
        _certificatesPerCompany[consigneeCompany].push(certificateId);

        emit CompanyCertificateRegistered(certificateId, consigneeCompany);
    }

    function registerScopeCertificate(RoleProof memory roleProof, address issuer, address consigneeCompany, string memory assessmentStandard, uint256 documentId, uint256 issueDate, uint256 validFrom, uint256 validUntil, string[] memory processTypes) public atLeastEditor(roleProof) {
        for(uint256 i = 0; i < processTypes.length; i++) {
            require(_processTypeManager.contains(processTypes[i]), "CertificateManager: Process type does not exist");
        }
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(issuer, consigneeCompany, assessmentStandard, documentId, CertificationType.SCOPE, issueDate);
        _allScopeCertificates[certificateId] = ScopeCertificate(baseInfo, processTypes, validFrom, validUntil);
        _certificatesPerCompany[consigneeCompany].push(certificateId);
        // TODO: in order to check if a scope certificate is valid for a specific process type, we need to add a scope certificate per each process type
        for(uint256 i = 0; i < processTypes.length; i++) {
            _scopeCertificates[consigneeCompany][processTypes[i]].push(certificateId);
        }
        emit ScopeCertificateRegistered(certificateId, consigneeCompany, processTypes);
    }

    function registerMaterialCertificate(RoleProof memory roleProof, address issuer, address consigneeCompany, string memory assessmentStandard, uint256 documentId, uint256 issueDate, uint256 tradeId, uint256 lineId) public atLeastEditor(roleProof) {
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(issuer, consigneeCompany, assessmentStandard, documentId, CertificationType.MATERIAL, issueDate);
        _allMaterialCertificates[certificateId] = MaterialCertificate(baseInfo, tradeId, lineId);
        _materialCertificates[tradeId][lineId].push(certificateId);
        _certificatesPerCompany[consigneeCompany].push(certificateId);

        emit MaterialCertificateRegistered(certificateId, tradeId, lineId);
    }

    function getCertificateIdsByConsigneeCompany(RoleProof memory roleProof, address consigneeCompany) public view atLeastViewer(roleProof) returns (uint256[] memory) {
        return _certificatesPerCompany[consigneeCompany];
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
        return _allScopeCertificates[certificateId];
    }

    function getMaterialCertificates(RoleProof memory roleProof, uint256 tradeId, uint256 lineId) public view atLeastViewer(roleProof) returns (MaterialCertificate[] memory) {
        uint256[] memory certificateIds = _materialCertificates[tradeId][lineId];
        MaterialCertificate[] memory certificates = new MaterialCertificate[](certificateIds.length);
        for(uint256 i = 0; i < certificateIds.length; i++) {
            certificates[i] = _allMaterialCertificates[certificateIds[i]];
        }
        return certificates;
    }

    function getMaterialCertificate(RoleProof memory roleProof, uint256 certificateId) public view atLeastViewer(roleProof) returns (MaterialCertificate memory) {
        return _allMaterialCertificates[certificateId];
    }

    function addDocument(RoleProof memory roleProof, CertificationType certificationType, DocumentLibrary.DocumentType documentType, string memory externalUrl, string memory contentHash) public atLeastEditor(roleProof) {

        uint256 documentId = _documentManager.registerDocument(roleProof, externalUrl, contentHash, _msgSender());
        _documentsIdsByType[documentType].push(documentId);
        _documentsInfoById[documentId] = DocumentLibrary.DocumentInfo(documentId, documentType, DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED, _msgSender(), true);
    }

    function _computeBaseInfo(address issuer, address consigneeCompany, string memory assessmentStandard, uint256 documentId, CertificationType certificationType, uint256 issueDate) private returns (BaseInfo memory, uint256) {
        require(_assessmentStandardManager.contains(assessmentStandard), "CertificateManager: Assessment standard does not exist");

        uint256 certificateId = _counter.current() + 1;
        _counter.increment();
        return (BaseInfo(certificateId, issuer, consigneeCompany, assessmentStandard, documentId, certificationType, issueDate, true), certificateId);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
