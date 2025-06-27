'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
};

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 rounded-full h-8 w-8"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-center">
            {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
          </DialogTitle>
        </DialogHeader>

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
          defaultValue={defaultTab}
          className="px-6 pb-6"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm onSuccess={() => setActiveTab('login')} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
