<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

## Avatar Storage (Cloudflare R2 Integration)

The API supports two storage backends for user avatar images:

1. Local disk (`uploads/` directory) – default fallback if R2 env vars are missing.
2. Cloudflare R2 (S3-compatible) with an optional custom CDN domain (e.g. `cdn.doneplay.site`).

### How it works

Upload flow (`POST /assets` with `type=AVATAR`):

1. Multer stores the original image temporarily under `uploads/`.
2. If `type=AVATAR`, the backend converts the image to WebP and compresses iteratively (target ≤ ~80KB).
3. If R2 is configured (all required env vars present) the optimized file is uploaded to R2 under a deterministic key:

- `avatars/<userId>.webp` (if authenticated user id available)
- Otherwise: `avatars/<uuid>.webp`

4. A database `asset` record is created. For remote objects the full CDN URL is stored; for local fallback a relative `/uploads/...` path.
5. The authenticated user is auto-attached to the new avatar asset; any previous avatar asset + (local) file is cleaned up.

### Deterministic Naming & Overwrite

Each user always has at most one active avatar:

- New uploads with the same user id overwrite the same R2 key (cache-control set to 5 minutes; adjust as needed).
- The asset table old record is hard-deleted; the new one becomes canonical.

### Environment Variables

Required to activate R2 mode (examples):

```
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=***
R2_SECRET_ACCESS_KEY=***
R2_BUCKET=doneplayavatars
R2_PUBLIC_BASE=https://cdn.doneplay.site
```

Optional tuning (already in `.env`):

```
AVATAR_MAX_SIZE_BYTES=102400
AVATAR_FORCE_WEBP=true
```

### Frontend Handling

The frontend treats absolute URLs (starting with `http`) directly. Relative `/uploads/...` URLs are prefixed with the API base. No code changes are required when switching to R2 beyond setting the env vars.

### Cache Busting

Currently overwriting keeps the same key (`<userId>.webp`). To mitigate stale CDN caches:

- A short `Cache-Control` (`public, max-age=300, must-revalidate`) is applied on upload.
- If you need stronger guarantees, consider appending a version query (e.g. `?v=<timestamp>`) in the DB URL or using unique keys per upload plus a redirect/table update strategy.

### Future Enhancements (Suggested)

- Delete old R2 object when switching from random UUID key to deterministic user key.
- Add signed URL support for private buckets.
- Add background image optimization queue for large originals (if you remove size limits).

---

## Navigation Module (Dynamic Menu System)

This service provides hierarchical menu items with multi-tenant override capability.

### Precedence Order (highest wins when same parent + label)

1. Organization + Org Role specific (organizationId != null AND role != null)
2. Organization generic (organizationId != null AND role == null)
3. Global + Platform Role (organizationId == null AND platformRole != null)
4. Global generic (organizationId == null AND platformRole == null)

### Resolution Algorithm

1. Fetch all candidates matching any scope for the requesting user (org + roles).
2. Group by composite key: (parentId||root) + label.
3. Keep highest precedence item per key (numeric score 400/300/200/100).
4. Filter inactive / soft-deleted, then build tree ordered by parentId -> order -> label.

### Validation Rules

- label uniqueness within same (parentId, organizationId, role, platformRole) excluding soft-deleted.
- Parent scope alignment: same organizationId. Child may specialize with role/platformRole when parent is generic; inverse mismatch rejected.
- Circular parent chains are rejected.
- path XOR externalUrl (mutually exclusive).

### Key Endpoints

- GET /navigation/org/:orgId/resolve -> merged tree
- GET /navigation (filters) -> raw flat list
- POST /navigation -> create item
- PATCH /navigation/:id -> update item
- POST /navigation/reorder -> batch set parent/order
- POST /navigation/:id/toggle -> activate/deactivate
- DELETE /navigation/:id -> soft delete

### Reorder Payload Example

```
POST /navigation/reorder
{
  "items": [
    { "id": 12, "parentId": null, "order": 0 },
    { "id": 15, "parentId": 12, "order": 0 }
  ]
}
```

### Override Example

1. Create global generic: Dashboard
2. Create org generic (org=10): Dashboard (custom label / order) -> overrides global for that org
3. Create org role-specific (org=10, role=MANAGER): Dashboard -> overrides org generic for MANAGERs

### Suggested Caching Strategy (Future)

Cache key: `nav:v1:org:{orgId||0}:roles:{hash(roles)}:tv:{tokenVersion}` storing resolved tree JSON for short TTL (e.g. 5m). Invalidate manually on mutations.

### Planned Enhancements

- Swagger decorators for all DTOs
- Role/permission guard integration (SUPER_ADMIN for global mutations; OWNER/MANAGER for org mutations)
- Bulk import/export (JSON)
- Optional menu item visibility conditions (time-based, feature flags)
