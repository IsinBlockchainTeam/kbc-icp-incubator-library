// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";

contract CertificateManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event CompanyCertificateRegistered(uint256 indexed id);
    event ScopeCertificateRegistered(uint256 indexed id);
    event MaterialCertificateRegistered(uint256 indexed id);


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

    // company address => company certificates
    mapping(address => uint256[]) private _companyCertificates;
    // company address => process type => scope certificates
    mapping(address => mapping(string => uint256[])) private _scopeCertificates;
    // trade id => trade line id => material certificates
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

        emit CompanyCertificateRegistered(certificateId);
    }

    function registerScopeCertificate(address issuer, address company, string memory assessmentStandard, uint256 documentId, uint256 issueDate, uint256 validFrom, uint256 validUntil, string[] memory processTypes) public {
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(issuer, assessmentStandard, documentId, issueDate);
        for(uint256 i = 0; i < processTypes.length; i++) {
            require(_processTypeManager.contains(processTypes[i]), "CertificateManager: Process type does not exist");
        }
        _allScopeCertificates[certificateId] = ScopeCertificate(baseInfo, company, processTypes, validFrom, validUntil);
        for(uint256 i = 0; i < processTypes.length; i++) {
            _scopeCertificates[company][processTypes[i]].push(certificateId);
        }

        emit ScopeCertificateRegistered(certificateId);
    }

    function registerMaterialCertificate(address issuer, string memory assessmentStandard, uint256 documentId, uint256 issueDate, uint256 tradeId, uint256 lineId) public {
        (BaseInfo memory baseInfo, uint256 certificateId) = _computeBaseInfo(issuer, assessmentStandard, documentId, issueDate);
        _allMaterialCertificates[certificateId] = MaterialCertificate(baseInfo, tradeId, lineId);
        _materialCertificates[tradeId][lineId].push(certificateId);

        emit MaterialCertificateRegistered(certificateId);
    }

    function _computeBaseInfo(address issuer, string memory assessmentStandard, uint256 documentId, uint256 issueDate) private pure returns (BaseInfo memory, uint256) {
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
