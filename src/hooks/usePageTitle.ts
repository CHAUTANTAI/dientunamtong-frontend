"use client";

import { ADMIN_ROUTES } from "@/constants/routes";
import { usePathname } from "next/navigation";

export const usePageTitle = () => {
  const pathname = usePathname();

  const route = ADMIN_ROUTES.find((r) => r.path === pathname);
  if (route) return route.label;

  // fallback
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];

  return last ? last.toUpperCase() : "DASHBOARD";
};
