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
    variantStyle = "bg-primary text-white hover:bg-primary-hover";
  } else if (variant === "outline") {
    variantStyle =
      "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm";
  } else if (variant === "danger") {
    variantStyle = "bg-red-600 text-white hover:bg-red-700";
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
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition whitespace-nowrap shadow-sm " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";



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
