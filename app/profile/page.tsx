"use client";
import logoFull from "@/assets/images/logo-full.svg";

import { Button, buttonVariants } from "@/components/ui/button";
import { Profile, useWeb5 } from "@/contexts/Web5Context";
import { cn, collapseDid, copyToClipboard } from "@/lib/utils";
import { ArrowLeft, Copy, CopyIcon } from "lucide-react";
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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/header";
import { protocolDefinition, schemas } from "@/lib/protocols";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();
  const router = useRouter();
  const { toast } = useToast();

  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (web5 && currentDid) {
        const { records: followingRecords } = await web5.dwn.records.query({
          message: {
            filter: {
              author: currentDid,

              protocol: protocolDefinition.protocol,
              protocolPath: "following",
              schema: schemas.following,
            },
          },
        });

        const { records: followerRecords } = await web5.dwn.records.query({
          from: currentDid,
          message: {
            filter: {
              recipient: currentDid,
              protocol: protocolDefinition.protocol,
              protocolPath: "following",
              schema: schemas.following,
            },
          },
        });

        if (followingRecords) {
          setFollowing(
            Array.from(
              new Set(
                followingRecords
                  .filter((record) => record.recipient)
                  .map((record) => record.recipient)
              )
            )
          );
        }

        if (followerRecords) {
          setFollowers(
            Array.from(
              new Set(
                followerRecords
                  .filter((record) => record.author)
                  .map((record) => record.author)
              )
            )
          );
        }
      }
    })();
  }, [web5, currentDid]);

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-3xl font-semibold text-center mb-4">
          Your Profile
        </h1>
        <section className="mb-12 pb-4 border-b border-border">
          {profile && currentDid ? (
            <div>
              <div className="flex justify-between">
                <h2 className="text-2xl font-semibold">{profile.fullName}</h2>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    const res = await copyToClipboard(currentDid);
                    if (res) {
                      toast({
                        title: "Copied DID to Clipboard.",
                        description:
                          "Succesfully copied your DID to clipboard.",
                      });
                    } else {
                      console.log("NOT");
                    }
                  }}
                >
                  <CopyIcon size={14} /> {collapseDid(currentDid, 10)}
                </Button>
              </div>
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
          <Tabs defaultValue="following" className="">
            <TabsList>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
            </TabsList>
            <TabsContent value="following">
              <div className="text-muted-foreground">People you follow.</div>
              <ul>
                {following.map((did) => (
                  <li
                    key={did}
                    className="p-4 hover:bg-muted border-b border-border flex justify-between items-center"
                  >
                    <div>{collapseDid(did, 10)}</div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        const res = await copyToClipboard(did);

                        if (res) {
                          toast({ title: "Copied to clipboard." });
                        }
                      }}
                    >
                      <CopyIcon />
                    </Button>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="followers">
              <div className="text-muted-foreground">
                People who follow you.
              </div>
              <ul>
                {followers.map((did) => (
                  <li
                    key={did}
                    className="p-4 hover:bg-muted border-b border-border flex justify-between items-center"
                  >
                    <div>{collapseDid(did, 10)}</div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        const res = await copyToClipboard(did);

                        if (res) {
                          toast({ title: "Copied to clipboard." });
                        }
                      }}
                    >
                      <CopyIcon />
                    </Button>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
