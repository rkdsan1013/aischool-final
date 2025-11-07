// src/router/navigate.ts
let navigator: ((path: string) => void) | null = null;

export function setNavigator(fn: (path: string) => void) {
  navigator = fn;
}

export function navigate(path: string) {
  if (navigator) {
    navigator(path);
  } else {
    console.warn("Navigator is not set yet");
  }
}
