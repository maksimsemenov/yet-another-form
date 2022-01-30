export const flatten = (source, basePath, target = {}) => {
  if (source && typeof source === "object") {
    for (let key in source) {
      let value = source[key];
      let path = basePath ? `${basePath}.${key}` : key;
      if (typeof value !== "object" || !value || value instanceof Promise)
        target[path] = value;
      else flatten(value, path, target);
    }
  }
  return target;
};
