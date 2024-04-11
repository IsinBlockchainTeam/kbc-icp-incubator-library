// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";

contract CertificateManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event CompanyCertificateRegistered(uint256 indexed id, address company);
    event ScopeCertificateRegistered(uint256 indexed id, address company, string processType);
    event MaterialCertificateRegistered(uint256 indexed id, uint256 tradeId, uint256 lineId);


    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "MaterialManager: Caller is not the admin");
        _;
    }

    struct BaseInfo {
        uint256 id;
        address issuer;
        string assessmentStandard;
        uint256 documentId;
        uint256 issueDate;
        bool exists;
    }

    struct CompanyCertificate {
        BaseInfo baseInfo;
        address company;
        uint256 validFrom;
        uint256 validUntil;
    }

    struct ScopeCertificate {
        BaseInfo baseInfo;
        address company;
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

    EnumerableType private _processTypeManager;
    EnumerableType private _assessmentStandardManager;

    constructor(address processTypeManagerAddress, address assessmentStandardManagerAddress) {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        grantRole(ADMIN_ROLE, _msgSender());

        _processTypeManager = EnumerableType(processTypeManagerAddress);
        _assessmentStandardManager = EnumerableType(assessmentStandardManagerAddress);
    }

    function registerCompanyCertificate(address issuer, address company, string memory assessmentStandard, uint256 documentId, uint256 issueDate, uint256 validFrom, uint256 validUntil) public {
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(issuer, assessmentStandard, documentId, issueDate);
        _allCompanyCertificates[certificateId] = CompanyCertificate(baseInfo, company, validFrom, validUntil);
        _companyCertificates[company].push(certificateId);

        emit CompanyCertificateRegistered(certificateId, company);
    }

    function registerScopeCertificate(address issuer, address company, string memory assessmentStandard, uint256 documentId, uint256 issueDate, uint256 validFrom, uint256 validUntil, string[] memory processTypes) public {
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(issuer, assessmentStandard, documentId, issueDate);
        for(uint256 i = 0; i < processTypes.length; i++) {
            require(_processTypeManager.contains(processTypes[i]), "CertificateManager: Process type does not exist");
        }
        _allScopeCertificates[certificateId] = ScopeCertificate(baseInfo, company, processTypes, validFrom, validUntil);
        for(uint256 i = 0; i < processTypes.length; i++) {
            _scopeCertificates[company][processTypes[i]].push(certificateId);
            emit ScopeCertificateRegistered(certificateId, company, processTypes[i]);
        }
    }

    function registerMaterialCertificate(address issuer, string memory assessmentStandard, uint256 documentId, uint256 issueDate, uint256 tradeId, uint256 lineId) public {
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(issuer, assessmentStandard, documentId, issueDate);
        _allMaterialCertificates[certificateId] = MaterialCertificate(baseInfo, tradeId, lineId);
        _materialCertificates[tradeId][lineId].push(certificateId);

        emit MaterialCertificateRegistered(certificateId, tradeId, lineId);
    }

    function getCompanyCertificates(address company) public view returns (CompanyCertificate[] memory) {
        uint256[] memory certificateIds = _companyCertificates[company];
        CompanyCertificate[] memory certificates = new CompanyCertificate[](certificateIds.length);
        for(uint256 i = 0; i < certificateIds.length; i++) {
            certificates[i] = _allCompanyCertificates[certificateIds[i]];
        }
        return certificates;
    }

    function getScopeCertificates(address company, string memory processType) public view returns (ScopeCertificate[] memory) {
        uint256[] memory certificateIds = _scopeCertificates[company][processType];
        ScopeCertificate[] memory certificates = new ScopeCertificate[](certificateIds.length);
        for(uint256 i = 0; i < certificateIds.length; i++) {
            certificates[i] = _allScopeCertificates[certificateIds[i]];
        }
        return certificates;
    }

    function getMaterialCertificates(uint256 tradeId, uint256 lineId) public view returns (MaterialCertificate[] memory) {
        uint256[] memory certificateIds = _materialCertificates[tradeId][lineId];
        MaterialCertificate[] memory certificates = new MaterialCertificate[](certificateIds.length);
        for(uint256 i = 0; i < certificateIds.length; i++) {
            certificates[i] = _allMaterialCertificates[certificateIds[i]];
        }
        return certificates;
    }

    function _computeBaseInfo(address issuer, string memory assessmentStandard, uint256 documentId, uint256 issueDate) private returns (BaseInfo memory, uint256) {
        require(_assessmentStandardManager.contains(assessmentStandard), "CertificateManager: Assessment standard does not exist");

        uint256 certificateId = _counter.current() + 1;
        _counter.increment();
        return (BaseInfo(certificateId, issuer, assessmentStandard, documentId, issueDate, true), certificateId);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
