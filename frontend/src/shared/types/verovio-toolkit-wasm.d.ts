// src/types/verovio-toolkit-wasm.d.ts

declare module "verovio/wasm" {
  export interface VerovioModuleOptions {
    locateFile?: (path: string) => string;
  }

  export type VerovioArgType =
    | "number"
    | "string"
    | "boolean"
    | "array"
    | "object";

  export interface VerovioModule {
    onRuntimeInitialized?: () => void;
    FS?: {
      readFile: (path: string) => Uint8Array;
      writeFile: (path: string, data: Uint8Array) => void;
    };
    HEAPU8?: Uint8Array;
    _malloc?: (size: number) => number;
    _free?: (ptr: number) => void;
    ccall?: (
      ident: string,
      returnType: VerovioArgType,
      argTypes: VerovioArgType[],
      args: unknown[]
    ) => unknown;
    cwrap?: (
      ident: string,
      returnType: VerovioArgType,
      argTypes: VerovioArgType[]
    ) => (...args: unknown[]) => unknown;
  }

  const createVerovioModule: (
    options?: VerovioModuleOptions
  ) => Promise<VerovioModule>;

  export default createVerovioModule;
}

declare module "verovio/esm" {
  import type { VerovioModule } from "verovio/wasm";

  export class VerovioToolkit {
    constructor(module: VerovioModule);

    loadData(data: string): void;
    renderToSVG(
      page: number,
      options?: {
        scale?: number;
        adjustPageHeight?: boolean;
      }
    ): string;
    renderToMIDI(): string;
    setOptions(options: Record<string, unknown>): void;
    getPageCount(): number;
    getMeasureCount(): number;
  }
}
