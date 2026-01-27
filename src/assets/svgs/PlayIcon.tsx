import { SVGProps } from "react";

// FluentPlay48Filled
export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 48 48"
      {...props}
    >
      {/* Icon from Fluent UI System Icons by Microsoft Corporation - https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE */}
      <path
        fill="currentColor"
        d="m16.75 8.412l24.417 12.705a3.25 3.25 0 0 1 0 5.766L16.75 39.588A3.25 3.25 0 0 1 12 36.705v-25.41a3.25 3.25 0 0 1 4.549-2.98z"
      />
    </svg>
  );
}
export default PlayIcon;
