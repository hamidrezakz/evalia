/*
 * Centralized enum & translation utilities.
 * --------------------------------------------------
 * This file mirrors Prisma schema enums for frontend usage and provides:
 *  - Type-safe string literal unions (sourced from backend contract)
 *  - Central translation maps (Fa / En) with graceful fallback
 *  - Generic helpers to:
 *      * translate single value
 *      * produce option arrays for selects / filters
 *      * validate enum membership
 *      * narrow unknown strings to enum values
 *  - Single update surface: when backend enum changes, update here only.
 *
 * Conventions:
 *  - Enum literal keys are identical to backend (UPPER_SNAKE / PASCAL) to avoid mismatch.
 *  - Translation maps contain an object with at least { fa: string; en: string }.
 *  - Add new language columns easily (extend TranslationValue interface).
 *
 * NOTE: Keep this file framework-agnostic (no React imports) so it can be reused in utils, stores, etc.
 */

// ------------------------------
// Base Types
// ------------------------------

export interface TranslationValue {
  fa: string;
  en: string;
  // Extend here for more locales (e.g. ar?: string; de?: string)
}

export interface EnumTranslationRecord<TEnum extends string> {
  [value: string]: TranslationValue & { description?: string };
}

export interface EnumOption<TEnum extends string> {
  value: TEnum;
  label: string; // localized label
  rawLabel: string; // original enum literal (for debugging / dev tools)
  description?: string;
}

export type LocaleCode = "fa" | "en";

let currentLocale: LocaleCode = "fa";

export function setEnumLocale(locale: LocaleCode) {
  currentLocale = locale;
}
export function getEnumLocale() {
  return currentLocale;
}

// Generic translator factory.
function createTranslator<TEnum extends string>(
  map: EnumTranslationRecord<TEnum>
) {
  const values = Object.keys(map) as TEnum[];
  function isEnum(val: unknown): val is TEnum {
    return typeof val === "string" && values.includes(val as TEnum);
  }
  function t(
    value: TEnum | null | undefined,
    locale: LocaleCode = currentLocale
  ): string {
    if (!value) return "";
    const rec = map[value];
    if (!rec) return value; // fallback to raw literal
    return (rec as any)[locale] ?? rec.fa ?? value;
  }
  function option(
    value: TEnum,
    locale: LocaleCode = currentLocale
  ): EnumOption<TEnum> {
    return {
      value,
      label: t(value, locale),
      rawLabel: value,
      description: map[value]?.description,
    };
  }
  function options(locale: LocaleCode = currentLocale): EnumOption<TEnum>[] {
    return values.map((v) => option(v, locale));
  }
  function coerce(value: unknown): TEnum | null {
    return isEnum(value) ? value : null;
  }
  return { t, options, option, isEnum, values, coerce, map };
}

// ------------------------------
// Backend Enum Literal Unions
// (Copy from Prisma schema) Keep alphabetical inside groups.
// ------------------------------

// Locale
export type Locale = "FA" | "EN";
// Gender
export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNDISCLOSED";
// UserStatus
export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "DELETED";
// AuthProvider
export type AuthProvider =
  | "PASSWORD"
  | "GOOGLE"
  | "GITHUB"
  | "MICROSOFT"
  | "APPLE"
  | "AZURE_AD";
// OrgPlan
export type OrgPlan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
// OrgRole
export type OrgRole = "OWNER" | "MANAGER" | "MEMBER";
// AssessmentState
export type AssessmentState = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
// SessionState
export type SessionState =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "ANALYZING"
  | "COMPLETED"
  | "CANCELLED";
// ResponsePerspective
export type ResponsePerspective =
  | "SELF"
  | "FACILITATOR"
  | "PEER"
  | "MANAGER"
  | "SYSTEM";
// QuestionType
export type QuestionType =
  | "SCALE"
  | "TEXT"
  | "MULTI_CHOICE"
  | "SINGLE_CHOICE"
  | "BOOLEAN";
// AIJobStatus
export type AIJobStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";
// NotificationChannel
export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "PUSH";
// NotificationStatus
export type NotificationStatus =
  | "PENDING"
  | "SENT"
  | "READ"
  | "FAILED"
  | "DISMISSED";
// AuditActionType
export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "PERMISSION_CHANGE"
  | "SYSTEM";
// AssetType
export type AssetType =
  | "AVATAR"
  | "DOCUMENT"
  | "SPREADSHEET"
  | "IMAGE"
  | "OTHER";
