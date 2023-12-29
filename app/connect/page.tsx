"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/header";
import { Profile, useWeb5 } from "@/contexts/Web5Context";
import { Button } from "@/components/ui/button";
import { BellRing, Check, Cross, Hand, Heart, Settings } from "lucide-react";
import placeholder from "@/assets/images/placeholder.jpg";
import type { CarouselApi } from "@/components/ui/carousel";
import { UseEmblaCarouselType } from "embla-carousel-react";
import { protocolDefinition, schemas } from "@/lib/protocols";
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
import { useToast } from "@/components/ui/use-toast";
import { SharedProfile } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { camelCaseToSeparatedWords } from "@/lib/utils";
const formSchema = z.object({
  did: z.string().min(2),
  assignedName: z.string().min(2),
});
export default function ConnectPage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();
  const router = useRouter();
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi | undefined>();

  const [sharedProfile, setSharedProfile] = useState<
    Omit<SharedProfile, "contextId" | "recordId">
  >({});

  const [sharedProfileAttributes, setSharedProfileAttributes] = useState<
    string[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      did: "",
      assignedName: "",
    },
  });
  useEffect(() => {
    if (!api) {
      return;
    } else {
    }
  }, [api]);

  async function handleFollowDid(values: z.infer<typeof formSchema>) {
    if (web5 && currentDid && profile) {
      const { records: followingRecords } = await web5.dwn.records.query({
        message: {
          filter: {
            author: currentDid,
            recipient: values.did,
            schema: schemas.following,

            protocol: protocolDefinition.protocol,
            protocolPath: "following",
          },
        },
      });

      if (followingRecords?.length) {
        // already followed
        toast({ title: "Already following this user." });
      } else {
        let toastMessage = "";
        const { record: followingRecord, status: createStatus } =
          await web5.dwn.records.create({
            data: {
              did: values.did,
              assignedName: values.assignedName,
            },
            message: {
              schema: schemas.following,
              dataFormat: "application/json",
              protocol: protocolDefinition.protocol,
              protocolPath: "following",
              recipient: values.did,
            },
          });

        if (!(createStatus.code >= 200 && createStatus.code < 400)) {
          toast({ title: "Error Following", description: createStatus.detail });
        } else {
          if (followingRecord) {
            const { status: followSendStatus } = await followingRecord.send(
              values.did
            );

            console.log({ followSendStatus });

            const sharedProfile: { [key: string]: string } = {};
            for (const key in profile) {
              const safeKey = key as keyof Profile;
              if (sharedProfileAttributes.includes(safeKey)) {
                sharedProfile[safeKey] = profile[safeKey];
              }
            }

            const {
              record: sharedProfileRecord,
              status: createSharedProfileStatus,
            } = await web5.dwn.records.create({
              data: sharedProfile,
              message: {
                parentId: followingRecord.id,
                contextId: followingRecord.contextId,
                schema: schemas.sharedProfile,
                dataFormat: "application/json",
                protocol: protocolDefinition.protocol,
                protocolPath: "following/sharedProfile",
                recipient: values.did,
              },
            });
            console.log(createSharedProfileStatus);
            if (sharedProfileRecord) {
              const { status: sharedProfileStatus } =
                await sharedProfileRecord.send(values.did);
              console.log({ sharedProfileStatus });
              toast({
                title: "Followed!",
                description: `Successfully followed ${values.did}`,
              });
            }
          }
        }
      }
    }
  }

  return (
    <div>
      <Header className="" />
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-3xl font-semibold text-center mb-4">
          Start Connecting
        </h1>
        <section className="mb-4">
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFollowDid)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="did"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter a DID you wish to follow</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter DID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign a label/name</FormLabel>
                      <FormControl>
                        <Input placeholder="Lucy from work..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex gap-1"
                      >
                        <Settings size={16} />
                        <span>Shared Profile</span>
                        <span className="ml-1 bg-primary text-primary-foreground rounded-full block w-4 h-4 text-xs">
                          {sharedProfileAttributes.length}
                        </span>
                      </Button>
                    </DialogTrigger>
                    {profile && (
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Configure Shared Profile</DialogTitle>
                          <DialogDescription>
                            Choose which profile attributes you wish to share
                            with people you follow.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {Object.keys(profile)
                            .filter(
                              (key) => key !== "contextId" && key !== "recordId"
                            )
                            .map((key) => (
                              <div
                                key={key}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    id={key}
                                    checked={sharedProfileAttributes.includes(
                                      key
                                    )}
                                    onCheckedChange={(checked) => {
                                      setSharedProfileAttributes((prev) =>
                                        checked
                                          ? [...prev, key]
                                          : prev.filter(
                                              (existingKey) =>
                                                existingKey !== key
                                            )
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={key}
                                  className="font-normal"
                                >
                                  {camelCaseToSeparatedWords(key)}
                                </FormLabel>
                              </div>
                            ))}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="submit">Configure</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>

                  <Button type="submit">Follow</Button>
                </div>
              </form>
            </Form>
          </div>
        </section>
        <section className="flex justify-center py-8">
          <Carousel className="w-full max-w-[24rem]" setApi={setApi}>
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card className="overflow-hidden">
                      <CardHeader className="p-0">
                        <Image src={placeholder} alt="Profile picture" />
                        <div className="p-6">
                          <CardTitle>Jonah Jameson</CardTitle>
                          <CardDescription>@jjamesonspider</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-4"></CardContent>
                      <CardFooter className="flex gap-4">
                        <Button
                          className="w-full"
                          onClick={() => {
                            if (api) {
                              api.scrollPrev();
                            }
                          }}
                        >
                          <Check className="mr-2 h-4 w-4" /> Connect
                        </Button>
                        <Button
                          className="w-full bg-[#FFEC19] hover:bg-[#fafd5e] text-black"
                          onClick={() => {
                            if (api) {
                              api.scrollNext();
                            }
                          }}
                        >
                          <Heart
                            className="mr-2 h-4 w-4 text-red-600"
                            strokeWidth={5}
                          />{" "}
                          Unlock
                        </Button>
                        <Button variant="destructive">
                          <Hand />
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* <CarouselPrevious />
            <CarouselNext /> */}
          </Carousel>
        </section>
      </div>
    </div>
  );
}
