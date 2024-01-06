"use client";
import dots from "@/assets/images/dots.svg";

import Image from "next/image";
import logoFull from "@/assets/images/logo-full.svg";
import logoFullDark from "@/assets/images/logo-full-dark.svg";
import bg from "@/assets/images/bg.png";
import hero from "@/assets/images/hero-big.svg";
import hero2 from "@/assets/images/hero2.svg";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useWeb5 } from "@/contexts/Web5Context";
import { cn } from "@/lib/utils";

export default function Home() {
  const { currentDid, profile, loading } = useWeb5();
  return (
    <div>
      <header>
        <nav className="p-4 flex justify-between">
          <Link href="/">
            <Image src={logoFull} alt="Full Logo" className="w-64" />
          </Link>
          <ul>
            <li>
              {loading ? (
                <Button disabled>Loading</Button>
              ) : (
                <Link
                  className={cn(buttonVariants({}))}
                  href={profile ? "/profile" : "/profile/create"}
                >
                  {profile ? "Profile" : "Create Profile"}
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <section
          className="flex"
          style={{ backgroundImage: `url('${bg.src}')` }}
        >
          <div className="max-w-5xl mx-auto container flex">
            <div className="py-28 px-4 bg-contain bg-no-repeat bg-right w-6/12 space-y-4">
              <h1 className="text-4xl font-bold">
                Connecting Through Decentralization
              </h1>
              <p className=" text-xl font-medium tracking-tighter text-secondary-foreground">
                Utilize the brand new Web 5.0 to revolutionize your online
                social media game! Unlock the full potential of the new era of
                the internet to protect your privacy and own your data.
              </p>
              {loading ? (
                <Button disabled>Loading</Button>
              ) : (
                <Link
                  className={cn(buttonVariants({}))}
                  href={profile ? "/profile" : "/profile/create"}
                >
                  Get Started
                </Link>
              )}
            </div>
            <div
              style={{ backgroundImage: `url('${hero.src}')` }}
              className="grow bg-no-repeat bg-right bg-contain"
            ></div>
          </div>
        </section>
        <section
          className="pt-16 pb-48 bg-[#FFEC19] bg-[length:250px] bg-bottom bg-repeat-x relative"
          style={{ backgroundImage: `url('${dots.src}')` }}
        >
          <div className="max-w-5xl mx-auto container">
            <div className="text-center">
              <h2 className="font-bold text-3xl">
                What&apos;s Cryptic Hearts?
              </h2>
              <p className="text-lg font-light">
                Decentralized Social Media Platform
              </p>
            </div>
            <div className="flex justify-center my-8">
              <Image
                src={hero2}
                alt="Hero 2"
                width={200}
                height={100}
                className="w-[300px]"
              />
            </div>
            <div className="flex flex-col gap-2 text-center text-xl tracking-tight">
              <p>
                Cryptic Hearts is a revolutionary social media platform built on
                top of the brand new{" "}
                <a
                  className="font-medium hover:underline"
                  target="_blank"
                  href="https://developer.tbd.website/"
                >
                  Web 5.0
                </a>
                . In a digital landscape where your data is often controlled by
                a company, Cryptic Hearts puts the power back into your hands.
                Decide exactly what to share and with whom.
              </p>
              <p>
                Cryptic Hearts is your haven for self-owned identity. Imagine a
                world where you decide what to share, when, and with whom. No
                more data captivity, no more compromise. Here, you are in
                control.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-5xl mx-auto container">
            <div className="text-center">
              <h2 className="font-bold text-3xl">Features</h2>
              <p className="text-lg font-light">
                Decentralized Social Media Platform
              </p>
            </div>
            <div className="mt-8">
              <div>Selective profile sharing</div>
              <div>Follow/Unfollow</div>
              <div>Post</div>
            </div>
          </div>
        </section>
        <footer className="bg-black text-primary-foreground">
          <div className="container max-w-6xl py-4 mx-auto">
            <Link href="/">
              <Image
                src={logoFullDark}
                alt="app logo"
                className="w-[100px] md:w-[200px]"
              />
            </Link>
            <div className="text-[12px] md:text-sm text-center mt-2">
              Ansell Maximilian · &copy;2023
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
