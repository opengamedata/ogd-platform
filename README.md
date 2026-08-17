# OGD Reference Platform

Modular-monolith Platform control plane for the first Open Game Data vertical slice:

```text
Sign in -> create Organization -> create Game -> set Game governance state
-> enroll Pipeline service -> show Pipeline setup state -> view Game overview
```

This repository is the Open Game Data reference Platform implementation. The Platform owns shared identity, Organizations, Games, governance state, generic service enrollment, audit, and outbox records. Pipeline-specific resources such as telemetry, integrations, environments, logging specs, generators, and datasets stay out of this codebase.

## Local Setup

1. Copy `.env.example` to `.env.local` and fill in Postgres plus GitHub and Google SSO values. Generic OIDC remains optional.
2. Install dependencies with `npm install`.
3. Run `npm run prisma:migrate`.
4. Run `npm run prisma:seed`.
5. Start the app with `npm run dev`.

## Key Boundaries

- `Game` is the initial Platform governance and service-enrollment scope.
- Pipeline participation is represented by `ServiceDefinition` and `ServiceEnrollment`.
- `service_enrollments.id` is the stable downstream handoff ID.
- A future Project migration can add nullable `project_id` to `service_enrollments` without recreating existing Pipeline resources.

## SSO Callback URLs

- GitHub OAuth app callback: `http://localhost:3000/api/auth/callback/github`
- Google OAuth client redirect URI: `http://localhost:3000/api/auth/callback/google`
- Optional generic OIDC callback: `http://localhost:3000/api/auth/callback/oidc`
