"use client";

import Image from "next/image";
import logoFull from "@/assets/images/logo-full.svg";
import bg from "@/assets/images/bg.png";
import hero from "@/assets/images/hero-big.svg";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useWeb5 } from "@/contexts/Web5Context";
import { cn } from "@/lib/utils";

export default function Home() {
  const { currentDid, profile } = useWeb5();
  return (
    <div>
      <header>
        <nav className="p-4 flex justify-between">
          <Link href="/">
            <Image src={logoFull} alt="Full Logo" className="w-64" />
          </Link>
          <ul>
            <li>
              <Link
                className={cn(buttonVariants())}
                href={profile ? "/profile" : "/profile/create"}
              >
                {profile ? "Profile" : "Create Profile"}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <section
          className="flex"
          style={{ backgroundImage: `url('${bg.src}')` }}
        >
          <div className="py-32 px-4 bg-contain bg-no-repeat bg-right w-7/12 space-y-4">
            <h1 className="text-4xl font-bold">
              Connecting Through Decentralization
            </h1>
            <p className=" text-xl font-semibold">
              Utilize the brand new Web 5.0 to step up your online dating!
              Unlock the full potential of the new era of the internet to spice
              up your love life.
            </p>
            <Button>Get Started</Button>
          </div>
          <div
            style={{ backgroundImage: `url('${hero.src}')` }}
            className="grow bg-no-repeat bg-right bg-contain"
          ></div>
        </section>
        <section className="py-24 bg-[#FFEC19] bg-gradient-to-b from-[#FFEC19] via-[#FFEC19] to-white ">
          <h2>Features</h2>
        </section>
        <section className="py-12"></section>
        <footer className="bg-black py-12"></footer>
      </main>
    </div>
  );
}
