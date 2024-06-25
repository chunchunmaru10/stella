"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Sidenav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/characters",
      text: "Characters",
    },
    {
      href: "/sets",
      text: "Relic Sets",
    },
    {
      href: "/stats",
      text: "Stats",
    },
    {
      href: "/rarities",
      text: "Rarities",
    },
    {
      href: "/announcements",
      text: "Announcements",
    },
  ];

  return (
    <div className="flex h-full w-full max-w-full flex-col gap-4 lg:w-80 lg:pr-8">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            href={link.href}
            key={link.href}
            className={`${isActive ? "bg-primary font-semibold text-background" : ""} rounded-md p-2 px-4`}
          >
            {link.text}
          </Link>
        );
      })}
    </div>
  );
}
