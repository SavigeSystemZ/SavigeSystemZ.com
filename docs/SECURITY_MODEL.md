# SavigeSystemZ Security Model

## Threat posture
The platform is hardened-by-default with layered defenses, strong authn/authz, monitoring, and tested recovery. No claim of absolute invulnerability.

## Controls
- RBAC for admin/private surfaces
- Passkey + MFA target for owner authentication
- CSP and hardened security headers
- Signed URL strategy for private object access
- Malware scanning pipeline for uploads before publication
- Input validation and output encoding to mitigate injection vectors
- Webhook signature validation for payment/provider callbacks
- DB-backed session tracking for owner sessions with revocation support
- Passkey-ready endpoint scaffolding for owner credential registration

## High-risk surfaces
- Admin actions
- Private vault access
- Creator uploads and moderation
- Commerce and entitlement checks
- AI retrieval over user-influenced content
- Entitled download delivery and private asset access controls

## Logging and audit
- All sensitive state transitions logged with actor, timestamp, and action context
- Incident review trail retained and exportable
