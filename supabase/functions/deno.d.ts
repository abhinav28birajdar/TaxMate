// Deno Ambient Type Declarations for IDE Intellisense and TypeScript checking
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): Record<string, string>;
  }

  export const env: Env;
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
  export function serve(options: { port?: number }, handler: (req: Request) => Promise<Response> | Response): void;
}

declare function serve(handler: (req: Request) => Promise<Response> | Response): void;
