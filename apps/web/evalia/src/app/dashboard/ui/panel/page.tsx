import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
  PanelFooter,
  PanelAction,
} from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, Star, Bell } from "lucide-react";

export default function PanelShowcase() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-lg font-bold">پنل (Panel)</h1>
      <p className="text-sm text-muted-foreground mb-2">
        Panel برای بخش‌های محتوامحور و پس‌زمینه‌های تفکیک شده استفاده می‌شود. با
        سیستم رنگ و radius پروژه هماهنگ است و در دارک/لایت تغییر می‌کند.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 1) پنل اطلاعاتی با اکشن‌ها */}
        <Panel>
          <PanelHeader>
            <PanelTitle>وضعیت سازمان</PanelTitle>
            <PanelAction>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
                بیشتر
              </Button>
            </PanelAction>
            <PanelDescription>نمای کلی شاخص‌های کلیدی</PanelDescription>
          </PanelHeader>
          <PanelContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs mb-1">
                  نرخ رشد
                </div>
                <div className="font-semibold">+4.2%</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs mb-1">
                  کاربران فعال
                </div>
                <div className="font-semibold">12,480</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs mb-1">
                  میانگین رضایت
                </div>
                <div className="font-semibold">4.6/5</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs mb-1">
                  تیکت‌های باز
                </div>
                <div className="font-semibold">32</div>
              </div>
            </div>
          </PanelContent>
          <PanelFooter className="gap-2">
            <Button size="sm">مشاهده گزارش</Button>
            <Button variant="outline" size="sm">
              تنظیمات
            </Button>
          </PanelFooter>
        </Panel>

        {/* 2) پنل رسانه‌ای/محصول */}
        <Panel>
          <PanelHeader>
            <div className="inline-flex items-center justify-center w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/20">
              پیشنهاد ویژه
            </div>
            <PanelTitle className="mt-1">پلن سازمانی</PanelTitle>
            <PanelDescription>
              امکانات پیشرفته برای تیم‌های بزرگ
            </PanelDescription>
          </PanelHeader>
          <PanelContent>
            <div className="rounded-xl border overflow-hidden">
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              دسترسی نامحدود، نقش‌ها و مجوزهای سفارشی، پشتیبانی اولویت‌دار.
            </div>
          </PanelContent>
          <PanelFooter className="justify-between">
            <div className="text-sm">
              <span className="font-semibold text-foreground">1,490,000</span>
              <span className="text-muted-foreground mr-1 text-xs">
                تومان/ماه
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                جزئیات
              </Button>
              <Button size="sm">خرید</Button>
            </div>
          </PanelFooter>
        </Panel>

        {/* 3) پنل با لیست و اکشن‌های کوچک */}
        <Panel>
          <PanelHeader>
            <PanelTitle>فعالیت‌های اخیر</PanelTitle>
            <PanelDescription>آخرین بروزرسانی‌ها و رخدادها</PanelDescription>
          </PanelHeader>
          <PanelContent>
            <ul className="space-y-3 text-sm">
              {[1, 2, 3, 4].map((i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted/60 grid place-items-center">
                      <Star className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">آیتم شماره {i}</div>
                      <div className="text-muted-foreground text-xs">
                        توضیح کوتاه فعالیت
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      لغو
                    </Button>
                    <Button size="sm">تأیید</Button>
                  </div>
                </li>
              ))}
            </ul>
          </PanelContent>
          <PanelFooter className="justify-between">
            <div className="text-xs text-muted-foreground">
              ۴ مورد نمایش داده شد
            </div>
            <Button variant="outline" size="sm">
              مشاهده همه
            </Button>
          </PanelFooter>
        </Panel>
      </div>

      <Separator className="my-2" />

      <div className="mt-2">
        <h2 className="text-base font-semibold mb-2">نمونه کد</h2>
        <pre className="bg-muted/50 rounded p-4 text-xs overflow-x-auto rtl text-left">
          {`<Panel>
  <PanelHeader>
    <PanelTitle>عنوان پنل</PanelTitle>
    <PanelAction>
      <Button variant="ghost" size="sm">اکشن</Button>
    </PanelAction>
    <PanelDescription>توضیح کوتاه</PanelDescription>
  </PanelHeader>
  <PanelContent>
    ...
  </PanelContent>
  <PanelFooter>
    <Button size="sm">دکمه اصلی</Button>
    <Button variant="outline" size="sm">دکمه فرعی</Button>
  </PanelFooter>
</Panel>`}
        </pre>
      </div>

      {/* نمونه‌های تراکم (density) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel className="gap-4 p-4">
          <PanelHeader className="px-4">
            <PanelTitle>تراکم فشرده</PanelTitle>
            <PanelDescription>
              برای لیست‌ها و داشبوردهای پرتراکم
            </PanelDescription>
          </PanelHeader>
          <PanelContent className="px-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="rounded-lg border p-2">
                  آیتم {idx + 1}
                </div>
              ))}
            </div>
          </PanelContent>
        </Panel>

        <Panel className="gap-8 p-6">
          <PanelHeader className="px-6">
            <PanelTitle>تراکم عادی</PanelTitle>
            <PanelDescription>خوانایی بیشتر برای محتوا</PanelDescription>
          </PanelHeader>
          <PanelContent className="px-6">
            <div className="prose prose-sm rtl:max-w-none">
              <p>
                این یک متن نمونه برای بررسی فاصله‌ها و تایپوگرافی داخل پنل است.
              </p>
              <ul>
                <li>پشتیبانی از دارک/لایت</li>
                <li>اسلات‌های عنوان، توضیح، محتوا و فوتر</li>
                <li>سازگار با دکمه‌ها و جداکننده‌ها</li>
              </ul>
            </div>
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
}
