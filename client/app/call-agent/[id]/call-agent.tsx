'use client'

import { useState } from "react"
import { User, Bot, PhoneCall, PhoneOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CallAgentProps {
    user: {
        _id: string
        name: string
        email: string
    }
}

export default function CallAgent({ user }: CallAgentProps) {
    const [isCallActive, setIsCallActive] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleCall = async () => {
        if (isCallActive) {
            setIsCallActive(false)
            console.log('Call ended')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user._id }),
            })

            if (!response.ok) {
                throw new Error('Failed to initiate call')
            }

            const data = await response.json()
            setIsCallActive(true)
            console.log('Call initiated successfully', data)
            console.log(`Call ID: ${data.callId}`)
        } catch (error) {
            console.error('Error initiating call:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Online Scam Assistance Agent</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <div className="flex items-center justify-center space-x-8 p-8 bg-gray-100 rounded-lg">
                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
                                <User size={64} className="text-primary-foreground" />
                            </div>
                            <span className="mt-2 text-sm font-medium text-gray-700">Online Agent</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center">
                                <Bot size={64} className="text-secondary-foreground" />
                            </div>
                            <span className="mt-2 text-sm font-medium text-gray-700">AI Avatar</span>
                        </div>
                    </div>
                    <p className="text-lg font-semibold">Welcome, {user.name}</p>
                    {isCallActive ? (
                        <p className="text-green-500 animate-pulse">Call in progress...</p>
                    ) : (
                        <p className="text-gray-500">Ready to assist you</p>
                    )}
                    <Button
                        onClick={handleCall}
                        className={`w-full ${isCallActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Initiating Call...</span>
                        ) : isCallActive ? (
                            <>
                                <PhoneOff className="mr-2 h-4 w-4" />
                                End Call
                            </>
                        ) : (
                            <>
                                <PhoneCall className="mr-2 h-4 w-4" />
                                Get a Call
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}