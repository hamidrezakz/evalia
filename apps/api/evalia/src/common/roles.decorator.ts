import { SetMetadata } from '@nestjs/common';

/**
 * ROLES DECORATOR (پروفشنال / توسعه‌پذیر)
 * ------------------------------------------------------
 * هدف: منعطف کردن تعریف نقش‌ها با پشتیبانی از سناریوهای مختلف:
 * 1) حالت ساده (سازگاری قبلی): @Roles('SUPER_ADMIN', 'ORG:OWNER')
 * 2) حالت پیشرفته شی‌ءگرا:
 *    @Roles({ any: ['SUPER_ADMIN', 'ORG:OWNER'] })              => یکی کافی است
 *    @Roles({ all: ['FINANCE', 'REPORT_VIEWER'] })              => همه باید باشند (global)
 *    @Roles({ orgAny: ['OWNER','ADMIN'] })                      => هرکدام از نقش‌های سازمانی مجاز
 *    @Roles({ orgAll: ['OWNER','FINANCE'] })                    => همه نقش‌های سازمانی همزمان (نادر ولی ممکن)
 *    @Roles({ any: ['SUPER_ADMIN'], orgAny: ['OWNER','ADMIN'] })=> اگر SUPER_ADMIN نبود یکی از نقش‌های سازمانی باشد
 *
 * مدل JWT فعلی:
 * roles = {
 *   global: string[];
 *   org: { orgId: string; role: string }[];
 * }
 *
 * گارد باید بک‌ورداً Array ساده را هم پشتیبانی کند. پس متادیتا می‌تواند:
 *  - string[]
 *  - AdvancedRolesDescriptor
 */

export const ROLES_KEY = 'required_roles';

export interface AdvancedRolesDescriptor {
  /** حداقل یکی از نقش‌های سراسری یا سازمانی مطابق الگوی ساده (any) */
  any?: string[]; // می‌تواند شامل ORG:ROLE هم باشد برای سازگاری
  /** همه نقش‌های سراسری باید وجود داشته باشد */
  all?: string[]; // فقط global منطقی است
  /** حداقل یکی از این نقش‌های سازمانی در هر سازمانی */
  orgAny?: string[]; // ['OWNER','ADMIN']
  /** همه این نقش‌های سازمانی (کاربر باید در یک یا چند سازمان این رول‌ها را داشته باشد) */
  orgAll?: string[];
  /** توضیح مستنداتی (اختیاری) برای ابزارسازی یا تولید داک اتومات */
  description?: string;
}

type RolesInput = string[] | AdvancedRolesDescriptor;

export function Roles(...roles: string[]): ReturnType<typeof SetMetadata>;
export function Roles(
  descriptor: AdvancedRolesDescriptor,
): ReturnType<typeof SetMetadata>;
export function Roles(
  first: string | AdvancedRolesDescriptor,
  ...rest: string[]
) {
  if (typeof first === 'string') {
    // Legacy style @Roles('A','B','ORG:OWNER')
    const arr = [first, ...rest];
    return SetMetadata(ROLES_KEY, arr);
  }
  return SetMetadata(ROLES_KEY, first);
}

/**
 * مثال‌ها:
 * @Roles('SUPER_ADMIN')
 * @Roles('SUPER_ADMIN', 'ORG:OWNER')
 * @Roles({ any: ['SUPER_ADMIN','ORG:OWNER'] })
 * @Roles({ all: ['FINANCE','REPORT_VIEWER'] })
 * @Roles({ orgAny: ['OWNER','ADMIN'] })
 * @Roles({ any: ['SUPER_ADMIN'], orgAny: ['OWNER','ADMIN'] })
 */
