import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <div className="absolute inset-0 h-16 w-16 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 animate-ping opacity-20" />
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Loading...
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait while we fetch your content
          </p>
        </div>

        {/* Loading Skeleton Preview */}
        <Card className="w-full max-w-md mt-4">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>

        {/* Loading Dots Animation */}
        <div className="flex gap-1.5 mt-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
