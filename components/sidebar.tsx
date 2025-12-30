"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Mail, Inbox, Clock, X, Trash2, Loader2 } from "lucide-react";
import {
  removeRecentEmailAction,
  clearRecentEmailsAction,
} from "@/app/actions";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface RecentEmail {
  address: string;
  lastUsed: string;
}

interface SidebarProps {
  recentEmails?: RecentEmail[];
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRecentEmailsChange?: () => void;
}

function SidebarContent({
  recentEmails = [],
  onItemClick,
  onRemove,
  onClearAll,
  isRemoving,
  isClearing,
}: {
  recentEmails: RecentEmail[];
  onItemClick?: () => void;
  onRemove?: (address: string) => void;
  onClearAll?: () => void;
  isRemoving?: string | null;
  isClearing?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="px-4 py-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Recent Inboxes
        </h3>
        {recentEmails.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                disabled={isClearing}
              >
                {isClearing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all recent inboxes?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {recentEmails.length} recent inboxes from
                  your history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onClearAll?.()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {recentEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent inboxes</p>
              <p className="text-xs">Create a new inbox to get started</p>
            </div>
          ) : (
            recentEmails.map((email) => {
              const isActive =
                pathname === `/inbox/${encodeURIComponent(email.address)}`;
              const isBeingRemoved = isRemoving === email.address;
              return (
                <div
                  key={email.address}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg pr-1 transition-all hover:bg-accent",
                    isActive &&
                      "bg-linear-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/20",
                    isBeingRemoved && "opacity-50"
                  )}
                >
                  <Link
                    href={`/inbox/${encodeURIComponent(email.address)}`}
                    onClick={onItemClick}
                    className="flex items-center gap-3 flex-1 min-w-0 px-3 py-2"
                  >
                    <Mail
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-indigo-500" : "text-muted-foreground"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "truncate font-medium text-sm",
                          isActive && "text-indigo-600"
                        )}
                      >
                        {email.address.split("@")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{email.address.split("@")[1]}
                      </p>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove?.(email.address);
                    }}
                    disabled={isBeingRemoved}
                  >
                    {isBeingRemoved ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </>
  );
}

export function Sidebar({
  recentEmails = [],
  className,
  open,
  onOpenChange,
  onRecentEmailsChange,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [removingAddress, setRemovingAddress] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleRemove = async (address: string) => {
    setRemovingAddress(address);
    startTransition(async () => {
      const result = await removeRecentEmailAction(address);
      setRemovingAddress(null);

      if (result.success) {
        toast.success("Inbox removed from history");
        onRecentEmailsChange?.();

        // If we're on the removed inbox page, redirect to dashboard
        if (pathname === `/inbox/${encodeURIComponent(address)}`) {
          router.push("/dashboard");
        }
      } else {
        toast.error(result.error || "Failed to remove inbox");
      }
    });
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    startTransition(async () => {
      const result = await clearRecentEmailsAction();
      setIsClearing(false);

      if (result.success) {
        toast.success("All recent inboxes cleared");
        onRecentEmailsChange?.();

        // If we're on any inbox page, redirect to dashboard
        if (pathname.startsWith("/inbox/")) {
          router.push("/dashboard");
        }
      } else {
        toast.error(result.error || "Failed to clear inboxes");
      }
    });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col w-64 border-r bg-muted/30",
          className
        )}
      >
        <SidebarContent
          recentEmails={recentEmails}
          onRemove={handleRemove}
          onClearAll={handleClearAll}
          isRemoving={removingAddress}
          isClearing={isClearing}
        />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Mail className="h-3 w-3 text-white" />
              </div>
              TempMail
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-65px)]">
            <SidebarContent
              recentEmails={recentEmails}
              onItemClick={() => onOpenChange?.(false)}
              onRemove={handleRemove}
              onClearAll={handleClearAll}
              isRemoving={removingAddress}
              isClearing={isClearing}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
