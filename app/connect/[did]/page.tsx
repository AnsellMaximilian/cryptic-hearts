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
  MessagesSquare,
  MoreHorizontal,
  Send,
  SendHorizontal,
  User,
  UserRoundCheck,
  UserRoundX,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/header";
import { protocolDefinition, schemas } from "@/lib/protocols";
import { useToast } from "@/components/ui/use-toast";
import { Follower, Following, Message, SharedProfile } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Types } from "ably";
import { useChannel, useAbly } from "ably/react";

const formSchema = z.object({
  message: z.string().min(1, {
    message: "Message must be at least 1 characters.",
  }),
});

export default function ConnectionPage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();

  const { did } = useParams();
  const decodedDid = decodeURIComponent(did as string);

  const router = useRouter();
  const ablyClient = useAbly();

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [following, setFollowing] = useState<Following | null>(null);
  const [follower, setFollower] = useState<Follower | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [didResolved, setDidResolved] = useState(false);

  const chatChannel = useMemo(() => {
    const channelId = currentDid
      ? currentDid > decodedDid
        ? `${currentDid?.slice(0, 15)}-${decodedDid.slice(0, 15)}`
        : `${decodedDid.slice(0, 15)}-${currentDid?.slice(0, 15)}`
      : "";
    console.log({ channelId });
    return ablyClient.channels.get(`messages:${channelId}`);
  }, [currentDid, ablyClient, decodedDid]);

  useEffect(() => {
    const listener = (ablyMessage: Types.Message) => {
      if (ablyMessage.name === "add") {
        const message: Message = ablyMessage.data;
        setMessages((prev) => [...prev, message]);
      }
    };
    chatChannel.subscribe(listener);

    return () => {
      chatChannel.unsubscribe(listener);
    };
  }, [chatChannel]);

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

  useEffect(() => {
    (async () => {
      const decodedDid = decodeURIComponent(did as string);

      if (web5 && currentDid && didResolved) {
        const { records: sentMessagesRecords } = await web5.dwn.records.query({
          message: {
            filter: {
              author: currentDid,
              protocol: protocolDefinition.protocol,
              protocolPath: "message",
              schema: schemas.message,
              recipient: decodedDid,
            },
          },
        });
        const { records: receivedMessageRecords } =
          await web5.dwn.records.query({
            from: currentDid,
            message: {
              filter: {
                recipient: currentDid,
                protocol: protocolDefinition.protocol,
                protocolPath: "message",
                schema: schemas.message,
                author: decodedDid,
              },
            },
          });

        try {
          const messages = await Promise.all<Message>(
            [
              ...(sentMessagesRecords ?? []),
              ...(receivedMessageRecords ?? []),
            ].map(
              (record) =>
                new Promise(async (resolve) => {
                  resolve({
                    ...(await record.data.json()),
                    recordId: record.id,
                    dateCreated: record.dateCreated,
                    authorId: record.author,
                  });
                })
            )
          );

          setMessages(
            messages.sort((a, b) => {
              const dateA = new Date(a.dateCreated);
              const dateB = new Date(b.dateCreated);
              return dateA.getTime() - dateB.getTime();
            })
          );
        } catch (error) {
          console.log("Error fetching messages.");
        }
      }
    })();
  }, [web5, currentDid, profile, did, didResolved]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (web5 && currentDid && profile && didResolved) {
      const { record: messageRecord, status: createStatus } =
        await web5.dwn.records.create({
          data: {
            content: values.message,
          },
          message: {
            schema: schemas.message,
            dataFormat: "application/json",
            protocol: protocolDefinition.protocol,
            protocolPath: "message",
            recipient: decodedDid,
          },
        });

      if (!(createStatus.code >= 200 && createStatus.code < 400)) {
        toast({
          title: "Error Sending Message",
          description: createStatus.detail,
        });
      } else {
        if (messageRecord) {
          console.log(`Created post for ${did}`);
          const { status: followSendStatus } = await messageRecord.send(
            decodedDid
          );
          console.log(`Send for ${did}: ${followSendStatus.detail}`);

          const message = {
            ...(await messageRecord.data.json()),
            recordId: messageRecord.id,
            dateCreated: messageRecord.dateCreated,
            authorId: messageRecord.author,
          };

          chatChannel.publish("add", message);

          // setMessages((prev) => [...prev, message]);
        }
      }
    }
    form.reset({ message: "" });
  }

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
                  {follower || following ? (
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-2 items-center">
                        <div className="font-semibold text-2xl">
                          {follower
                            ? follower.sharedProfile?.username
                              ? follower.sharedProfile.username
                              : follower.sharedProfile?.fullName
                              ? follower.sharedProfile.fullName
                              : "Anonymous"
                            : following?.assignedName}
                        </div>
                        <div className="text-sm text-muted-foreground w-max">
                          {follower && following
                            ? "You follow each other"
                            : follower
                            ? "This user follows you"
                            : "You follow this user"}
                        </div>
                      </div>
                      <div className="flex justify-end w-full">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MessagesSquare />
                            </Button>
                          </SheetTrigger>
                          <SheetContent side={"left"}>
                            <SheetHeader className="mb-4">
                              <SheetTitle>Your Conversation</SheetTitle>
                              <SheetDescription>
                                Your conversation between this user.
                              </SheetDescription>
                            </SheetHeader>
                            <div>
                              <ScrollArea className="rounded-md border border-border h-[70vh] mb-4 bg-background">
                                <div className="p-2 flex flex-col gap-2">
                                  {messages.map((message) => {
                                    const ownMessage =
                                      message.authorId === currentDid;
                                    return (
                                      <div
                                        className="flex"
                                        key={message.recordId}
                                      >
                                        <div
                                          className={`${
                                            ownMessage
                                              ? "bg-primary text-primary-foreground ml-auto"
                                              : "bg-[#FFEC19] text-black"
                                          } rounded-md py-1 px-2`}
                                        >
                                          <span className="text-sm">
                                            {message.content}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {/* <div className="flex">
                                    <div className="bg-primary text-primary-foreground rounded-md p-1">
                                      <span className="text-sm">
                                        I will be here.
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex">
                                    <div className="ml-auto bg-[#FFEC19] text-black rounded-md p-1">
                                      <span className="text-sm">
                                        I will be here.
                                      </span>
                                    </div>
                                  </div> */}
                                </div>
                              </ScrollArea>
                              <Form {...form}>
                                <form
                                  onSubmit={form.handleSubmit(onSubmit)}
                                  className="flex gap-2"
                                >
                                  <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                      <FormItem className="grow">
                                        <FormControl>
                                          <Input
                                            placeholder="How are you?"
                                            type="text"
                                            autoComplete="off"
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <Button type="submit">
                                    <SendHorizontal size={20} />
                                  </Button>
                                </form>
                              </Form>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  ) : null}
                  <section className="border-b border-border py-8">
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
                          User&apos;s Shared Profile
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
