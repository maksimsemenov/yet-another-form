export const debounce = (func, threshold = 50) => {
  let lastArgs, timeout;
  return (...args) => {
    lastArgs = [...args];

    if (!timeout) {
      timeout = setTimeout(() => {
        func(...lastArgs);
        timeout = undefined;
      }, threshold);
    }
  };
};
