declare module '@ohif/viewer' {
  export const installViewer: (
    config: Record<string, unknown>,
    containerId?: string,
    callback?: (e: unknown) => void,
  ) => void;
}

declare global {
  interface Window {
    config: Record<string, unknown>;
  }
}
