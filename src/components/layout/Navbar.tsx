"use client";

import { useState } from 'react';
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Settings, CreditCard, X } from "lucide-react";
import { ModeToggle } from "../theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthModal } from "@/components/auth/AuthModal";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const handleAuthClick = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/playground",
      label: "Playground",
      active: pathname.startsWith("/playground"),
    },
  ];

  return (
    <>
      {/* Hamburger Menu Button - Fixed Position */}
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-background/95 backdrop-blur border-border/40"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-6 space-y-6">
              {/* Logo */}
              <div className="pt-12">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Flame Audio AI
                  </span>
                </Link>
              </div>
              
              {/* Navigation Links */}
              <nav className="space-y-2">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "block px-4 py-3 rounded-md text-sm font-medium transition-colors hover:bg-muted",
                      route.active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
              </nav>
              
              {/* Theme Toggle */}
              <div className="px-4">
                <ModeToggle />
              </div>
              
              {/* Authentication Section */}
              <div className="border-t border-border pt-6">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 bg-muted animate-pulse rounded-md" />
                    <div className="h-10 bg-muted animate-pulse rounded-md" />
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-md bg-muted">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {session?.user?.name
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                      </div>
                    </div>
                    
                    {/* User Menu Items */}
                    <div className="space-y-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-muted rounded-md transition-colors" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link 
                        href="/billing" 
                        className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-muted rounded-md transition-colors" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Billing</span>
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-muted rounded-md transition-colors" 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <button 
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-muted rounded-md transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleAuthClick('login')}
                      className="w-full"
                    >
                      Log in
                    </Button>
                    <Button 
                      onClick={() => handleAuthClick('register')}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Navbar;