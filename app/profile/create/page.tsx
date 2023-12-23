"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { protocolDefinition, useWeb5 } from "@/contexts/Web5Context";
import { cn, collapseDid } from "@/lib/utils";
import { ArrowLeft, Copy } from "lucide-react";
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
import Link from "next/link";
import { useEffect } from "react";
const formSchema = z.object({
  username: z.string().min(2).max(50),
  fullName: z.string().min(2).max(50),
  dateOfBirth: z.date().optional(),
  description: z.string().optional(),
});

export default function Home() {
  const { currentDid, web5 } = useWeb5();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  useEffect(() => {
    (async () => {
      if (web5) {
        const { records: profiles } = await web5.dwn.records.query({
          message: {
            filter: {
              protocol: protocolDefinition.protocol,
              protocolPath: "profile",
            },
          },
        });

        console.log(profiles);
        if (profiles?.length) {
          console.log(await profiles[0].data.json());
        }
      }
    })();
  }, [web5]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    if (web5) {
      const { record: profileRecord, status: createStatus } =
        await web5.dwn.records.create({
          data: {
            username: values.username,
            fullName: values.fullName,
            description: values.description,
            dateOfBirth: values.dateOfBirth
              ? format(values.dateOfBirth, "yyyy-MM-dd")
              : values.dateOfBirth,
          },
          message: {
            schema:
              "http://ansellmaximilian.github.io/crypticheartsprotocol/profile",
            dataFormat: "application/json",
            protocol: protocolDefinition.protocol,
            protocolPath: "profile",
          },
        });

      console.log({ profileRecord, createStatus });
    }
  }

  return (
    <div
      className="bg-[#DEE100] grow bg-[length:600px] bg-bottom bg-repeat-x relative"
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
          <h1 className="text-4xl font-bold">Create Your Profile</h1>
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>Your handle.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>Your full name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell the network a little about yourself.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !form.getValues("dateOfBirth") &&
                                  "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {form.getValues("dateOfBirth") ? (
                                format(form.getValues("dateOfBirth")!, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={form.getValues("dateOfBirth")}
                              onSelect={(value) => {
                                form.setValue("dateOfBirth", value);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormControl>
                    <FormDescription>Your date of birth.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Create</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
