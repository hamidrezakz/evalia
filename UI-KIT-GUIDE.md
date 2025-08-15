# UI Kit Guide — Architecture, Conventions, and Standards

This guide defines how we design, implement, document, and test UI components in this repository. It’s opinionated, practical, and aligns with our current Button implementation.

Goals

- Consistent component architecture across the codebase
- Predictable styling overrides and theme behavior
- First-class TypeScript types driven by a single source of truth
- Strong accessibility and composability out of the box

---

## Folder structure

Each component lives in its own folder under `components/ui/ComponentName/`:

```
components/ui/
  ComponentName/
    index.tsx        // Main component (logic + JSX)
    variants.ts      // Variant (or a variants folder that contains multiple variant files) that define styles with cva (style API)
    motion.tsx       // Animations (or a motion folder that contains multiple motion files) (framer-motion) [optional]
    types.ts         // TypeScript types derived from variants
    README.md        // Usage, props, examples
    test.tsx         // Unit tests (logic + rendering states)
```

Barrel export at `components/ui/index.ts` is encouraged for ergonomics (e.g., `export { Button, buttonVariants } from "./Button"`).

---

## Core principles

- Single responsibility: one component = one job.
- Composability: support `asChild` with Radix `Slot` where it makes sense.
- Variants via `cva`: class composition lives in `variants.ts`, not inline.
- Types from variants: use `VariantProps<typeof variants>` so unions stay in sync.
- Predictable overrides: always merge base → variants → user classes via `cn`.
- Accessibility: semantic roles, keyboard, ARIA, and decorative elements hidden.
- Documentation and tests are mandatory for public components.

---

## Styling and overrides (Tailwind + cn)

We use a `cn` helper (clsx + tailwind-merge). Always order arguments so the user’s classes win on conflicts:

- Root className: `cn(base, variants(...), className)`
- Content wrapper className: `cn(base, contentClassName)`
- Effect layers (e.g., ripple): `cn(base, defaultByVariant, userOverride)`

tailwind-merge de-duplicates utilities by group and keeps the last conflicting utility in the same modifier scope (e.g., `hover:`, `md:`, `dark:`). This makes overrides deterministic.

---

## Variants with cva

- Define visual variants (e.g., `variant`, `size`) in `variants.ts` using `cva`.
- Export both the cva instance and a typed helper if needed: `export const buttonVariants = cva(...);`
- Derive types in `types.ts`:
  - `type FooVariants = VariantProps<typeof fooVariants>`
  - `export type FooVariant = NonNullable<FooVariants['variant']>`
  - `export type FooSize = NonNullable<FooVariants['size']>`
- Public props extend `FooVariants` and relevant native props.

---

## Polymorphism (asChild + Slot)

- If a component’s styles can apply to multiple underlying elements (button, a, div), support `asChild`.
- Use Radix `Slot` so the consumer controls the rendered tag and attributes.
- When using refs in polymorphic components, compose refs via a local `mergeRefs` helper so internal logic and external consumers receive the same DOM node.

---

## Content wrapper pattern

- For components with visual effects (e.g., ripple), render an inner content wrapper (e.g., `span`) above effects:
  - `position: relative; z-index` on content
  - `inline-flex items-center gap-2` for consistent icon/text layout
  - Provide `contentClassName` so consumers can override `gap`, alignment, and content-only color without affecting effect layers.

This isolates layout from effects and keeps content reliably above animated layers.

---

## Ripple and motion layers

- Use `motion.tsx` to encapsulate animations. Ripple elements must be:
  - `position: absolute`, `pointer-events: none`, `aria-hidden`
  - Stacked under content (z-index lower than content wrapper)
  - Customizable by a `rippleClassName` prop with sensible per-variant defaults
- Prefer farthest-corner radius calculation for full coverage.
- Consider a prop to disable motion entirely (e.g., `ripple={false}`).

---

## Accessibility checklist

- Use the semantic element by default (e.g., `<button>`), extend native props.
- Manage disabled state (both visual and interactive) appropriately.
- Decorative elements (e.g., ripple) must be `aria-hidden` and non-interactive.
- Keyboard support: ensure focus-visible rings, tab order, and key handling where relevant.
- Labeling: use `aria-label` or associate labels for icon-only buttons.

---

## Performance guidance

- Avoid unnecessary client components. If styles are needed server-side, export the `*-variants` helper and use it in server-only markup.
- Consider lazy-loading heavy motion code or provide a CSS-only fallback.
- Keep variant logic in `variants.ts` (tree-shakeable strings) and avoid dynamic inline styles where utilities suffice.

---

## Testing guidelines

- Snapshot and DOM queries for rendered states across variants and sizes.
- Unit-test logic (e.g., ripple math, conditionals) separately if extracted.
- Accessibility tests: role, name, disabled, tab focus, and ARIA where applicable.

---

## Documentation standards (README.md)

Each component README must include:

- Description and purpose
- API (props table with types/defaults; note derived types if using cva)
- Usage examples (basic, asChild, overrides, responsive tweaks)
- Behavior and layering (e.g., content wrapper and effects)
- Accessibility notes
- Performance notes
- Customization hooks (where to modify variants or motion)

Keep examples minimal and copy-pasteable.

---

## Naming and exports

- PascalCase component folder and file names (e.g., `Button/index.tsx`).
- Export the component and its variants from the component folder’s `index.tsx` or a local index barrel, and re-export from `components/ui/index.ts`.
- Keep import paths consistent (optionally using an alias like `@/components/ui`).

---

## Creating a new component — step by step

1. Scaffold files:
   - `index.tsx`, `variants.ts`, `types.ts`, optional `motion.tsx`, `README.md`, `test.tsx`
2. Define styles in `variants.ts` with cva (variant + size + defaults)
3. Define types in `types.ts` with `VariantProps<typeof variants>`
4. Implement `index.tsx`:
   - Support `asChild` where reasonable (Radix `Slot`)
   - Use `cn(base, variants(...), className)` on root
   - If there are effects, isolate content in an inner wrapper and expose `contentClassName`
   - Compose refs when internal logic needs DOM access (`mergeRefs`)
5. Add tests and README with examples
6. Export from `components/ui/index.ts`

---

## Server-only usage (no client hydration)

If you only need styles (e.g., for a link in server components), use the exported variants helper directly without importing the client component:

```tsx
import { buttonVariants } from "@/components/ui";

<a href="/docs" className={buttonVariants({ variant: "default", size: "sm" })}>
  Docs
  {/* This avoids turning the link into a client component */}
  {/* You won’t get ripple or other client-side effects */}
</a>;
```

---

## References

- class-variance-authority (cva): https://cva.style/
- framer-motion: https://www.framer.com/motion/
- Radix UI Slot: https://www.radix-ui.com/primitives/docs/utilities/slot
- tailwind-merge: https://github.com/dcastil/tailwind-merge
- React Accessibility: https://react.dev/learn/accessibility

---

Following these standards keeps our components consistent, type-safe, and easy to evolve.
