import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    colors: {
      home: {
        background: string;
      };
      text: {
        default: string;
        link: string;
      };
    };
  }
}
