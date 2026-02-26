// src/utils/buildBreadcrumbs.ts

import { ADMIN_ROUTES } from '@/constants/routes';

export const buildBreadcrumbs = (pathname: string) => {
  const map = new Map(ADMIN_ROUTES.map((r) => [r.path, r]));

  // Try exact match first
  let current = map.get(pathname);
  
  // If no exact match, try to match dynamic routes
  if (!current) {
    // Handle dynamic edit routes: /admin/category/[id]/edit or /admin/product/[id]/edit
    const editMatch = pathname.match(/^\/admin\/(category|product)\/[^/]+\/edit$/);
    if (editMatch) {
      const resourceType = editMatch[1]; // 'category' or 'product'
      const resourceLabel = resourceType === 'category' ? 'Category' : 'Product';
      
      // Build breadcrumb manually for edit pages
      return [
        {
          title: resourceLabel,
          href: `/admin/${resourceType}`,
        },
        {
          title: `Edit ${resourceLabel}`,
          href: pathname,
        },
      ];
    }
    
    // Return empty if no match found
    return [];
  }

  // Build breadcrumb trail for matched routes
  const items = [];
  while (current) {
    items.unshift({
      title: current.label,
      href: current.path,
    });
    current = current.parent ? map.get(current.parent) : undefined;
  }

  return items;
};
