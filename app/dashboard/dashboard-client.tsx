"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "@/lib/auth";
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
import { generateRandomInbox } from "@/lib/utils";

interface DashboardClientProps {
  domains: string[];
  userName: string;
}

export function DashboardClient({ domains, userName }: DashboardClientProps) {
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

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {userName}</h2>
          <p className="text-muted-foreground">Access your temporary inbox</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open Inbox</CardTitle>
          <CardDescription>
            Enter an inbox name to view emails sent to that address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name="inbox"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Inbox Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="my-inbox"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="pb-2 text-muted-foreground">@</span>
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem className="w-48">
                      <FormLabel>Domain</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {domains.map((domain) => (
                            <SelectItem key={domain} value={domain}>
                              {domain}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Opening..." : "Open Inbox"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.setValue("inbox", generateRandomInbox())}
                  disabled={isLoading}
                >
                  Random
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            1. Choose any inbox name (e.g.,{" "}
            <code className="bg-muted px-1 rounded">my-temp</code>)
          </p>
          <p>
            2. Share the email address (e.g.,{" "}
            <code className="bg-muted px-1 rounded">my-temp@{domains[0]}</code>)
          </p>
          <p>3. All emails sent to that address will appear in your inbox</p>
          <p>4. Emails expire after 24 hours</p>
        </CardContent>
      </Card>
    </div>
  );
}
