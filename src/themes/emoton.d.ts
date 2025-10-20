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
      titleBar: {
        activeBackground: string;
        activeForeground: string;
        hoverBackground: string;
        hoverCloseBackground: string;
        hoverCloseForeground: string;
        pressedBackground: string;
        pressedCloseBackground: string;
        inactiveBackground: string;
        inactiveForeground: string;
      };
    };
  }
}
