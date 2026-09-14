---
title: HorseTinder Policy
input: full_diff
conclusion: failure
requiredStatusCheck: true
---

## Architecture
Matching and discovery logic belongs in js/matching.js.
Controllers coordinate the UI. Browser storage belongs in js/services.js.

## Security
Treat saved browser data as untrusted. Validate profile IDs and decisions
before applying them. A match requires a like from both horses.
Render profile names and biographies as text, not trusted HTML.

## Conventions
Changes to discovery, decisions, or matches need regression tests.
Keep AngularJS 1.5.8 and explicit dependency-injection annotations.

Report concrete violations with file references and the rule they break.
Pass when the changes introduce no violation.
