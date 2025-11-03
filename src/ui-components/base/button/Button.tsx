import { forwardRef } from "react";
import { ButtonVariant, IButtonProps } from "./Button";
import { textButtonStyles } from "./Button.styles";

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  ({ variant = ButtonVariant.Text, ...props }, ref) => {
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
