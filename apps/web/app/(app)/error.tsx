'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from 'next/link';
import * as React from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {

    const [pending, startTransition] = React.useTransition()

    React.useEffect(() => {
        console.error(error)
    }, [error])

    const handleReset = React.useCallback(() => {
        startTransition(async () => {
            reset()
            await (new Promise((resolve) => setTimeout(resolve, 1000)))
        })
    }, [reset])

    return (
        <div className='w-full h-full flex flex-col items-center justify-center gap-4 p-4'>
            <Card className="w-full max-w-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-normal">Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-amber-500">
                            You can try refreshing the page or contact support. We are happy to help!
                        </p>

                        <Link
                            href="/support"
                            className="text-muted-foreground underline decoration-dotted">
                            Help & support.
                        </Link>
                    </div>
                </CardContent>
                <CardFooter className="border-t">
                    <Button size="sm" className="ml-auto" onClick={handleReset} isLoading={pending}>Try again</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
