// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MedVaultConsentRegistry
 * @dev Sovereign Patient Consent & Verification Ledger for MedVault DID.
 * Deployed on Polygon PoS / EVM L2s for ultra-low gas and sub-150ms read latency.
 */
contract MedVaultConsentRegistry {
    enum AccessScope {
        FULL_RECORD,
        PREDICATE_ONLY,
        ANONYMIZED_SUMMARY
    }

    struct ConsentGrant {
        bytes32 grantId;
        address patient;
        string patientDid;
        string recipientDid;
        bytes32 recordHash;
        uint256 grantedAt;
        uint256 expiresAt;
        bool isRevoked;
        AccessScope scope;
        string predicateProofHash;
    }

    // Mapping from grantId to ConsentGrant
    mapping(bytes32 => ConsentGrant) public grants;

    // Patient address to array of grantIds
    mapping(address => bytes32[]) public patientGrants;

    // Events
    event ConsentGranted(
        bytes32 indexed grantId,
        address indexed patient,
        string recipientDid,
        bytes32 recordHash,
        uint256 expiresAt,
        AccessScope scope
    );

    event ConsentRevoked(
        bytes32 indexed grantId,
        address indexed patient,
        uint256 timestamp
    );

    event AccessLogged(
        bytes32 indexed grantId,
        string accessorDid,
        uint256 timestamp,
        bool accessGranted
    );

    modifier onlyGrantOwner(bytes32 grantId) {
        require(grants[grantId].patient == msg.sender, "Caller is not the patient owner");
        _;
    }

    /**
     * @notice Issue a new time-bounded cryptographic consent grant (e.g. 15-minute token)
     */
    function grantConsent(
        bytes32 grantId,
        string calldata patientDid,
        string calldata recipientDid,
        bytes32 recordHash,
        uint256 durationSeconds,
        AccessScope scope,
        string calldata predicateProofHash
    ) external returns (bytes32) {
        require(grants[grantId].grantedAt == 0, "Grant ID already exists");
        require(durationSeconds > 0, "Duration must be positive");

        uint256 expiresAt = block.timestamp + durationSeconds;

        grants[grantId] = ConsentGrant({
            grantId: grantId,
            patient: msg.sender,
            patientDid: patientDid,
            recipientDid: recipientDid,
            recordHash: recordHash,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            isRevoked: false,
            scope: scope,
            predicateProofHash: predicateProofHash
        });

        patientGrants[msg.sender].push(grantId);

        emit ConsentGranted(
            grantId,
            msg.sender,
            recipientDid,
            recordHash,
            expiresAt,
            scope
        );

        return grantId;
    }

    /**
     * @notice Instant 1-Click Revocation by the patient
     */
    function revokeConsent(bytes32 grantId) external onlyGrantOwner(grantId) {
        require(!grants[grantId].isRevoked, "Consent already revoked");
        grants[grantId].isRevoked = true;

        emit ConsentRevoked(grantId, msg.sender, block.timestamp);
    }

    /**
     * @notice Sub-second verification of a consent token by a consulting physician or TPA
     */
    function verifyConsent(bytes32 grantId, string calldata accessorDid)
        external
        view
        returns (
            bool isValid,
            string memory reason,
            uint256 remainingSeconds,
            AccessScope scope,
            bytes32 recordHash
        )
    {
        ConsentGrant memory grant = grants[grantId];

        if (grant.grantedAt == 0) {
            return (false, "Grant ID does not exist", 0, AccessScope.FULL_RECORD, bytes32(0));
        }

        if (grant.isRevoked) {
            return (false, "Consent has been explicitly revoked by patient", 0, grant.scope, grant.recordHash);
        }

        if (block.timestamp > grant.expiresAt) {
            return (false, "Consent token has expired", 0, grant.scope, grant.recordHash);
        }

        uint256 remaining = grant.expiresAt - block.timestamp;
        return (true, "Valid Active Consent", remaining, grant.scope, grant.recordHash);
    }

    /**
     * @notice Retrieve all grant IDs created by a patient
     */
    function getPatientGrants(address patient) external view returns (bytes32[] memory) {
        return patientGrants[patient];
    }
}