// PlatformRole
export type PlatformRole =
  | "MEMBER"
  | "SUPER_ADMIN"
  | "ANALYSIS_MANAGER"
  | "FACILITATOR"
  | "SUPPORT"
  | "SALES";
// OrganizationStatus
export type OrganizationStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
// VerificationIdentifierType
export type VerificationIdentifierType = "EMAIL" | "PHONE";
// VerificationPurpose
export type VerificationPurpose =
  | "LOGIN"
  | "PASSWORD_RESET"
  | "MFA"
  | "EMAIL_VERIFY"
  | "PHONE_VERIFY"
  | "SENSITIVE_ACTION";
// AIAnalysisKind
export type AIAnalysisKind = "SUMMARY" | "THEME" | "SENTIMENT" | "RISK";

// ------------------------------
// Translation Maps (fa / en)
// ------------------------------

const LocaleMap: EnumTranslationRecord<Locale> = {
  FA: { fa: "فارسی", en: "Persian / Farsi" },
  EN: { fa: "انگلیسی", en: "English" },
};
const GenderMap: EnumTranslationRecord<Gender> = {
  MALE: { fa: "مرد", en: "Male" },
  FEMALE: { fa: "زن", en: "Female" },
  OTHER: { fa: "دیگر", en: "Other" },
  UNDISCLOSED: { fa: "نامشخص", en: "Undisclosed" },
};
const UserStatusMap: EnumTranslationRecord<UserStatus> = {
  ACTIVE: { fa: "فعال", en: "Active" },
  INVITED: { fa: "دعوت شده", en: "Invited" },
  SUSPENDED: { fa: "معلق", en: "Suspended" },
  DELETED: { fa: "حذف شده", en: "Deleted" },
};
const AuthProviderMap: EnumTranslationRecord<AuthProvider> = {
  PASSWORD: { fa: "رمز عبور", en: "Password" },
  GOOGLE: { fa: "گوگل", en: "Google" },
  GITHUB: { fa: "گیت‌هاب", en: "GitHub" },
  MICROSOFT: { fa: "مایکروسافت", en: "Microsoft" },
  APPLE: { fa: "اپل", en: "Apple" },
  AZURE_AD: { fa: "Azure AD", en: "Azure AD" },
};
const OrgPlanMap: EnumTranslationRecord<OrgPlan> = {
  FREE: { fa: "رایگان", en: "Free" },
  PRO: { fa: "حرفه‌ای", en: "Pro" },
  BUSINESS: { fa: "بیزینس", en: "Business" },
  ENTERPRISE: { fa: "سازمانی", en: "Enterprise" },
};
const OrgRoleMap: EnumTranslationRecord<OrgRole> = {
  OWNER: { fa: "مدیر عامل", en: "Owner" },
  MANAGER: { fa: "مدیر", en: "Manager" },
  MEMBER: { fa: "عضو", en: "Member" },
};
const AssessmentStateMap: EnumTranslationRecord<AssessmentState> = {
  DRAFT: { fa: "پیش‌نویس", en: "Draft" },
  ACTIVE: { fa: "فعال", en: "Active" },
  CLOSED: { fa: "بسته شده", en: "Closed" },
  ARCHIVED: { fa: "آرشیو شده", en: "Archived" },
};
const SessionStateMap: EnumTranslationRecord<SessionState> = {
  SCHEDULED: { fa: "در انتظار برگزاری", en: "Scheduled" },
  IN_PROGRESS: { fa: "در حال برگزاری", en: "In Progress" },
  ANALYZING: { fa: "در حال پردازش نتایج", en: "Analyzing" },
  COMPLETED: { fa: "پایان یافته", en: "Completed" },
  CANCELLED: { fa: "لغو شده", en: "Cancelled" },
};
const ResponsePerspectiveMap: EnumTranslationRecord<ResponsePerspective> = {
  SELF: { fa: "خود", en: "Self" },
  FACILITATOR: { fa: "تسهیلگر", en: "Facilitator" },
  PEER: { fa: "همتا", en: "Peer" },
  MANAGER: { fa: "مدیر", en: "Manager" },
  SYSTEM: { fa: "سیستم", en: "System" },
};
const QuestionTypeMap: EnumTranslationRecord<QuestionType> = {
  SCALE: { fa: "مقیاسی", en: "Scale" },
  TEXT: { fa: "متنی", en: "Text" },
  MULTI_CHOICE: { fa: "چند انتخابی", en: "Multi choice" },
  SINGLE_CHOICE: { fa: "تک انتخابی", en: "Single choice" },
  BOOLEAN: { fa: "بله/خیر", en: "Boolean" },
};
const AIJobStatusMap: EnumTranslationRecord<AIJobStatus> = {
  QUEUED: { fa: "در صف", en: "Queued" },
  RUNNING: { fa: "در حال اجرا", en: "Running" },
  SUCCEEDED: { fa: "موفق", en: "Succeeded" },
  FAILED: { fa: "ناموفق", en: "Failed" },
  CANCELLED: { fa: "لغو شده", en: "Cancelled" },
};
const NotificationChannelMap: EnumTranslationRecord<NotificationChannel> = {
  IN_APP: { fa: "درون برنامه", en: "In-app" },
  EMAIL: { fa: "ایمیل", en: "Email" },
  SMS: { fa: "پیامک", en: "SMS" },
  PUSH: { fa: "پوش", en: "Push" },
};
const NotificationStatusMap: EnumTranslationRecord<NotificationStatus> = {
  PENDING: { fa: "در انتظار", en: "Pending" },
  SENT: { fa: "ارسال شده", en: "Sent" },
  READ: { fa: "خوانده شده", en: "Read" },
  FAILED: { fa: "ناموفق", en: "Failed" },
  DISMISSED: { fa: "رد شده", en: "Dismissed" },
};
const AuditActionTypeMap: EnumTranslationRecord<AuditActionType> = {
  CREATE: { fa: "ایجاد", en: "Create" },
  UPDATE: { fa: "به‌روزرسانی", en: "Update" },
  DELETE: { fa: "حذف", en: "Delete" },
  LOGIN: { fa: "ورود", en: "Login" },
  PERMISSION_CHANGE: { fa: "تغییر دسترسی", en: "Permission change" },
  SYSTEM: { fa: "سیستمی", en: "System" },
};
const AssetTypeMap: EnumTranslationRecord<AssetType> = {
  AVATAR: { fa: "آواتار", en: "Avatar" },
  DOCUMENT: { fa: "سند", en: "Document" },
  SPREADSHEET: { fa: "صفحه‌گسترده", en: "Spreadsheet" },
  IMAGE: { fa: "تصویر", en: "Image" },
  OTHER: { fa: "سایر", en: "Other" },
};
const PlatformRoleMap: EnumTranslationRecord<PlatformRole> = {
  MEMBER: { fa: "کاربر", en: "Member" },
  SUPER_ADMIN: { fa: "سوپر ادمین", en: "Super admin" },
  ANALYSIS_MANAGER: { fa: "مدیر تحلیل", en: "Analysis manager" },
  FACILITATOR: { fa: "تسهیلگر", en: "Facilitator" },
  SUPPORT: { fa: "پشتیبانی", en: "Support" },
  SALES: { fa: "فروش", en: "Sales" },
};
const OrganizationStatusMap: EnumTranslationRecord<OrganizationStatus> = {
  ACTIVE: { fa: "فعال", en: "Active" },
  SUSPENDED: { fa: "معلق", en: "Suspended" },
  ARCHIVED: { fa: "آرشیو", en: "Archived" },
};
const VerificationIdentifierTypeMap: EnumTranslationRecord<VerificationIdentifierType> =
  {
    EMAIL: { fa: "ایمیل", en: "Email" },
    PHONE: { fa: "تلفن", en: "Phone" },
  };
