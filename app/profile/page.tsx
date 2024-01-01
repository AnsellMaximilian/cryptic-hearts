"use client";
import logoFull from "@/assets/images/logo-full.svg";

import { Button, buttonVariants } from "@/components/ui/button";
import { Profile, useWeb5 } from "@/contexts/Web5Context";
import { calculateAge, cn, collapseDid, copyToClipboard } from "@/lib/utils";
import {
  ArrowLeft,
  Cake,
  Copy,
  CopyIcon,
  LampDesk,
  Loader2,
  MapIcon,
  MapPin,
  MoreHorizontal,
  User,
  X,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/header";
import { protocolDefinition, schemas } from "@/lib/protocols";
import { useToast } from "@/components/ui/use-toast";
import { Follower, Following, SharedProfile } from "@/lib/types";

export default function ProfilePage() {
  const {
    currentDid,
    web5,
    setProfile,
    profile,
    loading: profileLoading,
  } = useWeb5();
  const router = useRouter();
  const { toast } = useToast();

  const [following, setFollowing] = useState<Following[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);

  const [connectionLoading, setConnectionLoading] = useState(false);
  useEffect(() => {
    (async () => {
      if (web5 && currentDid) {
        setConnectionLoading(true);
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
          const following = (await Promise.all(
            followingRecords.map((record) => record.data.json())
          )) as Following[];
          setFollowing(following);
        }

        if (followerRecords) {
          const followers: Follower[] = await Promise.all<Follower>(
            followerRecords.map((record) => {
              return new Promise(async (resolve) => {
                const { records: sharedProfileRecords } =
                  await web5.dwn.records.query({
                    from: currentDid,
                    message: {
                      filter: {
                        recipient: currentDid,
                        parentId: record.id,
                        protocol: protocolDefinition.protocol,
                        protocolPath: "following/sharedProfile",
                        schema: schemas.sharedProfile,
                      },
                    },
                  });
                if (sharedProfileRecords?.length) {
                  const sharedProfile: SharedProfile =
                    await sharedProfileRecords[0].data.json();
                  resolve({ did: record.author, sharedProfile });
                } else {
                  resolve({ did: record.author });
                }
              });
            })
          );
          setFollowers(followers);
        }

        setConnectionLoading(false);
      }
    })();
  }, [web5, currentDid]);

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <h1 className="text-3xl font-semibold text-center mb-4">
          Your Profile
        </h1>
        <section className="mb-12 pb-4 border-b border-border">
          {profile && currentDid ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <h2 className="text-2xl font-semibold">
                    {profile.fullName},{" "}
                    {calculateAge(new Date(), new Date(profile.dateOfBirth))}
                  </h2>
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
              <ul className="">
                <li className="flex gap-1 items-center text-sm">
                  <MapPin size={16} />{" "}
                  <span className="text-muted-foreground">
                    {profile.city}, {profile.country}
                  </span>
                </li>
                <li className="flex gap-1 items-center text-sm">
                  <LampDesk size={16} />{" "}
                  <span className="text-muted-foreground">
                    {profile.occupation}
                  </span>
                </li>
                <li className="flex gap-1 items-center text-sm">
                  <Cake size={16} />{" "}
                  <span className="text-muted-foreground">
                    {format(new Date(profile.dateOfBirth), "dd MMM, yyyy")}
                  </span>
                </li>
              </ul>
              <div>
                <h3 className="font-semibold text-lg">About Me</h3>
                <p className="text-muted-foreground">{profile.description}</p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-24 flex justify-center gap-4">
              <div>Loading profile...</div>
              <Loader2 size={24} className="animate-spin" />
            </div>
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
              {connectionLoading ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                <ul>
                  {following.map((followingData) => (
                    <li
                      key={followingData.did}
                      className="p-4 hover:bg-accent border-b border-border flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm font-semibold">
                          {followingData.assignedName}
                        </div>
                        <div>{collapseDid(followingData.did, 10)}</div>
                      </div>

                      <div className="flex gap-4 items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="hover:bg-white"
                              variant="ghost"
                              size="icon"
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <button
                                onClick={async () => {
                                  const res = await copyToClipboard(
                                    followingData.did
                                  );

                                  if (res) {
                                    toast({ title: "Copied to clipboard." });
                                  }
                                }}
                                className="flex gap-1 items-center"
                              >
                                <Copy size={14} /> <span>Copy DID</span>
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href={`/connect/${followingData.did}`}
                                className="flex gap-1 items-center"
                              >
                                <User size={14} /> <span>Shared Profile</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <button className="flex gap-1 items-center">
                                <X size={14} /> <span>Unfollow</span>
                              </button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            <TabsContent value="followers">
              <div className="text-muted-foreground">
                People who follow you.
              </div>
              {connectionLoading ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="text-[#FFEC19]" />
                </div>
              ) : (
                <ul>
                  {followers.map((follower) => (
                    <li
                      key={follower.did}
                      className="p-4 hover:bg-muted border-b border-border flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm font-semibold">
                          {follower.sharedProfile?.username ?? "Anonymous"}
                        </div>
                        <div>{collapseDid(follower.did, 10)}</div>
                      </div>

                      <div className="flex gap-4 items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="hover:bg-white"
                              variant="ghost"
                              size="icon"
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <button
                                onClick={async () => {
                                  const res = await copyToClipboard(
                                    follower.did
                                  );

                                  if (res) {
                                    toast({ title: "Copied to clipboard." });
                                  }
                                }}
                                className="flex gap-1 items-center"
                              >
                                <Copy size={14} /> <span>Copy DID</span>
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href={`/connect/${follower.did}`}
                                className="flex gap-1 items-center"
                              >
                                <User size={14} /> <span>Shared Profile</span>
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
