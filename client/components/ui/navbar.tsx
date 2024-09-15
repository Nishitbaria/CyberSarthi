"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Component() {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const MenuItem = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Button variant="ghost" asChild className="w-full justify-start">
      <Link href={href} onClick={toggleMenu}>
        {children}
      </Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Cyber Sarthi
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/tools/LinkScanner">Link Scanner</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/chatbot">chatbot</Link>
          </Button>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4 mt-4">
              <MenuItem href="/tools/LinkScanner">Link Scanner</MenuItem>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
