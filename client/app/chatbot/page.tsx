"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, User, Bot } from "lucide-react";
import Image from "next/image";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "bot"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const loadingStates = ["Thinking", "Loading", "Generating"];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingState((prevState) => (prevState + 1) % loadingStates.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");

    try {
      const response = await fetch(
        "https://happy-cohen-admiring.lemme.cloud/api/2104ecaf-283d-4eb8-a89f-c4ae063c287c",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer oat_MjE4OA.OGZEMXJBTWJOTFRVUTFab3dJZUhSLUFuZ2RlLXVtTlJpVTZZWGJKZDEzMzAyODA0MzA`,
          },
          body: JSON.stringify({ situation: input }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.output }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <a
        href="https://lemmebuild.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 bg-white text-gray-800 text-xs sm:text-sm font-semibold py-1 px-2 sm:px-3 rounded-full shadow-md hover:bg-gray-100 transition duration-300 flex items-center"
      >
        <span className="sm:inline hidden mr-1">Built with</span>
        <Image
          src="https://lemmebuild.com/img/logo_light.png"
          alt="LemmeBuild Logo"
          width={1100}
          height={100}
          className="w-fit h-4 xl:h-6 object-contain"
        />
      </a>
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Scam Assistant Chatbot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start mb-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 ${
                    message.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User size={20} className="text-white" />
                    ) : (
                      <Bot size={20} className="text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-blue-100" : "bg-green-100"
                    }`}
                  >
                    <p className="text-sm">
                      {typeof message.content === "string"
                        ? message.content
                        : JSON.stringify(message.content)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start mb-4 justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="max-w-[70%] rounded-lg p-3 bg-green-100 flex items-center">
                    <span className="mr-2">{loadingStates[loadingState]}</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              className="flex-grow"
              placeholder="Enter a situation and get a response"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
