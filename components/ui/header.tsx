import Image from "next/image";
import Link, { LinkProps } from "next/link";
import React, { PropsWithChildren } from "react";
import logoFull from "@/assets/images/logo-full.svg";
import { cn } from "@/lib/utils";
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
}: PropsWithChildren<HeaderLinkProps>) => {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "font-semibold relative group hover:scale-105 block"
          //   "hover:before:content-['>'] before:absolute before:-left-4 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500"
        )}
      >
        <span className="opacity-0 group-hover:opacity-100 transition-all duration-100 absolute -translate-x-4 text-[#DEE100]">
          &#9829;
        </span>
        {children ?? text}
      </Link>
    </li>
  );
};

export default function Header() {
  return (
    <header className="border-b border-border shadow-sm">
      <nav className="p-4 flex justify-between items-center">
        <Link href="/">
          <Image src={logoFull} alt="Full Logo" className="w-64" />
        </Link>
        <ul className="flex gap-8 items-center">
          <HeaderLink href="/profile" text="Profile" />
          <HeaderLink href="/profile" text="Connect" />
          <HeaderLink href="/profile" text="Posts" />
        </ul>
      </nav>
    </header>
  );
}
