export function useResolver(handlers: string[], callback: Function) {
  const state: any = {};
  let resolvedCount: number = 0;

  handlers.forEach((handler: string) => {
    state[handler] = false;
  });

  const resolved = (handler: string) => {
    if (typeof state[handler] === 'undefined') {
      return false;
    }

    state[handler] = true;
    resolvedCount += 1;

    if (resolvedCount === Object.keys(state).length) {
      callback();
    }

    return true;
  };

  return {
    resolved,
  };
}
