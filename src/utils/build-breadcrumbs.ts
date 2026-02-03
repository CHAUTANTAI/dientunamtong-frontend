// src/utils/buildBreadcrumbs.ts

import { ADMIN_ROUTES } from "@/constants/routes";

export const buildBreadcrumbs = (pathname: string) => {
  const map = new Map(ADMIN_ROUTES.map((r) => [r.path, r]));

  const items = [];
  let current = map.get(pathname);

  while (current) {
    items.unshift({
      title: current.label,
      href: current.path,
    });
    current = current.parent ? map.get(current.parent) : undefined;
  }

  return items;
};
