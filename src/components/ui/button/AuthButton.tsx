import React from "react";
import Spinner from "../../common/Spinner";

type ButtonProps = {
    variant?: "primary" | "secondary" | "danger" | "success";
    children: React.ReactNode;
    onClick?: () => void;
    isPending?: boolean;
    type?: "submit" | "button";
    size?: "sm" | "lg";
    className?: string;
};

function CommonButton({
                          variant = "primary",
                          children,
                          onClick,
                          isPending = false,
                          type = "button",
                          size,
                          className = "",
                      }: ButtonProps) {
    const baseStyle =
        "flex items-center justify-center gap-2 w-full h-[54px] rounded-full font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
        primary: "bg-brand-500 text-white hover:bg-brand-700",
        secondary: "bg-gray-600 text-white hover:bg-gray-700",
        success: "bg-green-600 text-white hover:bg-green-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes: Record<string, string> = {
        sm: "px-3 py-1 text-sm",
        lg: "px-6 py-3 text-lg",
        default: "px-4 py-2",
    };

    return (
        <button
            onClick={onClick}
            disabled={isPending}
            type={type}
            className={`${baseStyle} ${variants[variant] || variants.primary} ${
                sizes[size || "default"]
            } ${className}`}
        >
            {isPending && <Spinner/>}
            {children}
        </button>
    );
}

export default CommonButton;