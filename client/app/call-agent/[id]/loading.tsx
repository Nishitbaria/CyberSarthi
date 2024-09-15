import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Online Scam Assistance Agent</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <div className="flex items-center justify-center space-x-8 p-8 bg-gray-100 rounded-lg">
                        <div className="flex flex-col items-center">
                            <Skeleton className="w-32 h-32 rounded-full" />
                            <Skeleton className="h-4 w-20 mt-2" />
                        </div>
                        <div className="flex flex-col items-center">
                            <Skeleton className="w-32 h-32 rounded-full" />
                            <Skeleton className="h-4 w-20 mt-2" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}