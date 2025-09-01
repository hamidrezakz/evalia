# Organization & Team Management API

این مستند خلاصه Endpoint های ماژول سازمان و تیم را توضیح می‌دهد.

## Base

All responses:

```
{ "data": ..., "meta?": { ... }, "error?": { message, code } }
```

## Organizations

- POST /organizations
- GET /organizations
- GET /organizations/:id
- PATCH /organizations/:id
- DELETE /organizations/:id (soft)
- POST /organizations/:id/restore
- POST /organizations/:id/status { status }

## Organization Members

- GET /organizations/:id/members
- POST /organizations/:id/members { userId, role }
- PATCH /organizations/:id/members/:membershipId { role }
- DELETE /organizations/:id/members/:membershipId

## Teams

- POST /organizations/:orgId/teams
- GET /organizations/:orgId/teams
- GET /organizations/:orgId/teams/:teamId
- PATCH /organizations/:orgId/teams/:teamId
- DELETE /organizations/:orgId/teams/:teamId (soft)
- POST /organizations/:orgId/teams/:teamId/restore

## Team Members

- GET /organizations/:orgId/teams/:teamId/members
- POST /organizations/:orgId/teams/:teamId/members { userId }
- DELETE /organizations/:orgId/teams/:teamId/members/:membershipId

## Notes

- Slug generation خودکار است اگر ارسال نشود.
- محدودیت آخرین OWNER رعایت شده است.
- Soft delete فقط روی سازمان و تیم اعمال شده.
- برای افزودن نقش‌ها از @Roles (فعلاً کامنت شده) استفاده می‌شود.

---

Future:

- کامل کردن auth integration
- افزودن کش/ایندکس‌های تحلیلی در صورت نیاز
