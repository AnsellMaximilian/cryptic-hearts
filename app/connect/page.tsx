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

export default function ConnectPage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi | undefined>();

  useEffect(() => {
    if (!api) {
      return;
    } else {
    }
  }, [api]);

  return (
    <div>
      <Header className="" />
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-3xl font-semibold text-center mb-4">
          Start Connecting
        </h1>
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
                          className="w-full bg-[#DEE100] hover:bg-[#fafd5e]"
                          onClick={() => {
                            if (api) {
                              api.scrollNext();
                            }
                          }}
                        >
                          <Heart
                            className="mr-2 h-4 w-4 text-red-600"
                            strokeWidth={3}
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
