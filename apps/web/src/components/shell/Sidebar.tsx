'use client';

import React, { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useSidebar } from '@/context/SidebarContext';
import {
  SlidersHorizontal,
  Search,
  LayoutDashboard,
  Headphones,
  PhoneCall,
  CalendarDays,
  FileSpreadsheet,
  Tv,
  Clock,
  ShieldCheck,
  UserCheck,
  FolderKanban,
  Database,
  Inbox,
  Sliders,
  CircleDot,
  Banknote,
  Wallet,
  PhoneOutgoing,
  BarChart3,
  Filter,
  Timer,
  Users,
  UserPlus,
  Network,
  Building,
  Image as ImageIcon,
  MessageCircle,
  Megaphone,
  Calendar,
  Trophy,
  User,
  Upload,
  Sparkles,
  Gem,
  Building2,
  Tags,
  RotateCcw,
  Webhook,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';

interface MenuItem {
  id: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  href: string;
}

interface MenuGroup {
  id: string;
  titleKey: string;
  items: MenuItem[];
}

export const Sidebar: React.FC = () => {
  const { tenant } = useAuth();
  const { t } = useI18n();
  const { isOpen, close } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const menuGroups: MenuGroup[] = useMemo(
    () => [
      {
        id: 'ARBEIT',
        titleKey: 'menu.groups.ARBEIT',
        items: [
          { id: 'call_screen', labelKey: 'menu.items.call_screen', icon: Headphones, iconColor: 'text-emerald-500', href: '/call-screen' },
          { id: 'callbacks', labelKey: 'menu.items.callbacks', icon: PhoneCall, iconColor: 'text-sky-500', href: '/callbacks' },
          { id: 'rota', labelKey: 'menu.items.rota', icon: CalendarDays, iconColor: 'text-indigo-500', href: '/rota' },
          { id: 'excel_import', labelKey: 'menu.items.excel_import', icon: FileSpreadsheet, iconColor: 'text-emerald-600', href: '/excel' },
          { id: 'wallboard', labelKey: 'menu.items.wallboard', icon: Tv, iconColor: 'text-rose-500', href: '/wallboard' },
          { id: 'hr_time', labelKey: 'menu.items.hr_time', icon: Clock, iconColor: 'text-amber-500', href: '/hr-time' },
        ],
      },
      {
        id: 'MANAGEMENT',
        titleKey: 'menu.groups.MANAGEMENT',
        items: [
          { id: 'leads', labelKey: 'menu.items.leads', icon: Database, iconColor: 'text-blue-600', href: '/leads' },
          { id: 'qc', labelKey: 'menu.items.qc', icon: ShieldCheck, iconColor: 'text-teal-600', href: '/qc' },
          { id: 'tr_assist', labelKey: 'menu.items.tr_assist', icon: UserCheck, iconColor: 'text-violet-600', href: '/tr-assist' },
          { id: 'projects', labelKey: 'menu.items.projects', icon: FolderKanban, iconColor: 'text-amber-600', href: '/projects' },
          { id: 'campaigns', labelKey: 'menu.items.campaigns', icon: Inbox, iconColor: 'text-pink-500', href: '/campaigns' },
          { id: 'auto_dial', labelKey: 'menu.items.auto_dial', icon: Sliders, iconColor: 'text-indigo-600', href: '/auto-dial-settings' },
          { id: 'recordings', labelKey: 'menu.items.recordings', icon: CircleDot, iconColor: 'text-red-500', href: '/recordings' },
        ],
      },
      {
        id: 'FINANZEN',
        titleKey: 'menu.groups.FINANZEN',
        items: [
          { id: 'cash_income', labelKey: 'menu.items.cash_income', icon: Banknote, iconColor: 'text-emerald-600', href: '/cash-income' },
          { id: 'balance_costs', labelKey: 'menu.items.balance_costs', icon: Wallet, iconColor: 'text-teal-600', href: '/balance-costs' },
          { id: 'call_overview', labelKey: 'menu.items.call_overview', icon: PhoneOutgoing, iconColor: 'text-sky-600', href: '/call-overview' },
        ],
      },
      {
        id: 'BERICHTE',
        titleKey: 'menu.groups.BERICHTE',
        items: [
          { id: 'user_stats', labelKey: 'menu.items.user_stats', icon: BarChart3, iconColor: 'text-indigo-600', href: '/user-stats' },
          { id: 'analytics_calibration', labelKey: 'menu.items.analytics_calibration', icon: Filter, iconColor: 'text-cyan-600', href: '/analytics-calibration' },
          { id: 'talk_time_report', labelKey: 'menu.items.talk_time_report', icon: Timer, iconColor: 'text-amber-600', href: '/talk-time-report' },
        ],
      },
      {
        id: 'ADMINISTRATION',
        titleKey: 'menu.groups.ADMINISTRATION',
        items: [
          { id: 'users', labelKey: 'menu.items.users', icon: Users, iconColor: 'text-blue-500', href: '/users' },
          { id: 'company_management', labelKey: 'menu.items.company_management', icon: Building, iconColor: 'text-emerald-600', href: '/company-management' },
          { id: 'branding', labelKey: 'menu.items.branding', icon: ImageIcon, iconColor: 'text-purple-500', href: '/branding' },
          { id: 'chat', labelKey: 'menu.items.chat', icon: MessageCircle, iconColor: 'text-sky-500', href: '/chat' },
          { id: 'announcements', labelKey: 'menu.items.announcements', icon: Megaphone, iconColor: 'text-orange-500', href: '/announcements' },
          { id: 'vacation', labelKey: 'menu.items.vacation', icon: Calendar, iconColor: 'text-emerald-500', href: '/vacation' },
          { id: 'bonuses', labelKey: 'menu.items.bonuses', icon: Trophy, iconColor: 'text-amber-500', href: '/bonuses' },
        ],
      },
      {
        id: 'HANDELSPLATZ',
        titleKey: 'menu.groups.HANDELSPLATZ',
        items: [
          { id: 'buyers', labelKey: 'menu.items.buyers', icon: Building2, iconColor: 'text-blue-600', href: '/buyers' },
          { id: 'quality_pool', labelKey: 'menu.items.quality_pool', icon: Sparkles, iconColor: 'text-amber-500', href: '/quality-pool' },
          { id: 'returns', labelKey: 'menu.items.returns', icon: RotateCcw, iconColor: 'text-rose-500', href: '/returns' },
          { id: 'api_webhooks', labelKey: 'menu.items.api_webhooks', icon: Webhook, iconColor: 'text-violet-600', href: '/api-webhooks' },
        ],
      },
    ],
    []
  );

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return menuGroups;
    const q = searchQuery.toLowerCase();
    return menuGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => t(item.labelKey).toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [menuGroups, searchQuery, t]);

  const isCurrentActive = (href: string, id: string) => {
    if (id === 'dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname === href;
  };

  const handleNavigate = (href: string) => {
    if (href && href !== '#') {
      router.push(href);
      close();
    }
  };

  const renderMenuContent = () => (
    <>
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2">
        <div
          onClick={() => handleNavigate('/dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 transition group"
          title="Zum Dashboard"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
            {tenant?.branding?.brand_name?.[0] || 'L'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm tracking-tight truncate max-w-[130px]">
              {tenant?.branding?.brand_name || 'Linkora'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium -mt-0.5">Control Center</span>
          </div>
        </div>

        <button
          title="Menü anpassen"
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Search Field */}
      <div className="relative mb-3 px-1">
        <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('common.search_menu')}
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 focus:bg-white transition-all shadow-inner"
        />
      </div>

      {/* Dashboard Button */}
      <div className="px-1 mb-2">
        <button
          onClick={() => handleNavigate('/dashboard')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer group ${
            pathname === '/dashboard' || pathname === '/'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-[0.99]'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 transition-transform group-hover:scale-110 ${
            pathname === '/dashboard' || pathname === '/' ? 'text-white' : 'text-sky-600'
          }`} />
          <span>{t('menu.dashboard')}</span>
        </button>
      </div>

      {/* Collapsible Menu Groups List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
        {filteredGroups.map((group) => {
          const isCollapsed = collapsedGroups[group.id];
          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider transition cursor-pointer select-none"
              >
                <div className="flex items-center space-x-1.5">
                  <span>{t(group.titleKey)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({group.items.length})
                  </span>
                </div>
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Group Items */}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = isCurrentActive(item.href, item.id);
                    const itemLabel = t(item.labelKey);

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.href)}
                        title={itemLabel}
                        className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 group relative cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-sky-50 to-indigo-50/50 text-sky-950 font-bold border-l-4 border-sky-500 shadow-xs pl-2.5'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 hover:translate-x-1 active:scale-[0.99] font-medium'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-120 ${item.iconColor}`} />
                        <span className="truncate">{itemLabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 p-3 flex-col select-none">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200/90 p-3 flex-1 flex flex-col h-[calc(100vh-4.5rem)] overflow-hidden transition-all">
          {renderMenuContent()}
        </div>
      </aside>

      {/* Mobile Slide-Out Drawer (visible on mobile when open) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl p-3 flex flex-col z-50 animate-in slide-in-from-left duration-250 select-none">
            {/* Top Close Bar */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Navigation</span>
              <button
                onClick={close}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                aria-label="Menü schließen"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {renderMenuContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
