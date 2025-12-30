"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inboxNameSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { z } from "zod";
import { Sparkles, Mail, ArrowRight, Shield, Clock, Zap } from "lucide-react";

interface InboxGeneratorProps {
  domains: string[];
}

export function InboxGenerator({ domains }: InboxGeneratorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    inbox: inboxNameSchema,
    domain: z.string().min(1, "Please select a domain"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inbox: "",
      domain: domains[0] || "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const address = `${data.inbox.toLowerCase()}@${data.domain}`;
      router.push(`/inbox/${encodeURIComponent(address)}`);
    } catch {
      toast.error("Failed to open inbox");
    } finally {
      setIsLoading(false);
    }
  }

  // Generate a random inbox name using Indian names
  function generateRandomInbox() {
    const firstNames = [
      "aarav",
      "vivaan",
      "aditya",
      "vihaan",
      "arjun",
      "sai",
      "reyansh",
      "ayaan",
      "krishna",
      "ishaan",
      "shaurya",
      "atharv",
      "advait",
      "arnav",
      "dhruv",
      "kabir",
      "ritvik",
      "aarush",
      "kian",
      "darsh",
      "ananya",
      "diya",
      "aadhya",
      "pihu",
      "priya",
      "shreya",
      "isha",
      "kavya",
      "anika",
      "saanvi",
      "meera",
      "tara",
      "riya",
      "neha",
      "pooja",
      "anjali",
      "divya",
      "nisha",
      "sanya",
      "aditi",
      "rohan",
      "rahul",
      "amit",
      "vikram",
      "suresh",
      "rajesh",
      "manish",
      "nikhil",
    ];

    const middleNames = [
      "kumar",
      "devi",
      "prasad",
      "lal",
      "chand",
      "nath",
      "ram",
      "prakash",
      "mohan",
      "kishan",
      "gopal",
      "shyam",
      "babu",
      "singh",
      "rani",
      "kumari",
      "bala",
      "chandra",
      "lakshmi",
      "ganga",
      "maya",
      "rekha",
      "sunder",
      "ratan",
    ];

    const lastNames = [
      "sharma",
      "verma",
      "gupta",
      "singh",
      "kumar",
      "patel",
      "reddy",
      "rao",
      "joshi",
      "mehta",
      "shah",
      "trivedi",
      "pandey",
      "mishra",
      "tiwari",
      "dubey",
      "chauhan",
      "yadav",
      "agarwal",
      "bansal",
      "kapoor",
      "malhotra",
      "chopra",
      "bhatia",
      "saxena",
      "srivastava",
      "rastogi",
      "kulkarni",
      "deshmukh",
      "patil",
      "nair",
      "menon",
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const includeMiddleName = Math.random() > 0.5;

    if (includeMiddleName) {
      const middleName =
        middleNames[Math.floor(Math.random() * middleNames.length)];
      return `${firstName}.${middleName}.${lastName}`;
    }

    return `${firstName}.${lastName}`;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl space-y-6 md:space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
            <Mail className="h-7 w-7 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Create Your{" "}
            <span className="bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Temporary Inbox
            </span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
            Generate a disposable email address instantly. No registration
            required for the inbox.
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">Enter Inbox Name</CardTitle>
            <CardDescription>
              Choose a name or generate a random one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-2 md:items-end">
                  <FormField
                    control={form.control}
                    name="inbox"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Inbox Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., aarav.sharma"
                            className="text-base md:text-lg h-11 md:h-12"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="hidden md:block pb-3 text-2xl text-muted-foreground">
                    @
                  </span>
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-48">
                        <FormLabel className="md:hidden">Domain</FormLabel>
                        <FormLabel className="hidden md:block">
                          Domain
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 md:h-12">
                              <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {domains.map((domain) => (
                              <SelectItem key={domain} value={domain}>
                                @{domain}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      form.setValue("inbox", generateRandomInbox())
                    }
                    disabled={isLoading}
                    className="flex-1 h-11"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Random
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-11 bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                  >
                    {isLoading ? "Opening..." : "Open Inbox"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="text-center p-4 rounded-xl bg-linear-to-r from-indigo-500/5 to-purple-600/5 border">
            <Shield className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
            <p className="text-sm font-medium">Private & Secure</p>
            <p className="text-xs text-muted-foreground">
              No personal data stored
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-linear-to-r from-indigo-500/5 to-purple-600/5 border">
            <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-medium">Instant Access</p>
            <p className="text-xs text-muted-foreground">No setup required</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-linear-to-r from-indigo-500/5 to-purple-600/5 border">
            <Clock className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
            <p className="text-sm font-medium">Real-time</p>
            <p className="text-xs text-muted-foreground">
              Emails arrive instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
