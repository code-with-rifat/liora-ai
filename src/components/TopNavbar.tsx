'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LogOut, Menu, Settings } from 'lucide-react';
import { AI_NAME, CREATOR_NAME } from '@/lib/brand';
import { AIModelId } from '@/lib/models';
import { ModelSelect } from '@/components/ModelSelect';
import { AuthUser } from '@/components/modals/AuthModal';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  onOpenCreatorModal: () => void;
  onOpenSettings: () => void;
  activeModel: AIModelId;
  onSelectModel: (id: AIModelId) => void;
  user: AuthUser | null;
  onSignOut: () => void;
}

function Avatar({ user, size = 32 }: { user: AuthUser; size?: number }) {
  const letter = (user.name || user.email || 'U').slice(0, 1).toUpperCase();
  if (user.picture) {
    return (
      <img
        src={user.picture}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className="rounded-full bg-[#1a73e8] text-white font-medium flex items-center justify-center"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {letter}
    </div>
  );
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  onOpenCreatorModal,
  onOpenSettings,
  activeModel,
  onSelectModel,
  user,
  onSignOut,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="h-14 bg-transparent px-2.5 sm:px-5 flex items-center justify-between z-30 sticky top-0 w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0"
          title="Menu"
        >
          <Menu size={19} />
        </button>
        <button
          onClick={onOpenCreatorModal}
          className="flex flex-col text-left group cursor-pointer min-w-0"
          title={`Created by ${CREATOR_NAME}`}
        >
          <span className="font-semibold text-[15px] sm:text-[18px] tracking-tight flex items-center gap-1.5 text-[#1f1f1f] group-hover:text-[#1a73e8] transition-colors leading-tight">
            {AI_NAME}
            <span className="text-[9px] sm:text-[9.5px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-200/60">
              AI
            </span>
          </span>
          <span className="text-[9.5px] sm:text-[11px] font-medium text-zinc-500 group-hover:text-blue-600 transition-colors truncate max-w-[100px] sm:max-w-none leading-tight">
            by {CREATOR_NAME}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <ModelSelect value={activeModel} onChange={onSelectModel} compact />
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0"
          title="Settings"
        >
          <Settings size={18} />
        </button>
        {user ? (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full ring-2 ring-transparent hover:ring-[#dadce0] overflow-hidden"
              title={user.email}
            >
              <Avatar user={user} size={30} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-[290px] sm:w-[320px] bg-white rounded-[24px] sm:rounded-[28px] shadow-2xl border border-[#e8eaed] p-4 z-50">
                <div className="flex flex-col items-center text-center px-2 py-3">
                  <Avatar user={user} size={64} />
                  <p className="mt-3 text-[15px] sm:text-[16px] font-medium text-[#1f1f1f]">{user.name}</p>
                  <p className="text-xs sm:text-sm text-[#80868b] truncate w-full">{user.email}</p>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="mt-4 h-9 px-4 rounded-full border border-[#dadce0] text-xs sm:text-sm font-medium text-[#1f1f1f] hover:bg-[#f8fafc]"
                  >
                    Manage your {AI_NAME} Account
                  </button>
                </div>
                <div className="mt-2 border-t border-[#f1f3f4] pt-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-3 text-left text-sm px-3 py-2.5 rounded-2xl hover:bg-[#f1f3f4]"
                  >
                    <Settings size={16} className="text-[#444746]" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-3 text-left text-sm px-3 py-2.5 rounded-2xl hover:bg-[#f1f3f4]"
                  >
                    <LogOut size={16} className="text-[#444746]" />
                    Sign out
                  </button>
                </div>
                <p className="text-center text-[11px] text-[#80868b] mt-2 pb-1">
                  Signed in to {AI_NAME}
                </p>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/signin"
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-full border border-[#dadce0] text-xs sm:text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};
