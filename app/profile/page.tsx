"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { useWeb5 } from "@/contexts/Web5Context";
import { calculateAge, cn, collapseDid, copyToClipboard } from "@/lib/utils";
import {
  Cake,
  Copy,
  CopyIcon,
  LampDesk,
  Loader2,
  MapPin,
  MoreHorizontal,
  Pencil,
  User,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/header";
import { protocolDefinition, schemas } from "@/lib/protocols";
import { useToast } from "@/components/ui/use-toast";
import { Follower, Following, SharedProfile } from "@/lib/types";
import dwnService from "@/services/dwnService";

export default function ProfilePage() {
  const { currentDid, web5, profile, loading: profileLoading } = useWeb5();
  const router = useRouter();
  const { toast } = useToast();

  const [following, setFollowing] = useState<Following[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);

  const [connectionLoading, setConnectionLoading] = useState(false);

  useEffect(() => {
    if (!profile && !profileLoading) router.push("/profile/create");
  }, [router, profile, profileLoading]);

  useEffect(() => {
    (async () => {
      if (web5 && currentDid) {
        setConnectionLoading(true);

        const dwn = dwnService(web5);

        const following = await dwn.getFollowing(currentDid);
        if (following) {
          setFollowing(following);
        }

        const followers = await dwn.getFollowers(currentDid);
        if (followers) {
          setFollowers(followers);
        }

        setConnectionLoading(false);
      }
    })();
  }, [web5, currentDid]);

  console.log({ followers });

  const handleUnfollow = async (recordId: string, did: string) => {
    if (web5) {
      const dwn = dwnService(web5);
      const res = await dwn.unfollow(recordId, did);

      if (res) {
        toast({ title: "Successfully Unfollowed" });
        setFollowing((prev) =>
          prev.filter((data) => data.recordId !== recordId)
        );
      }
    }
  };

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
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {profile.fullName},{" "}
                      {calculateAge(new Date(), new Date(profile.dateOfBirth))}
                    </h2>
                    <Link
                      href="/profile"
                      className="text-sm hover:underline"
                    >{`@${profile.username}`}</Link>
                  </div>

                  <div className="flex gap-1">
                    <Link
                      href="/profile/edit"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "icon" }),
                        "rounded-full"
                      )}
                    >
                      <Pencil size={16} />
                    </Link>
                    <Button
                      variant="outline"
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
                      className="flex gap-1 rounded-full"
                    >
                      <CopyIcon size={14} />{" "}
                      <span>{collapseDid(currentDid, 10)}</span>
                    </Button>
                  </div>
                </div>
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
        <section className="pb-8">
          <Tabs defaultValue="following" className="">
            <TabsList>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
            </TabsList>
            <TabsContent value="following">
              <div className="text-muted-foreground mb-2">
                People you follow.
              </div>
              {connectionLoading ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              ) : following.length > 0 ? (
                <ul>
                  {following.map((followingData) => (
                    <li
                      key={followingData.recordId}
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
                              <button
                                className="flex gap-1 items-center"
                                onClick={() =>
                                  handleUnfollow(
                                    followingData.recordId,
                                    followingData.did
                                  )
                                }
                              >
                                <X size={14} /> <span>Unfollow</span>
                              </button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center px-4 py-8 bg-accent rounded-md">
                  Go to the{" "}
                  <Link href="/connect" className="font-medium hover:underline">
                    connect page
                  </Link>{" "}
                  to start following users.
                </div>
              )}
            </TabsContent>
            <TabsContent value="followers">
              <div className="text-muted-foreground mb-2">
                People who follow you.
              </div>
              {connectionLoading ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="text-[#FFEC19]" />
                </div>
              ) : followers.length > 0 ? (
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
              ) : (
                <div className="text-center px-4 py-8 bg-accent rounded-md">
                  People who have followed you will show up here. Share your{" "}
                  <button
                    className="font-medium hover:underline"
                    onClick={async () => {
                      if (currentDid) {
                        const res = await copyToClipboard(currentDid);
                        if (res) toast({ title: "DID copied." });
                      }
                    }}
                  >
                    DID
                  </button>{" "}
                  to start getting followers.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
