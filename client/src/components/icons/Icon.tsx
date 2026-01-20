import { ICON_PATHS, IconName } from "@/components/icons/lib";
import React from "react";

export interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
  name: IconName;
  strokeWidth?: number;
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
}

export const Icon = ({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth = 1.5,
  onClick,
}: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onClick={onClick}
    >
      {/* İkonun asıl şeklini burası çiziyor */}
      {ICON_PATHS[name]}
    </svg>
  );
};
