"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Profile, useWeb5 } from "@/contexts/Web5Context";
import { cn, collapseDid } from "@/lib/utils";
import { ArrowLeft, Copy, UsersRound } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Link from "next/link";
import { useEffect, useState } from "react";
import { protocolDefinition, schemas } from "@/lib/protocols";
import { useRouter } from "next/navigation";
import ProfileForm, { profileFormSchema } from "@/components/profile-form";
import { useToast } from "@/components/ui/use-toast";
import { Following, SharedProfile } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfileEditPage() {
  const {
    currentDid,
    web5,
    setProfile,
    profile,
    loading: profileLoading,
  } = useWeb5();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [following, setFollowing] = useState<Following[]>([]);
  const [selectedDids, setSelectedDids] = useState<string[]>([]);

  useEffect(() => {
    if (!profile && !profileLoading) router.push("/profile/create");
  }, [profile, router, profileLoading]);
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

        if (followingRecords) {
          const followers: Following[] = await Promise.all<Following>(
            followingRecords.map((record) => {
              return new Promise(async (resolve) => {
                const followingData: Omit<Following, "sharedProfile"> = {
                  ...(await record.data.json()),
                  recordId: record.id,
                };
                const { records: sharedProfileRecords } =
                  await web5.dwn.records.query({
                    from: followingData.did,
                    message: {
                      filter: {
                        recipient: followingData.did,
                        parentId: record.id,
                        protocol: protocolDefinition.protocol,
                        protocolPath: "following/sharedProfile",
                        schema: schemas.sharedProfile,
                      },
                    },
                  });
                if (sharedProfileRecords?.length) {
                  const sharedProfile: SharedProfile = {
                    ...(await sharedProfileRecords[0].data.json()),
                    recordId: sharedProfileRecords[0].id,
                    contextId: sharedProfileRecords[0].contextId,
                  };
                  resolve({ ...followingData, sharedProfile });
                } else {
                  resolve({ ...followingData });
                }
              });
            })
          );
          setFollowing(followers);
        }
      }
    })();
  }, [web5, currentDid]);

  console.log({ following });

  async function handleSubmit(values: z.infer<typeof profileFormSchema>) {
    if (web5 && profile) {
      let profileData: Omit<Profile, "recordId" | "contextId">;
      setIsUpdating(true);
      let { record: profileRecord, status } = await web5.dwn.records.read({
        message: {
          filter: {
            recordId: profile.recordId,
            protocol: protocolDefinition.protocol,
            protocolPath: "profile",
            schema: schemas.profile,
          },
        },
      });

      if (profileRecord) {
        profileData = {
          username: values.username,
          fullName: values.fullName,
          gender: values.gender,
          city: values.city,
          country: values.country,
          occupation: values.occupation,
          description: values.description,
          dateOfBirth: values.dateOfBirth
            ? format(values.dateOfBirth, "yyyy-MM-dd")
            : values.dateOfBirth,
        };
        const { status: localStatus } = await profileRecord.update({
          data: profileData,
        });
        console.log({ localStatus });
        if (status.code >= 200 && status.code < 300) {
          setProfile({
            ...profile,
            ...profileData,
          });
          toast({ title: "Updated profile" });
          // router.push("/profile");
        } else {
          toast({ title: "Error updating profile." });
        }
      }

      // broadcast change
      const broadcastChanges = await Promise.all<boolean>(
        following
          .filter((followingData) => selectedDids.includes(followingData.did))
          .map(
            (followingData) =>
              new Promise(async (resolve) => {
                if (followingData.sharedProfile) {
                  const { record: profileRecord, status: readRemoteStatus } =
                    await web5.dwn.records.read({
                      message: {
                        filter: {
                          parentId: followingData.recordId,
                          contextId: followingData.contextId,
                          recordId: followingData.sharedProfile.recordId,
                          protocol: protocolDefinition.protocol,
                          protocolPath: "following/sharedProfile",
                          schema: schemas.sharedProfile,
                        },
                      },
                    });
                  console.log("READ REMOTE");
                  console.log({ readRemoteStatus });
                  if (profileRecord) {
                    const newSharedProfile: {
                      [key: string]: string | undefined;
                    } = {};
                    for (const key in followingData.sharedProfile) {
                      const safeKey = key as keyof Omit<
                        Profile,
                        "recordId" | "contextId"
                      >;
                      newSharedProfile[safeKey] = profileData[safeKey];
                    }
                    console.log({ newSharedProfile });
                    const { status: updateStatus } = await profileRecord.update(
                      {
                        data: newSharedProfile,
                      }
                    );
                    console.log({ updateStatus });
                    if (updateStatus.code >= 200 && updateStatus.code < 300) {
                      const { status: sendStatus } = await profileRecord.send(
                        followingData.did
                      );
                      console.log({ sendStatus });
                      resolve(true);
                    }
                  }
                }
                resolve(false);
              })
          )
      );

      console.log(broadcastChanges);

      setIsUpdating(false);
    }
  }

  return (
    <div
      className="bg-[#FFEC19] grow bg-[length:600px] bg-bottom bg-repeat-x relative"
      style={{ backgroundImage: `url('${dots.src}')` }}
    >
      <Link
        href="/"
        className={cn(buttonVariants({}), "absolute left-8 top-8")}
      >
        <ArrowLeft />
      </Link>
      <div className="p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Edit Your Profile</h1>
          <div className="font-semibold">
            <span>
              Your DID:{" "}
              {currentDid ? collapseDid(currentDid, 10) : "Loading..."}
            </span>
            <Button variant="ghost" size="icon">
              <Copy />
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-3xl bg-white p-8 rounded-md shadow-md">
          <ProfileForm
            onSubmit={handleSubmit}
            profile={profile ?? undefined}
            loading={isUpdating}
            shareButton={
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex gap-1"
                  >
                    <UsersRound size={16} />
                    <span>Share</span>
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full block w-4 h-4 text-xs">
                      {selectedDids.length}
                    </span>
                  </Button>
                </DialogTrigger>
                {profile && (
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Broadcast the Update</DialogTitle>
                      <DialogDescription>
                        Choose which users you follow should receive this
                        update.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {following.map((followingData) => (
                        <div
                          key={followingData.did}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              id={followingData.did}
                              checked={selectedDids.includes(followingData.did)}
                              onCheckedChange={(checked) => {
                                setSelectedDids((prev) =>
                                  checked
                                    ? [...prev, followingData.did]
                                    : prev.filter(
                                        (existingKey) =>
                                          existingKey !== followingData.did
                                      )
                                );
                              }}
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor={followingData.did}
                            className="font-normal flex flex-col"
                          >
                            <span className="font-semibold">
                              {followingData.assignedName}
                            </span>
                            <span> {collapseDid(followingData.did)}</span>
                          </FormLabel>
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="submit">Set</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                )}
              </Dialog>
            }
          />
        </div>
      </div>
    </div>
  );
}
