"use client";

import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { buildBreadcrumbs } from "@/utils/build-breadcrumbs";
import { ROUTES } from "@/constants/routes";

export const Breadcrumbs = () => {
  const pathname = usePathname();
  const items = buildBreadcrumbs(pathname);

  return (
    <Breadcrumb
      items={[
        {
          title: (
            <Link href={ROUTES.DASHBOARD}>
              <HomeOutlined />
            </Link>
          ),
        },
        ...items.map((item) => ({
          title: item.href ? (
            <Link href={item.href}>{item.title}</Link>
          ) : (
            item.title
          ),
        })),
      ]}
      style={{ marginBottom: 16 }}
    />
  );
};
