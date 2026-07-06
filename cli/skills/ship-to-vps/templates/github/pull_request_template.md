<!--
PR title format: <type>(<scope>): <imperative summary>
Examples:
  feat(admin): add product form with Cloudinary upload
  fix(payments): retry Paystack verify on transient failures
-->

## Summary

<!-- 1-3 bullets describing what changed and why. -->

-

## Linked issues

Closes #

<!-- Add "Refs #N" for related-but-not-closed issues. -->

## Test plan

<!-- How did you verify this? Manual steps, curl commands, screenshots. -->

- [ ]
- [ ]

## Screenshots / recordings

<!-- UI changes only. Delete the section if not applicable. -->

## Deploy notes

<!-- Anything the deploy needs:
     - new env var? (added to Infisical + Dockerfile + workflow build-args?)
     - migration with backfill or downtime?
     - first-deploy ordering constraint?
     Otherwise write "none". -->

- [ ] New env vars added to Infisical at `https://<your-infisical-domain>`
- [ ] DB migration safe to run with traffic
- [ ] No new `NEXT_PUBLIC_*` vars OR they're plumbed through `Dockerfile` + `deploy.yml`

## Checklist

- [ ] Branch named `<type>/<issue-number>-<slug>`
- [ ] Commits follow conventional-commit format
- [ ] Touched only what the issue asked for
- [ ] CI green
