"use client";
import dots from "@/assets/images/dots.svg";

import Image from "next/image";
import logoFull from "@/assets/images/logo-full.svg";
import logoFullDark from "@/assets/images/logo-full-dark.svg";
import profileSS from "@/assets/images/demo/profile.png";
import postsSS from "@/assets/images/demo/posts.png";
import connectSS from "@/assets/images/demo/connect.png";
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
          <div className="max-w-5xl mx-auto container flex flex-col md:flex-row py-8 md:py-28 gap-4 md:gap-0">
            <div className="px-4 bg-contain bg-no-repeat bg-right md:w-6/12 space-y-4 text-center md:text-left order-2 md:order-1">
              <h1 className="text-2xl md:text-4xl font-bold">
                Connecting Through Decentralization
              </h1>
              <p className="md:text-xl font-medium tracking-tighter text-secondary-foreground">
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
              // style={{ backgroundImage: `url('${hero.src}')` }}
              className="md:w-1/2 w-full order-1 md:order-2 flex items-center justify-center"
            >
              <Image src={hero} className="w-full" alt="hero" />
            </div>
          </div>
        </section>
        <section
          className="pt-16 pb-48 bg-[#FFEC19] bg-[length:250px] bg-bottom bg-repeat-x relative"
          style={{ backgroundImage: `url('${dots.src}')` }}
        >
          <div className="max-w-5xl mx-auto container">
            <div className="text-center">
              <h2 className="font-bold text-2xl md:text-3xl">
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
            <div className="flex flex-col gap-2 text-center md:text-xl tracking-tight">
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
              <h2 className="font-bold text-2xl md:text-3xl">Features</h2>
              <p className="text-lg font-light">Take Advantage of Web 5.0</p>
            </div>
            <div className="mt-8 space-y-16">
              <div className="flex flex-col md:flex-row items-center">
                <Image
                  src={profileSS}
                  className="w-full md:h-96 md:w-auto"
                  alt="profile page"
                />
                <div className="p-4 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">
                    Your Own Private Profile
                  </h3>
                  <p className="md:text-xl tracking-tight font-light mb-4">
                    Using Web 5.0 technologies, you&apos;ll be able to{" "}
                    <span className="font-semibold">own</span> your profile.
                    Unless you chose otherwise, you will be the only one able to
                    see your data.
                  </p>
                  <Link href="/profile" className={cn(buttonVariants())}>
                    Go to Profile
                  </Link>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center bg-[#FFEC19] p-8 rounded-md">
                <div className="pr-2 text-center md:text-left order-2 md:order-1">
                  <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">
                    Connect with People
                  </h3>
                  <p className="md:text-xl tracking-tight font-light mb-4">
                    Follow and get followed.{" "}
                    <span className="font-semibold">Selectively</span> pick and
                    choose what part of your private profile to share and with
                    whom to share it with.
                  </p>
                  <Link href="/connect" className={cn(buttonVariants())}>
                    Start Connecting
                  </Link>
                </div>
                <Image
                  src={connectSS}
                  className="w-full md:h-96 md:w-auto order-1 md:order-2"
                  alt="connect page"
                />
              </div>
              <div className="flex flex-col md:flex-row items-center">
                <Image
                  src={postsSS}
                  className="w-full md:h-96 md:w-auto"
                  alt="profile page"
                />
                <div className="p-4 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">
                    Selective Posting
                  </h3>
                  <p className="md:text-xl tracking-tight font-light mb-4">
                    Instead of posting into some centralized database, own your
                    posts and send them to{" "}
                    <span className="font-semibold">specific</span> recipients
                    of your choosing. <span className="font-semibold">You</span>{" "}
                    decide who sees your posts.
                  </p>
                  <Link href="/posts" className={cn(buttonVariants())}>
                    Go to Posts
                  </Link>
                </div>
              </div>
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
              Ansell Maximilian · &copy;2024
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
