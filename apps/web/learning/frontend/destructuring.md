# JavaScript/TypeScript Destructuring Explained

Destructuring is a syntax in JavaScript (and TypeScript) that lets you quickly extract values from objects or arrays and assign them to variables.

---

## 1. Object Destructuring

### Basic Example

```js
const user = { name: "Ali", age: 25, city: "Tehran" };

// Without destructuring:
const name1 = user.name;
const age1 = user.age;

// With destructuring:
const { name, age } = user;
// name = 'Ali', age = 25
```

### In Function Parameters

```js
function greet({ name, age }) {
  console.log(`Hello ${name}, you are ${age} years old!`);
}

greet({ name: "Sara", age: 30 });
// Output: Hello Sara, you are 30 years old!
```

### With TypeScript Type Annotation

```ts
function showUser({ name, age }: { name: string; age: number }) {
  // ...
}
```

---

## 2. Array Destructuring

### Basic Example

```js
const arr = [10, 20, 30];
const [first, second] = arr;
// first = 10, second = 20
```

### Skipping Items

```js
const [, , third] = arr;
// third = 30
```

---

## 3. Nested Destructuring

```js
const user = { name: "Ali", address: { city: "Tehran", zip: 12345 } };
const {
  address: { city },
} = user;
// city = 'Tehran'
```

---

## 4. Default Values

```js
const { name, age = 18 } = { name: "Sara" };
// name = 'Sara', age = 18 (default)
```

---

## 5. Destructuring in Function Parameters (with TypeScript)

```ts
// Example with Next.js page props
export default function Page({ params }: { params: { id: string } }) {
  // params is directly available
  return <div>{params.id}</div>;
}
```

---

## 6. Why Use Destructuring?

- Cleaner and shorter code
- Direct access to needed values
- Useful in function parameters for clarity

---

## 7. Summary Table

| Pattern        | Example                  | Result                 |
| -------------- | ------------------------ | ---------------------- |
| Object         | const { a } = obj        | a = obj.a              |
| Array          | const [a, b] = arr       | a = arr[0], b = arr[1] |
| Function Param | function({ a }) { ... }  | a = arg.a              |
| Nested         | const { a: { b } } = obj | b = obj.a.b            |
| Default Value  | const { a = 1 } = obj    | a = obj.a or 1         |

---