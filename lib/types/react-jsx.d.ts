import * as React from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
  // Also shim for components used as JSX elements
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): React.ReactNode | Promise<React.ReactNode> | any;
  }
}
