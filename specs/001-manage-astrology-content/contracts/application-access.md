# Application Access Contract

## Public Visitor Contract

| Surface | Input | Result |
|---------|-------|--------|
| Topic list | None | Shows only active topics. |
| Topic detail | Topic slug | Shows the active topic and only its active content, or a clear unavailable/empty state. |
| Content detail | Content slug | Shows sanitized rendering of the Markdown item only if the item and its topic are active; otherwise shows a clear unavailable state. |

Public interactions never reveal inactive titles, bodies, topic names, records, or management
metadata. Raw HTML authored in Markdown is not rendered.

## Administrator Contract

| Surface | Precondition | Result |
|---------|--------------|--------|
| Sign in | Valid administrator identity | Starts an authorized management session and opens the administration area. |
| Administration route | Valid authorized session | Shows topic and content management functions. |
| Create/edit topic | Valid authorized session and valid fields | Saves the topic and reports success or field-specific errors. |
| Create/edit content | Valid authorized session, valid topic, and valid fields | Saves the content and reports success or field-specific errors. |
| Activate/deactivate record | Valid authorized session | Changes public visibility and confirms the new state. |
| Sign out | Authorized or expired session | Ends local access and redirects to sign in. |

Signed-out, expired, and authenticated non-administrator users are redirected away from
administration routes. Direct data requests receive authorization failures rather than data.

## Failure Contract

| Condition | User-visible outcome |
|-----------|----------------------|
| Data load fails | Clear retryable error; no stale successful state is presented as current. |
| Validation fails | Field-level message; entered values remain available for correction. |
| Session expires | Sign-in prompt before a protected action completes; no change is silently submitted. |
| Unauthorized request | No protected data is exposed; the user receives an access-denied or sign-in message. |
