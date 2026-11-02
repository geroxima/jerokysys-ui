"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { sidebarSections, type SidebarItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, item: SidebarItem) {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="px-5 pt-6 pb-7">
        <Link
          href="/dash"
          aria-label="JerokySys — Inicio"
          className="inline-flex"
        >
          <Image
            src="/jerokysys-logo.svg"
            alt="JerokySys"
            width={130}
            height={23}
            priority
            unoptimized
          />
        </Link>
      </div>

      <nav
        aria-label="Navegación principal"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-6"
      >
        {sidebarSections.map((section, index) => (
          <div key={section.label ?? `section-${index}`}>
            {section.label ? (
              <h2 className="mb-2 px-2.5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                {section.label}
              </h2>
            ) : null}

            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-foreground/80 hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon
                        className="size-4 shrink-0"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
