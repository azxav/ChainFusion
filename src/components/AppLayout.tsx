
'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import { UserProfile } from '@/components/shared/UserProfile';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Ship,
  Users,
  Warehouse,
  Cpu,
  Truck,
  DollarSign,
  AlertTriangle as AlertTriangleIcon,
  Route,
  BarChart3,
  Network,
  Bot as BotIcon,
  Settings as SettingsIcon,
  SlidersHorizontal,
  FileText,
  RefreshCw,
  MapPin,
  ClipboardList,
  Volume2,
  TestTube2,
  Lightbulb,
  PackageSearch,
  GitFork,
  DatabaseZap,
  PanelLeft
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "flex min-w-0 flex-col gap-1 py-0.5", // Removed mx-3.5, border-l, px-2.5, translate-x-px
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
));
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & { isActive?: boolean }
>(({ className, isActive, ...props }, ref) => (
  <a
    ref={ref}
    data-sidebar="menu-sub-button"
    data-active={isActive || undefined}
    className={cn(
      "flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
      "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
      "text-sm",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
));
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";


type NavItem = {
  href?: string;
  icon: LucideIcon;
  label: string;
  isSectionTitle?: boolean;
  children?: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
};

const navItems: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { isSectionTitle: true, icon: SettingsIcon /* Placeholder */, label: 'Core Operations' },
  {
    icon: Ship, label: 'Shipments', collapsible: true, defaultOpen: true, children: [
      { href: '/shipments/risk-heatmap', icon: MapPin, label: 'Risk Heatmap' },
      { href: '/shipments/cost-time-simulator', icon: DollarSign, label: 'Cost/Time Simulator' },
      { href: '/shipments/disruption-replay', icon: AlertTriangleIcon, label: 'Disruption Replay' },
      { href: '/shipments/explainability', icon: Lightbulb, label: 'Explainability' },
    ]
  },
  {
    icon: Users, label: 'Suppliers', collapsible: true, children: [
      { href: '/suppliers/vitality-scorecards', icon: FileText, label: 'Vitality Scorecards' },
      { href: '/suppliers/alternative-sourcing', icon: PackageSearch, label: 'Alternative Sourcing' },
    ]
  },
  {
    icon: Warehouse, label: 'Inventory', collapsible: true, children: [
      { href: '/inventory/stress-indicators', icon: AlertTriangleIcon, label: 'Stress Indicators' },
      { href: '/inventory/buffer-stock', icon: RefreshCw, label: 'Buffer Stock Recs' },
      { href: '/inventory/discrepancy-resolution', icon: ClipboardList, label: 'Discrepancy Resolution' },
    ]
  },
  {
    icon: Cpu, label: 'Production & Planning', collapsible: true, children: [
      { href: '/operations/demand-forecaster', icon: BarChart3, label: 'Demand Forecaster' },
      { href: '/operations/auto-replanning', icon: GitFork, label: 'Auto-Replanning' },
      { href: '/operations/robot-tasks', icon: BotIcon, label: 'Robot Task Queues' },
      { href: '/operations/iot-network', icon: Network, label: 'IoT Network' },
      { href: '/operations/voice-alerts', icon: Volume2, label: 'Voice Alerts' },
      { href: '/operations/reinforcement-planner', icon: Route, label: 'RL Planner (Mock)' },
      { href: '/operations/load-matching', icon: Truck, label: 'Load Matching (Mock)' },
    ]
  },
  { isSectionTitle: true, icon: SettingsIcon /* Placeholder */, label: 'Analytics & AI' },
  { href: '/analytics/kpi-dashboards', icon: BarChart3, label: 'KPI Dashboards' },
  {
    icon: SlidersHorizontal, label: 'AI Models', collapsible: true, children: [
      { href: '/ai-models/data-drift', icon: DatabaseZap, label: 'Data Drift Detection' },
      { href: '/ai-models/ab-experiments', icon: TestTube2, label: 'A/B Experiments' },
    ]
  },
  { isSectionTitle: true, icon: SettingsIcon /* Placeholder */, label: 'Tools & Settings' },
  { href: '/communication/chat-ops', icon: BotIcon, label: 'Chat-Ops Bot' },
  { href: '/settings', icon: SettingsIcon, label: 'Settings (Localization)' },
];


function NavMenuItemContent({ item, pathname }: { item: NavItem; pathname: string | null }) {
  if (item.isSectionTitle) {
    return <SidebarGroupLabel className="mt-2">{item.label}</SidebarGroupLabel>;
  }
  if (!item.href) return null;

  return (
    <Link href={item.href} passHref legacyBehavior>
      <SidebarMenuButton
        isActive={pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/')}
        tooltip={{ children: item.label, side: 'right', className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
        className="w-full justify-start"
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </Link>
  );
}

function RecursiveNavItem({ item, pathname }: { item: NavItem; pathname: string | null }) {
  const [isOpen, setIsOpen] = useState(item.defaultOpen ?? false);

  if (item.isSectionTitle) {
    return <SidebarGroupLabel>{item.label}</SidebarGroupLabel>;
  }

  if (item.children && item.collapsible) {
    const isActiveParent = item.children.some(child => child.href && pathname?.startsWith(child.href));

    useEffect(() => {
      if(isActiveParent && !isOpen) {
        setIsOpen(true);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActiveParent, item.children]);

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setIsOpen(!isOpen)}
          isActive={isActiveParent}
          aria-expanded={isOpen}
          className="w-full justify-start"
          tooltip={{ children: item.label, side: 'right', className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
        </SidebarMenuButton>
        {isOpen && (
          <SidebarMenuSub>
            {item.children.map((child) => (
              <SidebarMenuSubItem key={child.label}>
                <Link href={child.href!} passHref legacyBehavior>
                  <SidebarMenuSubButton isActive={pathname === child.href}>
                    <child.icon className="h-4 w-4 shrink-0" />
                    <span>{child.label}</span>
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  if (!item.href) return null;

  return (
    <SidebarMenuItem>
      <NavMenuItemContent item={item} pathname={pathname} />
    </SidebarMenuItem>
  );
}

function LayoutInternal({ children, pathname }: { children: ReactNode; pathname: string | null }) {
  const { state: sidebarState, isMobile, toggleSidebar } = useSidebar();

  return (
    <>
      <Sidebar collapsible="icon">
         <SidebarHeader className={cn(
            "flex items-center h-14",
            // Mobile: Logo only, aligned left
            isMobile && "justify-start p-4",
            // Desktop Expanded: Logo left, Trigger right
            !isMobile && sidebarState === 'expanded' && "justify-between p-4",
            // Desktop Collapsed: Trigger only, centered
            !isMobile && sidebarState === 'collapsed' && "justify-center p-2"
          )}>
            {/* Mobile Header Content (in Sheet) */}
            {isMobile && (
              <Link href="/" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary-foreground">
                <Logo className="h-6 w-auto" />
              </Link>
            )}

            {/* Desktop Expanded Sidebar Header Content */}
            {!isMobile && sidebarState === 'expanded' && (
              <>
                <Link href="/" className="flex items-center text-sidebar-foreground hover:text-sidebar-primary-foreground">
                  <Logo className="h-6 w-auto" />
                </Link>
                <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent" />
              </>
            )}
            
            {/* Desktop Collapsed Sidebar Header Content */}
            {!isMobile && sidebarState === 'collapsed' && (
              <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent" />
            )}
          </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-full">
            <SidebarMenu>
              {navItems.map((item, index) => (
                item.isSectionTitle ? (
                  <React.Fragment key={`${item.label}-${index}`}>
                    {index > 0 && <SidebarSeparator className="my-2" />}
                    <SidebarGroup>
                      <RecursiveNavItem item={item} pathname={pathname} />
                    </SidebarGroup>
                  </React.Fragment>
                ) : item.collapsible ? (
                   <SidebarGroup key={`${item.label}-${index}`}>
                     <RecursiveNavItem item={item} pathname={pathname} />
                   </SidebarGroup>
                ) : (
                  <SidebarMenuItem key={`${item.label}-${index}`}>
                     <NavMenuItemContent item={item} pathname={pathname} />
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <SettingsIcon className="h-4 w-4" />
            <span>Help & Support</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
           {/* Mobile-only trigger in main header. Desktop trigger is now in SidebarHeader. */}
          {isMobile && <SidebarTrigger />}
          {/* For desktop, ensure there's an element to push UserProfile right if no mobile trigger */}
          {!isMobile && <div className="w-7 h-7"> {/* Placeholder for alignment, matches icon button size */}</div>}
          <div className="flex-1"></div>
          <UserProfile />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <SidebarProvider defaultOpen>
      <LayoutInternal pathname={pathname}>
        {children}
      </LayoutInternal>
    </SidebarProvider>
  );
}
