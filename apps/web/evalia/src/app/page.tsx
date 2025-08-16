import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/modetoggle";

export default function Home() {
  return (
    <>
      <div className="flex justify-end p-4">
        <ModeToggle />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen gap-6  p-4">
        <div className="text-center text-white text-lg mb-4">
          tailwind css فعال است.
        </div>
        <div className="flex flex-wrap gap-3">
          <ModeToggle />
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="icon button">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </Button>
        </div>
      </div>
    </>
  );
}
