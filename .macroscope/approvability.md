---
waitsFor:
  - "Test and build"
neverApprove:
  - ".macroscope/**"
  - ".github/**"
---

Routine interface changes may be eligible for approval when their effects
are local and they preserve existing matching and persistence behavior.
Approve only if correctness review, HorseTinder Policy, and Test and build
all complete successfully with no unresolved blocking findings.
If a required result is missing or incomplete, hold for human review.
Changes to matching rules, discovery algorithms, saved browser state,
or review configuration require a human review.
