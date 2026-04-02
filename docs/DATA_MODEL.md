# SavigeSystemZ Data Model

## Core entities
- User
- Role
- Permission
- Session
- PasskeyCredential
- PasskeyChallenge
- Purchase
- Application
- ApplicationVersion
- ReleaseAsset
- Demo
- PricingPlan
- Purchase
- License
- DownloadEvent
- Review
- Comment
- ProjectRequest
- CreatorProfile
- Submission
- SubmissionAsset
- ApprovalDecision
- ContentPage
- ChangelogEntry
- AIKnowledgeDocument
- VaultFolder
- VaultFile
- AuditLog
- FeatureFlag

## Domain boundaries
- Identity and authorization
- Catalog and releases
- Commerce and entitlements
- Creator submissions and moderation
- Vault and private operations
- AI knowledge and concierge

## Migration discipline
- Forward-only migrations with rollback strategy documented per change
- No destructive schema changes without compatibility windows
