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
import ProfileForm, { profileFormSchema } from "@/components/profile-form";

export default function ProfileEditPage() {
  const {
    currentDid,
    web5,
    setProfile,
    profile,
    loading: profileLoading,
  } = useWeb5();
  const router = useRouter();

  useEffect(() => {
    if (!profile && !profileLoading) router.push("/profile/create");
  }, [profile, router, profileLoading]);

  async function handleSubmit(values: z.infer<typeof profileFormSchema>) {
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
          <ProfileForm onSubmit={handleSubmit} profile={profile ?? undefined} />
        </div>
      </div>
    </div>
  );
}
