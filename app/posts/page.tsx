"use client";
import logoFull from "@/assets/images/logo-full.svg";

import { Button, buttonVariants } from "@/components/ui/button";
import { Profile, useWeb5 } from "@/contexts/Web5Context";
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
  Image as ImageIcon,
  Users,
  UsersRound,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format, formatDistance } from "date-fns";
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
import { Follower, Following, Post, SharedProfile } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  content: z.string().min(10),
});

export default function PostsPage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDids, setSelectedDids] = useState<string[]>([]);

  const [postsLoading, setPostsLoading] = useState(true);

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostImage, setSelectedPostImage] = useState<File | null>(null);
  console.log({ posts, selectedDids });
  useEffect(() => {
    (async () => {
      if (web5 && currentDid) {
        setPostsLoading(true);
        let following: Following[] = [];
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
          following = (await Promise.all(
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
        const { records: ownPostRecords } = await web5.dwn.records.query({
          message: {
            filter: {
              author: currentDid,
              protocol: protocolDefinition.protocol,
              protocolPath: "post",
              schema: schemas.post,
            },
          },
        });

        const { records: sentPostRecords } = await web5.dwn.records.query({
          from: currentDid,
          message: {
            filter: {
              recipient: currentDid,
              protocol: protocolDefinition.protocol,
              protocolPath: "post",
              schema: schemas.post,
            },
          },
        });

        console.log({ sentPostRecords });

        if (
          ownPostRecords &&
          sentPostRecords
          // &&
          // ownPostRecords.length === 100
        ) {
          const posts = (await Promise.all(
            [...ownPostRecords, ...sentPostRecords].map(
              (record) =>
                new Promise<Post>(async (resolve) =>
                  resolve({
                    ...(await record.data.json()),
                    recordId: record.id,
                    authorId: record.author,
                    authorLabel: "Anonymous",
                    dateCreated: record.dateCreated,
                  })
                )
            )
          )) as Post[];

          setPosts(
            posts
              .filter(
                (post, index, self) =>
                  self.findIndex((o) => o.uniqueId === post.uniqueId) === index
              )
              .map((post) => {
                const foundFollowing = following.find(
                  (data) => data.did === post.authorId
                );
                if (foundFollowing) {
                  return { ...post, authorLabel: foundFollowing.assignedName };
                } else if (post.authorId === currentDid) {
                  return { ...post, authorLabel: "You" };
                }
                return post;
              })
          );
        }
        setPostsLoading(false);
      }
    })();
  }, [web5, currentDid]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let base64Image: undefined | string;

    if (selectedPostImage) {
      const binaryImage = await selectedPostImage.arrayBuffer();
      base64Image = btoa(
        new Uint8Array(binaryImage).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
    }

    if (web5 && currentDid && profile) {
      const id = uuidv4();

      const posts = await Promise.all<Post>(
        selectedDids.map(
          (did) =>
            new Promise(async (resolve) => {
              const { record: postRecord, status: createStatus } =
                await web5.dwn.records.create({
                  data: {
                    uniqueId: id,
                    content: values.content,
                    image: base64Image,
                  },
                  message: {
                    schema: schemas.post,
                    dataFormat: "application/json",
                    protocol: protocolDefinition.protocol,
                    protocolPath: "post",
                    recipient: did,
                  },
                });

              if (!(createStatus.code >= 200 && createStatus.code < 400)) {
                toast({
                  title: "Error Creating Post",
                  description: createStatus.detail,
                });
              } else {
                if (postRecord) {
                  console.log(`Created post for ${did}`);
                  const { status: followSendStatus } = await postRecord.send(
                    did
                  );
                  console.log(`Send for ${did}: ${followSendStatus.detail}`);

                  resolve({
                    ...(await postRecord.data.json()),
                    recordId: postRecord.id,
                  });
                }
              }
            })
        )
      );
    }
    form.setValue("content", "");
    setSelectedPostImage(null);
  }

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto mt-8 px-4 pb-8">
        <h1 className="text-3xl font-semibold text-center mb-4">Posts</h1>
        <section className="mb-12 pb-4 border-b border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Something</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share something to your followers!"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedPostImage && (
                <div className="flex">
                  <div className="p-1 border border-border rounded-md relative">
                    <button
                      type="button"
                      onClick={() => setSelectedPostImage(null)}
                      className="absolute top-2 right-2 rounded-full w-7 h-7 text-primary-foreground bg-primary hover:bg-primary/90 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                    <Image
                      src={URL.createObjectURL(selectedPostImage)}
                      alt="Selected"
                      width={240}
                      height={240}
                      className="h-auto w-64"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <FormItem>
                    <FormLabel
                      htmlFor="postImage"
                      className={buttonVariants({
                        variant: "outline",
                        size: "icon",
                      })}
                    >
                      <ImageIcon />
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="postImage"
                        type="file"
                        placeholder="Share something to your followers!"
                        className="hidden"
                        accept="image/jpeg, image/png"
                        onChange={(e) => {
                          if (e.target.files?.length) {
                            const imageSize = e.target.files[0].size;
                            if (imageSize > 10240) {
                              toast({
                                title: "Image too big.",
                                description:
                                  "Sorry! At the moment we're limiting image sizes to 10kb",
                              });
                            } else {
                              setSelectedPostImage(e.target.files[0]);
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
                          <DialogTitle>Share with Your Followers</DialogTitle>
                          <DialogDescription>
                            Choose which of your followers will get to see this
                            post.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {followers.map((follower) => (
                            <div
                              key={follower.did}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  id={follower.did}
                                  checked={selectedDids.includes(follower.did)}
                                  onCheckedChange={(checked) => {
                                    setSelectedDids((prev) =>
                                      checked
                                        ? [...prev, follower.did]
                                        : prev.filter(
                                            (existingKey) =>
                                              existingKey !== follower.did
                                          )
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={follower.did}
                                className="font-normal flex flex-col"
                              >
                                <span className="font-semibold">
                                  {follower.sharedProfile?.username
                                    ? follower.sharedProfile.username
                                    : follower.sharedProfile?.fullName
                                    ? follower.sharedProfile.fullName
                                    : "Anonymous"}
                                </span>
                                <span> {collapseDid(follower.did)}</span>
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
                </div>
                <Button type="submit">Post</Button>
              </div>
            </form>
          </Form>
        </section>
        <section className="flex flex-col gap-4">
          {postsLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <article
                key={post.recordId}
                className="rounded-md border-border border"
              >
                <header className="text-sm p-4 border-b border-border">
                  <div className="flex gap-1">
                    <span className="font-semibold">{post.authorLabel}</span>
                    <span className="text-muted-foreground">
                      · {formatDistance(new Date(post.dateCreated), new Date())}
                    </span>
                  </div>
                  <div>{collapseDid(post.authorId)}</div>
                </header>
                <div className="p-4 flex gap-4 bg-accent text-accent-foreground">
                  {post.image && (
                    <div className="p-2 border border-border bg-white rounded-md">
                      <Image
                        alt="post image"
                        src={"data:image/jpg;base64," + post.image}
                        width={200}
                        height={200}
                        className="w-64"
                      />
                    </div>
                  )}
                  <div>{post.content}</div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center">No posts to show.</div>
          )}
        </section>
      </div>
    </div>
  );
}
