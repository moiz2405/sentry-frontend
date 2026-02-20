import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React, { useEffect, useState } from "react"
import { backendAPI } from "@/lib/api/backend-api"

export function SiteHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [appName, setAppName] = useState<string | undefined>(undefined);

  useEffect(() => {
    // If route is /my-app/[appId], fetch app data
    if (segments[0] === "my-app" && segments[1]) {
      backendAPI
        .getApp(segments[1])
        .then((data: any) => setAppName(data?.name))
        .catch(() => setAppName(undefined));
    }
  }, [pathname, segments]);

  const crumbs = [
    { name: "Home", href: "/" },
    ...segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      // If segment is an appId and appName is available, use appName
      if (appName && segments[0] === "my-app" && idx === 1) {
        return { name: appName, href };
      }
      return { name: seg.charAt(0).toUpperCase() + seg.slice(1), href };
    })
  ];

  return (
    <header className="flex shrink-0 items-center gap-2 border-b transition-[width,height] h-16 bg-[oklch(0.205_0_0)] px-0">
      <div className="flex items-center w-full gap-2 px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList className="gap-2">
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href + '-' + idx}>
                <BreadcrumbItem>
                  {idx < crumbs.length - 1 ? (
                    <BreadcrumbLink asChild className="text-base font-medium transition text-zinc-300 hover:text-white">
                      <Link href={crumb.href}>{crumb.name}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-lg font-bold text-white drop-shadow-sm">{crumb.name}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {idx < crumbs.length - 1 && <BreadcrumbSeparator key={crumb.href + '-sep'} />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2 ml-auto"></div>
      </div>
    </header>
  );
}
