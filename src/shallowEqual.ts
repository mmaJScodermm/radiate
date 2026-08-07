const isObjectLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const shallowEqual = <TValue>(
  previous: TValue,
  next: TValue,
): boolean => {
  if (Object.is(previous, next)) {
    return true;
  }

  if (Array.isArray(previous) && Array.isArray(next)) {
    if (previous.length !== next.length) {
      return false;
    }

    for (let index = 0; index < previous.length; index += 1) {
      if (!Object.is(previous[index], next[index])) {
        return false;
      }
    }

    return true;
  }

  if (!isObjectLike(previous) || !isObjectLike(next)) {
    return false;
  }

  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);

  if (previousKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of previousKeys) {
    if (!Object.prototype.hasOwnProperty.call(next, key)) {
      return false;
    }

    if (!Object.is(previous[key], next[key])) {
      return false;
    }
  }

  return true;
};
