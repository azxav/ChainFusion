
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, User, Mic } from 'lucide-react';
import { chatOpsBot, type ChatOpsBotInput, type ChatOpsBotOutput } from '@/ai/flows/chat-ops-bot';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatOpsAgentPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const initialBotMessages: Message[] = [
    { id: 'init1', text: "Hello! I'm your Tashkent Vision ChatOps Agent. How can I help you with your supply chain queries today?", sender: 'bot', timestamp: new Date() },
    { id: 'init2', text: "You can ask things like:\n\n- 'What’s the risk on Semiconductor Batch #1234?'\n- 'Show me all shipments delayed over 12 hours'.\n- 'Summarize recent disruptions in Central Asia.'", sender: 'bot', timestamp: new Date(Date.now() + 100) },
  ];

  useEffect(() => {
    setMessages(initialBotMessages);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (event?: FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    event?.preventDefault();
    if (!query.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: query,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const result: ChatOpsBotOutput = await chatOpsBot({ query: userMessage.text });
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: result.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error with ChatOps agent:', error);
      toast({ title: 'Error', description: 'Failed to get response from agent. Please try again.', variant: 'destructive' });
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
    setIsLoading(false);
    // Refocus textarea after send
    textAreaRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)]"> {/* Adjust height based on your header */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-full text-sm ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}
                >
                  <p style={{whiteSpace: 'pre-wrap'}} className="leading-relaxed">{message.text}</p>
                </div>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-muted-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
               {/* Removed user avatar for ChatGPT style */}
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3 justify-start max-w-3xl mx-auto">
               <Avatar className="h-8 w-8 shrink-0">
                 <AvatarFallback><Bot size={18}/></AvatarFallback>
               </Avatar>
              <div className="text-sm">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-4 pb-2 pt-2 sticky bottom-0 bg-background">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex w-full items-end space-x-2 bg-card border p-2 rounded-xl shadow-sm">
          <Textarea
            ref={textAreaRef}
            id="message"
            placeholder="Ask the Chat-Ops Agent..."
            className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-[200px] text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />
          <Button type="submit" size="icon" variant="ghost" className="h-9 w-9 rounded-lg" disabled={isLoading || !query.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center pt-2">
          ChainFusion Chat-Ops Agent. AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