const VerificationPurposeMap: EnumTranslationRecord<VerificationPurpose> = {
  LOGIN: { fa: "ورود", en: "Login" },
  PASSWORD_RESET: { fa: "بازنشانی رمز", en: "Password reset" },
  MFA: { fa: "احراز دومرحله‌ای", en: "MFA" },
  EMAIL_VERIFY: { fa: "تایید ایمیل", en: "Email verify" },
  PHONE_VERIFY: { fa: "تایید تلفن", en: "Phone verify" },
  SENSITIVE_ACTION: { fa: "اقدام حساس", en: "Sensitive action" },
};
const AIAnalysisKindMap: EnumTranslationRecord<AIAnalysisKind> = {
  SUMMARY: { fa: "خلاصه", en: "Summary" },
  THEME: { fa: "تم", en: "Theme" },
  SENTIMENT: { fa: "احساس", en: "Sentiment" },
  RISK: { fa: "ریسک", en: "Risk" },
};

// ------------------------------
// Translator Instances
// ------------------------------

export const LocaleEnum = createTranslator<Locale>(LocaleMap);
export const GenderEnum = createTranslator<Gender>(GenderMap);
export const UserStatusEnum = createTranslator<UserStatus>(UserStatusMap);
export const AuthProviderEnum = createTranslator<AuthProvider>(AuthProviderMap);
export const OrgPlanEnum = createTranslator<OrgPlan>(OrgPlanMap);
export const OrgRoleEnum = createTranslator<OrgRole>(OrgRoleMap);
export const AssessmentStateEnum =
  createTranslator<AssessmentState>(AssessmentStateMap);
