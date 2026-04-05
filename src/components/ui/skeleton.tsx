import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

// Card Skeleton
export function CardSkeleton() {
    return (
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
        </div>
    )
}

// List Skeleton
export function ListSkeleton({ items = 6 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border border-border space-y-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>
    )
}

// Dashboard Skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <ListSkeleton items={3} />
            </div>
        </div>
    )
}

export { Skeleton }
