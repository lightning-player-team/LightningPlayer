import { forwardRef } from "react";
import { textButtonStyles } from "./Button.styles";
import { ButtonVariant, IButtonProps } from "./Button.tc";

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  ({ variant = ButtonVariant.TEXT, ...props }, ref) => {
    return (
      <button
        css={textButtonStyles}
        data-variant={variant}
        ref={ref}
        {...props}
      />
    );
  }
);
