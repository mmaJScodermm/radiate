# iradiate

`iradiate` is a lightweight React state management library powered by RxJS `BehaviorSubject`.

The library keeps store creation and subscription logic independent from React Context. If you want Context, you can pass the result of `useRadiateState` into your own provider.

## Features

- Tiny store core with a familiar `getState` / `setState` API
- React-friendly state snapshots through `useState`
- Direct RxJS access via `subject` and `state$`
- Built-in `shallowEqual` for selector memo-like comparisons
- First-class TypeScript support

## Install

```bash
npm install iradiate react
```

For local development inside this repo:

```bash
npm install
npm run build
```

## Quick Start

```tsx
import { useRadiateState } from "iradiate";

type CounterState = {
  count: number;
  step: number;
};

export function Counter() {
  const counter = useRadiateState<CounterState>(() => ({
    count: 0,
    step: 1,
  }));
  const { count, step } = counter.state;

  return (
    <div>
      <p>{count}</p>
      <button
        onClick={() => {
          counter.setState((state) => ({
            count: state.count + state.step,
          }));
        }}
      >
        increment
      </button>
      <button onClick={() => counter.patchState({ step: step + 1 })}>
        increase step
      </button>
    </div>
  );
}
```

## API

### `createStore(initialState)`

Creates a store backed by an RxJS `BehaviorSubject`.

```ts
const store = createStore({ count: 0 });
```

Store methods:

- `getState()`: read the current snapshot
- `setState(updater, options?)`: update state with a partial object or full replacement
- `patchState(partial)`: shallow merge convenience method
- `select(selector, options?)`: create a typed observable stream
- `subscribe(listener)`: subscribe to the full state stream
- `subscribeTo(selector, listener, options?)`: subscribe to derived state
- `reset()`: reset to the original initial state
- `destroy()`: complete the underlying subject

Store fields:

- `subject`: the underlying `BehaviorSubject`
- `state$`: observable stream of the full state

### `useRadiateState(initialState)`

Creates a store once per component and returns a React-friendly object with a live `state` field.

```tsx
const counter = useRadiateState({ count: 0, step: 1 });
console.log(counter.state.count);
```

### `useRadiateStore(store)`

Turns an existing store into a React-friendly value with `state`.

### `useRadiateValue(store, selector?, options?)`

Subscribes a component to a derived slice of store state.

```tsx
const count = useRadiateValue(counterStore, (state) => state.count);
```

### `shallowEqual(previous, next)`

Performs a shallow comparison for plain objects and arrays. This is useful when your selector returns a new object or array each time, but you only want to rerender when one of the top-level fields actually changes.

```tsx
import { shallowEqual, useRadiateValue } from "iradiate";

const userInfo = useRadiateValue(
  userStore,
  (state) => ({ name: state.name, age: state.age }),
  { equalityFn: shallowEqual },
);
```

### `useStore(store, selector?, options?)`

Alias of `useRadiateValue` for a shorter selector hook.

## Use With Your Own Context

```tsx
import { createContext, useContext } from "react";
import { useRadiateState } from "iradiate";

type CounterState = {
  count: number;
  step: number;
};

const CounterContext = createContext<
  ReturnType<typeof useRadiateState<CounterState>> | null
>(null);

export function CounterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const counter = useRadiateState<CounterState>({
    count: 0,
    step: 1,
  });

  return (
    <CounterContext.Provider value={counter}>
      {children}
    </CounterContext.Provider>
  );
}

export function useCounter() {
  const counter = useContext(CounterContext);

  if (!counter) {
    throw new Error("CounterContext is missing");
  }

  return counter;
}
```
