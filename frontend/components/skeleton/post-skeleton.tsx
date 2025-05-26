import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function PostSkeleton() {
  return (
    <Card className="w-full mx-auto flex flex-col justify-between rounded-lg">
      <CardHeader className="flex flex-row justify-between items-center py-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <hr className="my-0" />
      <CardContent className="flex-grow overflow-hidden py-3 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-3">
          <Skeleton className="w-full h-[200px] rounded-sm" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-3 w-full border-t">
        <div className="flex justify-between w-full">
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardFooter>
    </Card>
  );
}
