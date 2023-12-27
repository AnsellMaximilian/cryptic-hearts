"use client";
import logoFull from "@/assets/images/logo-full.svg";

import { Button, buttonVariants } from "@/components/ui/button";
import { Profile, useWeb5 } from "@/contexts/Web5Context";
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
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/header";

export default function PostsPage() {
  const { currentDid, web5, setProfile, profile } = useWeb5();

  return (
    <div>
      <Header />
    </div>
  );
}
