
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, User, Send, MessageSquarePlus } from 'lucide-react';
import { chatOpsBot, type ChatOpsBotInput, type ChatOpsBotOutput } from '@/ai/flows/chat-ops-bot';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const examplePrompts = [
  "What's the risk on Semiconductor Batch #SC-UZ-98765?",
  "Show me all shipments delayed over 12 hours.",
  "What is the vitality score for 'Tashkent Transistors Co.'?",
  "Predict stock-out risk for 'MCU-A500' currently at 350 units, with 40 units/day usage and 5 days lead time.",
  "Simulate the impact of a 'Port Congestion at Karachi Port' affecting 'Inbound Raw Materials' on our 'Component Assembly Line Alpha'.",
  "Find alternative suppliers for 'High-Frequency Resistors Model R-002B'. We need 25,000 units by next month. Current supplier 'ResistAll Inc.' has doubled their prices.",
  "What's the current inventory status of critical microcontrollers?",
  "Are there any new critical alerts on the risk heatmap for Central Asian routes?",
];

export default function ChatOpsAgentPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const initialBotMessages: Message[] = [
    { id: 'init1', text: "Hello! I'm your ChainFusion ChatOps Agent. How can I assist with your supply chain operations today?", sender: 'bot', timestamp: new Date() },
    { id: 'init2', text: "Feel free to ask about shipment risks, supplier vitality, inventory stress, or request simulations. You can also use the examples above.", sender: 'bot', timestamp: new Date(Date.now() + 100) },
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

  const handleExamplePromptClick = (promptText: string) => {
    setQuery(promptText);
    textAreaRef.current?.focus();
  };

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
    const currentQuery = query;
    setQuery('');
    setIsLoading(true);

    try {
      const result: ChatOpsBotOutput = await chatOpsBot({ query: currentQuery });
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
        text: "Sorry, I encountered an error processing your request. Please try again or rephrase your query.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
    setIsLoading(false);
    textAreaRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-1rem)] bg-background">
      <ScrollArea className="flex-1 px-4 py-2" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8 shrink-0 border bg-card shadow-sm">
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-xl px-4 py-2.5 text-sm shadow-sm ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : 'bg-card text-card-foreground rounded-bl-none'
                  }`}
                >
                  <p style={{whiteSpace: 'pre-wrap'}} className="leading-relaxed">{message.text}</p>
                </div>
                <p className={`text-xs mt-1.5 ${message.sender === 'user' ? 'text-muted-foreground/80 text-right' : 'text-muted-foreground/80 text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3 justify-start max-w-3xl mx-auto">
               <Avatar className="h-8 w-8 shrink-0 border bg-card shadow-sm">
                 <AvatarFallback><Bot size={18}/></AvatarFallback>
               </Avatar>
              <div className="rounded-xl px-4 py-2.5 text-sm bg-card text-card-foreground shadow-sm rounded-bl-none">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-4 pb-3 pt-2 sticky bottom-0 bg-background">
        {/* Example Prompts Box */}
        {!isLoading && messages.length > 0 && ( // Show only if not loading and there are messages (i.e., initial messages loaded)
          <div className="max-w-3xl mx-auto mb-2">
            <ScrollArea className="h-24 sm:h-28 w-full rounded-lg bg-muted/30 p-1.5 sm:p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                {examplePrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto py-1.5 px-2.5 justify-start text-left bg-background/70 hover:bg-muted/70 border border-border/50 shadow-sm"
                    onClick={() => handleExamplePromptClick(prompt)}
                  >
                    <MessageSquarePlus className="h-3 w-3 mr-1.5 shrink-0" /> {prompt}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex w-full items-end space-x-2 bg-card border p-2.5 rounded-xl shadow-lg">
          <Textarea
            ref={textAreaRef}
            id="message"
            placeholder="Ask the ChainFusion Agent..."
            className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] max-h-[200px] text-sm bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />
          <Button type="submit" size="icon" className="h-9 w-9 rounded-lg" disabled={isLoading || !query.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center pt-2.5">
          ChainFusion Chat-Ops Agent. AI can make mistakes. Verify critical information.
        </p>
      </div>
    </div>
  );
}
