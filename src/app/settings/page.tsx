'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Save, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Tashkent');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Settings Saved',
        description: `Language set to ${language === 'en' ? 'English' : language === 'uz' ? 'Uzbek' : 'Russian'}. Timezone set to ${timezone}.`,
      });
      // Here you would typically persist these settings (e.g., localStorage, backend)
      // And potentially trigger a UI refresh or language change
      if (typeof window !== "undefined") {
        localStorage.setItem('userLanguage', language);
        localStorage.setItem('userTimezone', timezone);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage localization and other application preferences."
      />

      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle>Localization Settings</CardTitle>
          <CardDescription>Choose your preferred language and timezone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="uz">Oʻzbekcha (Uzbek)</SelectItem>
                <SelectItem value="ru">Русский (Russian)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changes to language settings may require a page refresh to take full effect.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2"><Clock className="h-4 w-4" /> Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Tashkent">Tashkent Time (GMT+5)</SelectItem>
                <SelectItem value="Europe/Moscow">Moscow Time (GMT+3)</SelectItem>
                <SelectItem value="Etc/GMT">GMT Coordinated Universal Time</SelectItem>
              </SelectContent>
            </Select>
             <p className="text-xs text-muted-foreground">
              All dates and times in the application will be displayed in this timezone.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
       <Card className="max-w-2xl mx-auto w-full mt-6">
        <CardHeader>
          <CardTitle>Application Theme</CardTitle>
          <CardDescription>Current theme is automatically selected based on your system preferences. Dark mode support is built-in.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground">
            Tashkent Vision respects your operating system's theme preference for light or dark mode.
            There is no manual toggle within the app at this time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
