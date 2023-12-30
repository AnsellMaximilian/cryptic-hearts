"use client";
import logoFull from "@/assets/images/logo-full.svg";

import { Button, buttonVariants } from "@/components/ui/button";
import { Profile, useWeb5 } from "@/contexts/Web5Context";
import {
  calculateAge,
  camelCaseToSeparatedWords,
  cn,
  collapseDid,
  copyToClipboard,
} from "@/lib/utils";
import {
  ArrowLeft,
  Cake,
  Copy,
  CopyIcon,
  LampDesk,
  MapIcon,
  MapPin,
  MoreHorizontal,
  User,
  UserRoundCheck,
  UserRoundX,
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
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/header";
import { protocolDefinition, schemas } from "@/lib/protocols";
import { useToast } from "@/components/ui/use-toast";
import { Follower, Following, SharedProfile } from "@/lib/types";

export default function ConnectionPage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();

  const { did } = useParams();

  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [following, setFollowing] = useState<Following | null>(null);
  const [follower, setFollower] = useState<Follower | null>(null);

  const [didResolved, setDidResolved] = useState(false);

  useEffect(() => {
    (async () => {
      if (web5 && currentDid) {
        const resolveRes = await web5.did.resolve(
          decodeURIComponent(did as string)
        );
        setDidResolved(!!resolveRes.didDocument);

        if (!!!resolveRes.didDocument) {
          setIsLoading(false);
          return;
        }
        // User follows this person
        const { records: followingRecords } = await web5.dwn.records.query({
          message: {
            filter: {
              author: currentDid,
              protocol: protocolDefinition.protocol,
              protocolPath: "following",
              schema: schemas.following,
              recipient: decodeURIComponent(did as string),
            },
          },
        });
        if (followingRecords?.length) {
          const { records: sharedProfileRecords } =
            await web5.dwn.records.query({
              message: {
                filter: {
                  author: currentDid,
                  recipient: decodeURIComponent(did as string),
                  parentId: followingRecords[0].id,
                  protocol: protocolDefinition.protocol,
                  protocolPath: "following/sharedProfile",
                  schema: schemas.sharedProfile,
                },
              },
            });
          if (sharedProfileRecords?.length) {
            const sharedProfile: SharedProfile =
              await sharedProfileRecords[0].data.json();

            setFollowing({
              ...(await followingRecords[0].data.json()),
              sharedProfile,
            });
          }
        }

        // User is followed by this person
        const { records: followerRecords } = await web5.dwn.records.query({
          from: currentDid,
          message: {
            filter: {
              author: decodeURIComponent(did as string),
              recipient: currentDid,
              protocol: protocolDefinition.protocol,
              protocolPath: "following",
              schema: schemas.following,
            },
          },
        });

        if (followerRecords?.length) {
          // setFollowing(await followerRecords[0].data.json())

          const { records: sharedProfileRecords } =
            await web5.dwn.records.query({
              from: currentDid,
              message: {
                filter: {
                  recipient: currentDid,
                  parentId: followerRecords[0].id,
                  protocol: protocolDefinition.protocol,
                  protocolPath: "following/sharedProfile",
                  schema: schemas.sharedProfile,
                },
              },
            });
          if (sharedProfileRecords?.length) {
            const sharedProfile: SharedProfile =
              await sharedProfileRecords[0].data.json();
            setFollower({ did: followerRecords[0].author, sharedProfile });
          }
        }
        setIsLoading(false);
      }
    })();
  }, [web5, currentDid, profile, did]);

  const decodedDid = decodeURIComponent(did as string);

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <h1 className="text-3xl font-semibold text-center mb-4">Connection</h1>
        <section className="mb-12 pb-4">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div>
              {didResolved ? (
                <div>
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      className="flex gap-2"
                      onClick={async () => {
                        const res = await copyToClipboard(decodedDid);

                        if (res) {
                          toast({ title: "Copied DID." });
                        }
                      }}
                    >
                      <Copy />
                      <span>
                        {collapseDid(decodeURIComponent(did as string), 20)}
                      </span>
                    </Button>
                  </div>
                  <section className="border-b border-border py-8">
                    <h2 className="mb-4 text-xl font-bold flex gap-2">
                      {following ? (
                        <UserRoundCheck />
                      ) : (
                        <UserRoundX color="red" />
                      )}
                      <span>Following</span>
                    </h2>
                    {following ? (
                      <div>
                        <h3 className="text-lg font-semibold">
                          Your Shared Profile
                        </h3>
                        <p className="text-muted-foreground mb-8">
                          This is the subset profile you have chosen to share
                          with this person.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {profile &&
                            Object.keys(profile)
                              .filter(
                                (key) =>
                                  key !== "contextId" && key !== "recordId"
                              )
                              .map((key) => {
                                const safeKey = key as keyof SharedProfile;
                                return (
                                  <div key={key} className="flex gap-2">
                                    <div className="font-semibold">
                                      {camelCaseToSeparatedWords(key)}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {following.sharedProfile &&
                                      following.sharedProfile[safeKey] ? (
                                        <span>
                                          {following.sharedProfile[safeKey]}
                                        </span>
                                      ) : (
                                        <span className="text-destructive">
                                          Not shared
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold">
                          You do not follow this user.
                        </h3>
                        <p className="text-muted-foreground">
                          To share your profile, follow this user.
                        </p>
                      </div>
                    )}
                  </section>
                  <section className="py-8">
                    <h2 className="mb-4 text-xl font-bold flex gap-2">
                      {follower ? (
                        <UserRoundCheck />
                      ) : (
                        <UserRoundX color="red" />
                      )}
                      <span>Follower</span>
                    </h2>
                    {follower ? (
                      <div>
                        <h3 className="text-lg font-semibold">
                          User&apos; Shared Profile
                        </h3>
                        <p className="text-muted-foreground mb-8">
                          This is the subset profile this user has chosen to
                          share with you.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {follower.sharedProfile &&
                            profile &&
                            Object.keys(profile)
                              .filter(
                                (key) =>
                                  key !== "contextId" && key !== "recordId"
                              )
                              .map((key) => {
                                const safeKey = key as keyof SharedProfile;
                                return (
                                  <div key={key} className="flex gap-2">
                                    <div className="font-semibold">
                                      {camelCaseToSeparatedWords(key)}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {follower.sharedProfile &&
                                      follower.sharedProfile[safeKey] ? (
                                        <span>
                                          {follower.sharedProfile[safeKey]}
                                        </span>
                                      ) : (
                                        <span className="text-destructive">
                                          Not shared
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold">
                          This user does not folow you.
                        </h3>
                        <p className="text-muted-foreground">
                          To see their shared profile, this user needs to follow
                          you.
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                <div>DID could not be resolved</div>
              )}
            </div>
          )}
        </section>
        <section></section>
      </div>
    </div>
  );
}
