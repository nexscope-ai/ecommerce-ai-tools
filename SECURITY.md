# Security policy

Nexscope welcomes responsible reports that help protect users of the public learning site, repository scripts and related hosted services.

## Report a vulnerability privately

Do not open a public issue, discussion or pull request for a suspected vulnerability. Email [service@nexscope.ai](mailto:service@nexscope.ai) with a subject beginning with `[Security]` and include:

- the affected URL, file, endpoint or workflow;
- steps needed to reproduce the behavior;
- the expected and observed result;
- the potential impact;
- a minimal proof of concept with secrets and personal data removed.

Please do not include passwords, API keys, access tokens, payment information, customer data or unredacted logs. The Nexscope team will review the report, request clarification when necessary and coordinate a fix or disclosure when the report is confirmed.

## Scope

This repository covers the current default branch, the static learning site generated from `docs/`, and the public maintenance scripts in `scripts/`. The hosted Nexscope application is maintained separately, but suspected vulnerabilities affecting a Nexscope-owned service may be reported through the same private email address.

Reports about third-party services, social engineering, denial-of-service testing, automated high-volume scanning, spam or activity that accesses data without authorization are outside the scope of this repository. Avoid destructive testing and stop if testing could affect another user or production data.