export const SessionStateEnum = createTranslator<SessionState>(SessionStateMap);
export const ResponsePerspectiveEnum = createTranslator<ResponsePerspective>(
  ResponsePerspectiveMap
);
export const QuestionTypeEnum = createTranslator<QuestionType>(QuestionTypeMap);
export const AIJobStatusEnum = createTranslator<AIJobStatus>(AIJobStatusMap);
export const NotificationChannelEnum = createTranslator<NotificationChannel>(
  NotificationChannelMap
);
export const NotificationStatusEnum = createTranslator<NotificationStatus>(
  NotificationStatusMap
);
export const AuditActionTypeEnum =
  createTranslator<AuditActionType>(AuditActionTypeMap);
export const AssetTypeEnum = createTranslator<AssetType>(AssetTypeMap);
export const PlatformRoleEnum = createTranslator<PlatformRole>(PlatformRoleMap);
export const OrganizationStatusEnum = createTranslator<OrganizationStatus>(
  OrganizationStatusMap
);
export const VerificationIdentifierTypeEnum =
  createTranslator<VerificationIdentifierType>(VerificationIdentifierTypeMap);
export const VerificationPurposeEnum = createTranslator<VerificationPurpose>(
  VerificationPurposeMap
);
export const AIAnalysisKindEnum =
  createTranslator<AIAnalysisKind>(AIAnalysisKindMap);

// ------------------------------
// Unified registry (for meta / dynamic usage)
// ------------------------------

export const EnumRegistry = {
  Locale: LocaleEnum,
  Gender: GenderEnum,
  UserStatus: UserStatusEnum,
  AuthProvider: AuthProviderEnum,
  OrgPlan: OrgPlanEnum,
  OrgRole: OrgRoleEnum,
  AssessmentState: AssessmentStateEnum,
  SessionState: SessionStateEnum,
  ResponsePerspective: ResponsePerspectiveEnum,
  QuestionType: QuestionTypeEnum,
  AIJobStatus: AIJobStatusEnum,
  NotificationChannel: NotificationChannelEnum,
  NotificationStatus: NotificationStatusEnum,
  AuditActionType: AuditActionTypeEnum,
  AssetType: AssetTypeEnum,
  PlatformRole: PlatformRoleEnum,
  OrganizationStatus: OrganizationStatusEnum,
  VerificationIdentifierType: VerificationIdentifierTypeEnum,
  VerificationPurpose: VerificationPurposeEnum,
  AIAnalysisKind: AIAnalysisKindEnum,
} as const;

export type EnumRegistryKey = keyof typeof EnumRegistry;

// ------------------------------
// Generic helpers for dynamic cases
// ------------------------------

export function translateEnum<K extends EnumRegistryKey>(
  key: K,
  value: string | null | undefined,
  locale?: LocaleCode
) {
  const reg = EnumRegistry[key];
  if (!value) return "";
  if (!reg.isEnum(value)) return value; // unknown raw passes through
  return reg.t(value as any, locale);
}

export function enumOptions<K extends EnumRegistryKey>(
  key: K,
  locale?: LocaleCode
) {
  return EnumRegistry[key].options(locale);
}

export function isEnumValue<K extends EnumRegistryKey>(
  key: K,
  value: unknown
): boolean {
  return EnumRegistry[key].isEnum(value);
}

export function coerceEnum<K extends EnumRegistryKey>(key: K, value: unknown) {
  return EnumRegistry[key].coerce(value);
}

// ------------------------------
// Example usage (remove in production if undesired)
// ------------------------------
/*
// Set locale globally:
setEnumLocale('fa');

// Translate single value:
QuestionTypeEnum.t('SCALE'); // => 'مقیاسی'

// Build select options:
const opts = QuestionTypeEnum.options(); // => [{ value: 'SCALE', label: 'مقیاسی', ... }, ...]

// Dynamic translation via registry:
translateEnum('QuestionType', 'TEXT');

// Validate / coerce:
coerceEnum('UserStatus', possiblyUserInput);
*/
