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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/header";
import { useWeb5 } from "@/contexts/Web5Context";
import { Button } from "@/components/ui/button";
import { BellRing, Check, Cross, Hand, Heart } from "lucide-react";
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
const formSchema = z.object({
  did: z.string().min(2),
});
export default function ConnectPage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();
  const router = useRouter();
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi | undefined>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      did: "",
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
          },
        },
      });

      if (followingRecords?.length) {
        // already followed
        toast({ title: "Already following this user." });
      } else {
        const { record: followingRecord, status: createStatus } =
          await web5.dwn.records.create({
            data: values.did,
            message: {
              schema: schemas.following,
              dataFormat: "text/plain",
              protocol: protocolDefinition.protocol,
              protocolPath: "following",
              recipient: values.did,
            },
          });

        if (!(createStatus.code >= 200 && createStatus.code < 400)) {
          toast({ title: "Error Following", description: createStatus.detail });
        } else {
          if (followingRecord) {
            const { status } = await followingRecord.send(values.did);

            console.log(status);
            toast({
              title: "Followed!",
              description: `Successfully followed ${values.did}`,
            });
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
                <Button type="submit">Follow</Button>
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
