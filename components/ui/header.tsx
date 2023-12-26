"use client";

import Image from "next/image";
import Link, { LinkProps } from "next/link";
import React, { PropsWithChildren } from "react";
import logoFull from "@/assets/images/logo-full.svg";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
type HeaderLinkProps = LinkProps & {
  className?: string;
  activeClass?: string;
  nonActiveClass?: string;
  text?: string;
};
const HeaderLink = ({
  children,
  href,
  text,
  className,
}: PropsWithChildren<HeaderLinkProps>) => {
  const currentRoute = usePathname();
  const isActive = new RegExp(`^${href}`).test(currentRoute);
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "font-semibold relative group hover:scale-105 block",
          className
        )}
      >
        <span
          className={`opacity-0 group-hover:opacity-100 transition-all duration-100 absolute -translate-x-4 text-[#DEE100] ${
            isActive && "opacity-100"
          }`}
        >
          &#9829;
        </span>
        {children ?? text}
      </Link>
    </li>
  );
};

export default function Header({ className }: { className?: string }) {
  return (
    <header className={cn("border-b border-border shadow-sm", className)}>
      <nav className="p-4 flex justify-between items-center">
        <Link href="/">
          <Image src={logoFull} alt="Full Logo" className="w-64" />
        </Link>
        <ul className="flex gap-8 items-center">
          <HeaderLink href="/profile" text="Profile" />
          <HeaderLink href="/connect" text="Connect" />
          <HeaderLink href="/profile" text="Posts" />
        </ul>
      </nav>
    </header>
  );
}
