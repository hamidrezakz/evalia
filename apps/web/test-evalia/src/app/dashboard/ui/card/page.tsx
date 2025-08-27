import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, Star } from "lucide-react";

export default function CardShowcase() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-lg font-bold">کارت (Card)</h1>
      <p className="text-sm text-muted-foreground mb-2">
        Card برای گروه‌بندی محتوا، نمایش اطلاعات، و ساختاردهی بخش‌های UI استفاده
        می‌شود. از بخش‌های استاندارد Header, Content, Footer, Action پشتیبانی
        می‌کند و با سیستم رنگ و radius پروژه هماهنگ است.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 1) کارت اطلاعاتی با اکشن‌ها */}
        <Card>
          <CardHeader>
            <CardTitle>وضعیت سازمان</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <MoreHorizontal className="size-4" />
                بیشتر
              </Button>
            </CardAction>
            <CardDescription>نمای کلی شاخص‌های کلیدی</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">مشاهده گزارش</Button>
            <Button variant="outline" size="sm">
              تنظیمات
            </Button>
          </CardFooter>
        </Card>

        {/* 2) کارت محتوای رسانه‌ای/محصول */}
        <Card>
          <CardHeader>
            <div className="inline-flex items-center justify-center w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/20">
              پیشنهاد ویژه
            </div>
            <CardTitle className="mt-1">پلن سازمانی</CardTitle>
            <CardDescription>امکانات پیشرفته برای تیم‌های بزرگ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-hidden">
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              دسترسی نامحدود، نقش‌ها و مجوزهای سفارشی، پشتیبانی اولویت‌دار.
            </div>
          </CardContent>
          <CardFooter className="justify-between">
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
          </CardFooter>
        </Card>

        {/* 3) کارت با لیست و اکشن‌های کوچک */}
        <Card>
          <CardHeader>
            <CardTitle>فعالیت‌های اخیر</CardTitle>
            <CardDescription>آخرین بروزرسانی‌ها و رخدادها</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-muted-foreground">
              ۴ مورد نمایش داده شد
            </div>
            <Button variant="outline" size="sm">
              مشاهده همه
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Separator className="my-2" />

      <div className="mt-2">
        <h2 className="text-base font-semibold mb-2">نمونه کد</h2>
        <pre className="bg-muted/50 rounded p-4 text-xs overflow-x-auto rtl text-left">
          {`<Card>
  <CardHeader>
    <CardTitle>عنوان کارت</CardTitle>
    <CardAction>
      <Button variant="ghost" size="sm">اکشن</Button>
    </CardAction>
    <CardDescription>توضیح کوتاه</CardDescription>
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
  <CardFooter>
    <Button size="sm">دکمه اصلی</Button>
    <Button variant="outline" size="sm">دکمه فرعی</Button>
  </CardFooter>
</Card>`}
        </pre>
      </div>
    </div>
  );
}
