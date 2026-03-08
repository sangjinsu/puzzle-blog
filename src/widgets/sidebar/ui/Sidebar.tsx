'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { PanelLeftClose, PanelLeft, Puzzle, Sun, Moon } from 'lucide-react';
import { NAV_ITEMS } from '@/shared/config/navigation';
import { MotionIcon } from '@/shared/ui/motion-icon';
import { cn } from '@/shared/lib/utils';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg p-2 glass md:hidden"
        aria-label="메뉴 열기"
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col bg-background border-r border-border shadow-sm transition-all duration-300',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo + Collapse toggle */}
        <div className={cn(
          'border-b border-border',
          collapsed ? 'flex flex-col items-center gap-2 py-3 px-2' : 'flex h-16 items-center gap-3 px-4'
        )}>
          <Puzzle className="h-6 w-6 shrink-0 text-primary" />
          {!collapsed && (
            <span className="text-sm font-bold text-foreground truncate">
              Puzzle Content Lab
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'hidden items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:flex',
              !collapsed && 'ml-auto'
            )}
            aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col gap-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <MotionIcon icon={Icon} className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme toggle */}
        <div className="border-t border-border p-2">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className={cn(
              'flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
              !collapsed && 'gap-3 justify-start px-3'
            )}
            aria-label={mounted && resolvedTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5 shrink-0" />
            ) : (
              <Moon className="h-5 w-5 shrink-0" />
            )}
            {!collapsed && (
              <span className="text-sm">{mounted && resolvedTheme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Spacer to push main content */}
      <div
        className={cn(
          'hidden shrink-0 transition-all duration-300 md:block',
          collapsed ? 'w-16' : 'w-60'
        )}
      />
    </>
  );
}
