import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "./ui/sheet";
import Sidenav from "./sidenav";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="mx-8 flex h-28 items-center justify-between">
      <div className="flex gap-4">
        <div className="block lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col pt-0">
              <Link href="/" className="flex min-h-28 items-center gap-4">
                <Image
                  src="/favicon.webp"
                  alt="Stella Admin logo"
                  width={64}
                  height={64}
                />
                <span className="text-2xl font-bold">Stella Admin</span>
              </Link>
              <Sidenav />
            </SheetContent>
          </Sheet>
        </div>
        <Link href="/" className="hidden items-center gap-4 lg:flex">
          <Image
            src="/favicon.webp"
            alt="Stella Admin logo"
            width={64}
            height={64}
          />
          <span className="text-2xl font-bold">Stella Admin</span>
        </Link>
      </div>
      <Button asChild>
        <a href="/api/auth/logout">Log Out</a>
      </Button>
    </nav>
  );
}
