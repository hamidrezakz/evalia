// useCallback-cheatsheet.md

# React useCallback Cheat Sheet

## What is useCallback?

`useCallback` is a React Hook that returns a memoized (cached) version of a callback function. The function is only recreated if its dependencies change.

**Signature:**

```javascript
const memoizedFn = useCallback(fn, [dep1, dep2, ...]);
```

## Why use useCallback?

- Prevents unnecessary recreation of functions on every render.
- Keeps function reference stable between renders unless dependencies change.
- Optimizes performance, especially when passing functions to child components or using them in dependency arrays.
- Avoids unwanted re-renders and side effects in children or hooks.

## When should you use useCallback?

1. **Passing functions as props to child components**
   - Prevents child from re-rendering unless truly needed.
2. **Using functions in dependency arrays (e.g., useEffect, useMemo, custom hooks)**
   - Ensures effect only runs when function logic actually changes.
3. **Expensive function creation**
   - Avoids recreating costly functions unless necessary.

## When NOT to use useCallback?

- For simple functions used only in the same component and not passed as props or dependencies, useCallback is usually unnecessary.

## Example: Why reference matters

```javascript
function Parent({ value }) {
  // Without useCallback: handleClick is recreated every render
  const handleClick = () => {
    console.log(value);
  };

  return <Child onClick={handleClick} />;
}

function Child({ onClick }) {
  useEffect(() => {
    // This effect runs every time onClick reference changes
    console.log("Effect runs!");
  }, [onClick]);

  return <button onClick={onClick}>Click</button>;
}
```

**Problem:**
Every time Parent re-renders, handleClick is a new function, so Child's effect runs again—even if value didn't change.

**Solution with useCallback:**

```javascript
const handleClick = useCallback(() => {
  console.log(value);
}, [value]);
```

Now, handleClick only changes when value changes, keeping Child's effect stable.

## How does useCallback work?

- React stores the function and only recreates it if dependencies change.
- If dependencies stay the same, the same function reference is returned.

## Key Points

- Memoizes function reference, not the result.
- Dependencies must include all variables used inside the function that can change.
- Useful for performance and correctness in complex React apps.

## Summary Table

| Use Case                       | Should Use useCallback? |
| ------------------------------ | ----------------------- |
| Passing function to child prop | Yes                     |
| Using function in useEffect    | Yes                     |
| Expensive function creation    | Yes                     |
| Simple local function          | No                      |

---

## Quick Reference

- `useCallback(fn, [deps])` returns a stable function unless deps change.
- Use for props, dependencies, and performance.
- Don't overuse—only when reference stability matters.

---

**Reviewed by GitHub Copilot – July 2025**
