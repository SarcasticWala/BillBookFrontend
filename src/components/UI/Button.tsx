
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  ...props
}) => {
  let variantStyle = "";
  if (variant === "primary") {
    variantStyle = "bg-[#6366f1] text-white hover:bg-primary-hover";
  } else if (variant === "outline") {
    variantStyle = "bg-white border border-gray-300 text-gray-700 hover:shadow-sm";
  } else if (variant === "danger") {
    variantStyle = "flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm rounded-md text-gray-700 hover:shadow";
  }

  let sizeStyle = "";
  if (size === "sm") {
    sizeStyle = "px-3 py-1 text-sm";
  } else if (size === "md") {
    sizeStyle = "px-4 py-2 text-sm";
  } else if (size === "lg") {
    sizeStyle = "px-5 py-3 text-base";
  }

  const baseStyle =
    "rounded-md font-medium focus:outline-none transition whitespace-nowrap shadow-sm";

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
