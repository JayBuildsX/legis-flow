import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  header?: boolean;
  headerHeight?: number;
  lines?: number;
  className?: string;
}

export function SkeletonCard({ 
  header = true, 
  headerHeight = 6, 
  lines = 3, 
  className 
}: SkeletonCardProps) {
  return (
    <Card className={className}>
      {header && (
        <CardHeader>
          <Skeleton style={{ height: `${headerHeight * 4}px` }} />
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {Array(lines).fill(0).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(i === lines - 1 ? "w-4/5" : "w-full")}
          />
        ))}
      </CardContent>
    </Card>
  );
} 