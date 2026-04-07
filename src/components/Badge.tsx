import React from "react";
import type { ColorSet } from "../types";

export interface BadgeProps {
  label: string;
  colors: ColorSet;
}

export const Badge: React.FC<BadgeProps> = ({ label, colors }) => (
  <span
    className="badge"
    style={{
      background: colors.bg,
      color: colors.color,
      border: colors.border ? `1px solid ${colors.border}` : undefined,
    }}
  >
    {label}
  </span>
);
