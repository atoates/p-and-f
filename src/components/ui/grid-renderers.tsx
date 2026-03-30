"use client";

import { Badge } from "@/components/ui/badge";

interface CellRendererProps {
  value: any;
  data?: any;
}

export const StatusBadgeRenderer = (props: CellRendererProps) => {
  const statusColors: Record<
    string,
    "primary" | "success" | "warning" | "danger" | "secondary"
  > = {
    draft: "secondary",
    sent: "primary",
    accepted: "success",
    rejected: "danger",
    expired: "danger",
    pending: "warning",
    confirmed: "success",
    completed: "primary",
    cancelled: "danger",
    paid: "success",
    overdue: "danger",
    New: "warning",
    TBD: "secondary",
    Live: "success",
    Done: "primary",
    Placed: "primary",
    Order: "success",
  };

  const value = props.value || "";
  const displayValue = typeof value === "string"
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : String(value);

  return (
    <Badge
      variant={
        statusColors[value as keyof typeof statusColors] || "secondary"
      }
    >
      {displayValue}
    </Badge>
  );
};

export const CurrencyRenderer = (props: CellRendererProps) => {
  if (!props.value) return "-";
  const formatted = parseFloat(props.value).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `£${formatted}`;
};

export const DateRenderer = (props: CellRendererProps) => {
  if (!props.value) return "-";
  return new Date(props.value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const CategoryBadgeRenderer = (props: CellRendererProps) => {
  if (!props.value) return "-";
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {props.value}
    </span>
  );
};
