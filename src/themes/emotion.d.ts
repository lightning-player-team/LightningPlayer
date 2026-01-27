import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    colors: {
      button: {
        text: {
          background: string;
          color: string;
          hoverBackground: string;
        };
      };
      playerControls: {
        button: {
          color: string;
          foreground: string;
        };
        progressBar: {
          background: string;
          hoverFill: string;
          thumb: string;
        };
        previewThumbnail: {
          background: string;
          border: string;
          timestampBackground: string;
          timestampColor: string;
        };
        volumeControl: {
          background: string;
          fill: string;
          thumb: string;
        };
      };
      root: {
        background: string;
      };
      scrollbar: {
        thumb: string;
        track: string;
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
      window: {
        background: string;
      };
    };
    motion: {
      playerControls: {
        button: {
          transitionDuration: string;
          transitionTimingFunction: string;
        };
        overlay: {
          transitionDuration: string;
          transitionTimingFunction: string;
        };
        progressBar: {
          transitionDuration: string;
          transitionTimingFunction: string;
        };
      };
    };
  }
}
