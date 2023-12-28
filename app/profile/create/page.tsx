"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { useWeb5 } from "@/contexts/Web5Context";
import { cn, collapseDid } from "@/lib/utils";
import { ArrowLeft, Copy } from "lucide-react";
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
import { useEffect } from "react";
import { protocolDefinition, schemas } from "@/lib/protocols";
import { useRouter } from "next/navigation";
const formSchema = z.object({
  username: z.string().min(2).max(50),
  fullName: z.string().min(2).max(50),
  dateOfBirth: z.date().optional(),
  city: z.string().min(2),
  country: z.string().min(2),
  occupation: z.string().min(2),
  description: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
});

export default function Home() {
  const { currentDid, web5, setProfile } = useWeb5();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      gender: "MALE",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    if (web5) {
      const { record: profileRecord, status: createStatus } =
        await web5.dwn.records.create({
          data: {
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
          },
          message: {
            schema: schemas.profile,
            dataFormat: "application/json",
            protocol: protocolDefinition.protocol,
            protocolPath: "profile",
          },
        });
      setProfile({
        ...(await profileRecord?.data.json()),
        recordId: profileRecord?.id,
        contextId: profileRecord?.contextId,
      });

      router.push("/profile");
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
                      <Input placeholder="johndoe23" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your handle. This will automatically be public{" "}
                    </FormDescription>
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
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>Your full name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup defaultValue="male" className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Custom" id="Custom" />
                          <Label htmlFor="Custom">Custom</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>Your gender.</FormDescription>
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
                        placeholder="I'm an easy-going scuba diver."
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
              <div>
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Jakarta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Indonesia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your origins.
                </p>
              </div>
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input placeholder="Web5 Developer" {...field} />
                    </FormControl>
                    <FormDescription>Your occupation/job.</FormDescription>
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
                            <div className="flex gap-4">
                              <Button
                                variant={"outline"}
                                type="button"
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
                              <Select
                                onValueChange={(value) => {
                                  const currentDate =
                                    form.getValues("dateOfBirth") ?? new Date();
                                  currentDate.setFullYear(parseInt(value));
                                  form.setValue("dateOfBirth", currentDate);
                                }}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 120 }).map(
                                    (_, index) => (
                                      <SelectItem
                                        value={index + 1900 + ""}
                                        key={index + 1900}
                                      >
                                        {index + 1900}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
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
