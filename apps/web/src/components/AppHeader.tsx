'use client';

import type { NotificationItem } from '@/types';
import { Bell, Car, LogOut, User as UserIcon } from 'lucide-react';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/features/auth/auth-context';

export function AppHeader() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'confirm',
      message: 'Driver found for your trip to Da Nang Bus Station',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: '2',
      type: 'cancel',
      message: 'Trip from Linh Ung Pagoda has been cancelled',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      message: 'Peak hour pricing has been updated',
      time: 'Yesterday',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header
      id="app-header"
      className="flex items-center justify-between px-6 py-3 bg-gray-950/80 backdrop-blur-md sticky top-0 z-40 transition-all border-b border-gray-800"
      style={{
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Subtle bottom gradient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent animate-pulse" />

      {/* Left side: Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md shadow-emerald-500/20 transform hover:scale-105 transition-all duration-300">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-100 leading-tight">
              CityRide{' '}
              <span className="text-xs font-normal text-emerald-400">AI</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">
              Intra-city rides in Da Nang
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  id="btn-notifications"
                  variant="ghost"
                  size="icon"
                  className="relative w-9 h-9 text-gray-400 hover:text-emerald-400 hover:bg-gray-900 rounded-lg transition-all"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse-glow" />
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-950 border border-gray-800 text-gray-200 text-xs">
              Notifications ({unreadCount})
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent
            align="end"
            className="w-80 bg-gray-950 border border-gray-800 text-gray-100 rounded-xl p-1 shadow-lg shadow-black/50"
          >
            <div className="flex items-center justify-between p-3">
              <span className="font-bold text-sm text-gray-200">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-emerald-400 hover:text-emerald-350 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <DropdownMenuSeparator className="bg-gray-850" />
            <div className="max-h-60 overflow-y-auto py-1">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No notifications.
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className={`flex flex-col items-start gap-1 p-3 rounded-lg focus:bg-gray-900/60 cursor-pointer transition-colors ${
                      !n.read
                        ? 'bg-emerald-950/10 border-l-2 border-emerald-500'
                        : ''
                    }`}
                  >
                    <div className="text-xs text-gray-200 font-medium leading-normal">
                      {n.message}
                    </div>
                    <div className="text-[10px] text-gray-550">{n.time}</div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden bg-gray-900 border border-gray-850 hover:border-emerald-500/50 transition-all cursor-pointer">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-emerald-400">
                    {user.displayName ? (
                      user.displayName.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-gray-950 border border-gray-800 text-gray-100 rounded-xl p-1 shadow-lg shadow-black/50"
            >
              <div className="px-3 py-2 text-xs border-b border-gray-900 mb-1">
                <p className="font-semibold text-gray-200 truncate">
                  {user.displayName || 'User'}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 focus:bg-red-950/20 focus:text-red-400 cursor-pointer rounded-lg p-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
