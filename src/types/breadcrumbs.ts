export interface BreadcrumbItem {
  title: React.ReactNode;
  href?: string;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}
