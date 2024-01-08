"use client";
import QRCode from "react-qr-code";

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
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/header";
import { Profile, useWeb5 } from "@/contexts/Web5Context";
import { Button } from "@/components/ui/button";
import { CopyIcon, FileLock2, Loader2, Search, Settings } from "lucide-react";
import type { CarouselApi } from "@/components/ui/carousel";
import { protocolDefinition, schemas } from "@/lib/protocols";
import connected from "@/assets/images/connected.svg";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  camelCaseToSeparatedWords,
  collapseDid,
  copyToClipboard,
} from "@/lib/utils";
import dwnService from "@/services/dwnService";
const formSchema = z.object({
  did: z.string().min(2),
  assignedName: z.string().min(2),
});
export default function ConnectPage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();
  const params = useSearchParams();
  const did = params.get("did");

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [api, setApi] = useState<CarouselApi | undefined>();

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
    if (did) {
      form.setValue("did", did);
    }
  }, [did, form]);

  useEffect(() => {
    if (!api) {
      return;
    } else {
    }
  }, [api]);

  async function handleFollowDid(values: z.infer<typeof formSchema>) {
    setLoading(true);
    if (web5 && currentDid && profile) {
      const dwn = dwnService(web5);
      const resolvedDid = await web5.did.resolve(values.did);

      if (!resolvedDid.didDocument) {
        toast({ title: "DID not found." });
        form.reset();
        setLoading(false);
        return;
      }
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
        const followRes = await dwn.follow(
          values.did,
          values.assignedName,
          profile,
          sharedProfileAttributes
        );
        if (followRes) {
          toast({
            title: "Followed!",
            description: `Successfully followed ${values.did}`,
          });
        } else {
          toast({
            title: "Error Following!",
          });
        }
      }
    }
    setLoading(false);
    form.reset();
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

                  <Button type="submit" disabled={loading}>
                    Follow
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </section>
        <section className="py-8">
          <h3 className="text-xl font-semibold flex gap-1 items-center mb-4">
            <Search size={18} /> <span>Get Discovered</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="border-r border-border p-2">
              <div className="flex items-center justify-center">
                <Image
                  src={connected}
                  alt="connected"
                  width={200}
                  height={200}
                  className="w-56"
                />
              </div>
              <p className="font-light tracking-tight">
                Share your DID so other people can follow you. When someone
                follows you, they will share a portion of their private profile
                to you. You will also be able to selectively share posts to
                them.
              </p>
            </div>
            <div className="p-2">
              {currentDid ? (
                <div className="flex flex-col justify-center items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="p-2 rounded-md border border-border bg-accent block">
                        <QRCode
                          size={256}
                          style={{
                            height: "200px",
                            maxWidth: "100%",
                            width: "auto",
                          }}
                          value={`https://cryptic-hearts.vercel.app/connect?did=${currentDid}`}
                          viewBox={`0 0 256 256`}
                        />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[750px]">
                      <DialogHeader>
                        <DialogTitle>Your DID</DialogTitle>
                        <DialogDescription>
                          Share this DID to start getting followers.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="pt-4">
                        <div className="max-w-[400px] mx-auto">
                          <QRCode
                            size={256}
                            style={{
                              height: "auto",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                            value={`https://cryptic-hearts.vercel.app/connect?did=${currentDid}`}
                            viewBox={`0 0 256 256`}
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={async () => {
                            const res = await copyToClipboard(
                              `https://cryptic-hearts.vercel.app/connect?did=${currentDid}`
                            );
                            if (res) {
                              toast({
                                title: "Copied link to Clipboard.",
                                description:
                                  "Succesfully copied your connect link to clipboard.",
                              });
                            }
                          }}
                        >
                          Copy Link
                        </Button>
                        <Button>Close</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                      }
                    }}
                    className="flex gap-1 rounded-full"
                  >
                    <CopyIcon size={14} />{" "}
                    <span>{collapseDid(currentDid, 10)}</span>
                  </Button>
                  <div className="font-medium tracking-tight flex justify-center gap-1 items-center">
                    <FileLock2 size={16} /> <span>Your DID</span>
                  </div>
                </div>
              ) : (
                <Loader2 size={28} className="animate-spin" />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
