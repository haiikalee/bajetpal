declare module 'next' {
  export interface RouteHandlerContext {
    params: Record<string, string | string[]>;
  }
} 