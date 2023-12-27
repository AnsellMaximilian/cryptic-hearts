"use client";
import logoFull from "@/assets/images/logo-full.svg";

import { Button, buttonVariants } from "@/components/ui/button";
import { Profile, useWeb5 } from "@/contexts/Web5Context";
import { cn, collapseDid } from "@/lib/utils";
import { ArrowLeft, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dots from "@/assets/images/dots.svg";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/header";
import { protocolDefinition } from "@/lib/protocols";

export default function ProfilePage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (web5 && currentDid) {
        const { records: profiles } = await web5.dwn.records.query({
          message: {
            filter: {
              protocol: protocolDefinition.protocol,
              protocolPath: "profile",
              author: currentDid,
              schema:
                "http://ansellmaximilian.github.io/crypticheartsprotocol/profile",
            },
          },
        });

        if (profiles?.length) {
          const profile: Profile = await profiles[0].data.json();
          setProfile(profile);
        } else {
          router.push("/profile/create");
        }
      }
    })();
  }, [web5, currentDid, router]);

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-3xl font-semibold text-center mb-4">
          Your Profile
        </h1>
        <section className="mb-12 pb-4 border-b border-border">
          {profile ? (
            <div>
              <h2 className="text-2xl font-semibold">{profile.fullName}</h2>
              <Link
                href="/profile"
                className="text-sm"
              >{`@${profile.username}`}</Link>
            </div>
          ) : (
            "loading..."
          )}
        </section>
        <section>
          <Tabs defaultValue="following" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
            </TabsList>
            <TabsContent value="following">
              <div className="text-muted-foreground">People you follow.</div>
            </TabsContent>
            <TabsContent value="followers">
              <div className="text-muted-foreground">
                People who follow you.
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
