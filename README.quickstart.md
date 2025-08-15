# راهنمای شروع سریع

- apps/web: پروژه Next.js (فرانت‌اند)
- apps/api: پروژه NestJS (بک‌اند)
- packages/ui: کامپوننت‌های مشترک UI
- packages/database: مدل و ارتباط با دیتابیس (Prisma)
- packages/core: مدل‌ها و منطق مشترک

## دستورات پرکاربرد pnpm

- نصب وابستگی‌ها: `pnpm install`
- اجرای dev فرانت: `pnpm --filter apps/web dev`
- اجرای dev بک: `pnpm --filter apps/api start:dev`
- اضافه کردن پکیج به یک بخش خاص:
  - `pnpm add <package> --filter <path>`
- حذف پکیج:
  - `pnpm remove <package> --filter <path>`

## نکات

- هر بخش README مخصوص به خودش را دارد.
- ساختار monorepo باعث توسعه سریع‌تر و اشتراک‌گذاری راحت‌تر کد می‌شود.
- هر سوالی داشتی بپرس!
