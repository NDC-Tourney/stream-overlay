declare module "*.svg" {
  const path: `${string}.svg`;
  export = path;
}

declare module "*.png" {
  const path: `${string}.png`;
  export = path;
}

declare module "*.module.css" {
  /**
   * A record of class names to their corresponding CSS module classes
   */
  const classes: { readonly [key: string]: string };
  export = classes;
}

declare namespace React {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
