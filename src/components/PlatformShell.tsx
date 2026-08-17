import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import {
  Building2,
  CircleUserRound,
  DatabaseZap,
  Gamepad2,
  LogOut,
  Settings2,
} from 'lucide-react';
import { signOut } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type NavItemId = 'pipeline' | 'games' | 'organization' | 'account' | 'settings-services';

type NavItem = {
  id: NavItemId;
  label: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: 'Services',
    items: [{ id: 'pipeline', label: 'Data Pipeline', icon: DatabaseZap }],
  },
  {
    label: 'Resources',
    items: [{ id: 'games', label: 'Games', href: '/games', icon: Gamepad2 }],
  },
  {
    label: 'Settings',
    items: [
      { id: 'organization', label: 'Organization', href: '/settings/organization', icon: Building2 },
      { id: 'account', label: 'My Account', icon: CircleUserRound },
      { id: 'settings-services', label: 'Services', icon: Settings2 },
    ],
  },
];

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const className = cn(
    'group flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition-[background-color,color,box-shadow]',
    active
      ? 'bg-primary text-primary-foreground shadow-ogd-xs'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    !item.href && 'cursor-default text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60',
  );

  const content = (
    <>
      <Icon className="size-4" />
      <span className="truncate">{item.label}</span>
    </>
  );

  if (!item.href) {
    return (
      <div className={className} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link className={className} href={item.href} aria-current={active ? 'page' : undefined}>
      {content}
    </Link>
  );
}

export function PlatformShell({
  activeItem,
  children,
  userEmail,
}: {
  activeItem: NavItemId;
  children: ReactNode;
  userEmail: string;
}) {
  return (
    <div className="min-h-svh bg-background text-foreground md:grid md:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b bg-card md:sticky md:top-0 md:h-svh md:overflow-hidden md:border-b-0 md:border-r">
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex min-h-16 shrink-0 items-center px-5">
            <Link className="flex min-w-0 items-center gap-2.5" href="/">
              <img
                src="/ogd/OGD-logotype-96.png"
                alt="Open Game Data"
                width={733}
                height={89}
                className="h-4 w-auto"
              />
              <Badge variant="outline" className="shrink-0 px-2 py-0 text-[11px]">
                Platform
              </Badge>
            </Link>
          </div>

          <Separator />

          <nav className="grid min-h-0 gap-5 overflow-y-auto px-3 py-5" aria-label="Platform navigation">
            {navSections.map((section) => (
              <section className="grid gap-2" key={section.label}>
                <h2 className="px-3 font-mono text-[11px] font-semibold uppercase text-muted-foreground">
                  {section.label}
                </h2>
                <div className="grid gap-1">
                  {section.items.map((item) => (
                    <NavRow key={item.id} item={item} active={activeItem === item.id} />
                  ))}
                </div>
              </section>
            ))}
          </nav>

          <div className="mt-auto shrink-0 border-t px-4 py-4">
            <div className="mb-3 truncate text-xs font-medium text-muted-foreground">{userEmail}</div>
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <Button className="w-full justify-start" variant="outline" type="submit">
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
