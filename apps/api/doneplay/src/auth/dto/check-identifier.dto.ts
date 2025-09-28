import { IsNotEmpty, IsString } from 'class-validator';

export class CheckIdentifierDto {
  @IsString()
  @IsNotEmpty()
  /**
   * شماره موبایل ورودی کاربر (فرمت خام، قبل از استانداردسازی)
   * این فیلد باید همیشه مقدار داشته باشد و برای اعتبارسنجی اولیه استفاده می‌شود.
   */
  phone!: string;
}
