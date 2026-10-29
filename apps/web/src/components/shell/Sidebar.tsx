'use client';

import React, { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
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
          { id: 'rota', labelKey: 'menu.items.rota', icon: CalendarDays, iconColor: 'text-amber-500', href: '/rota' },
          { id: 'excel', labelKey: 'menu.items.excel', icon: FileSpreadsheet, iconColor: 'text-emerald-600', href: '/excel' },
          { id: 'wallboard', labelKey: 'menu.items.wallboard', icon: Tv, iconColor: 'text-teal-600', href: '/wallboard' },
          { id: 'tr_assist', labelKey: 'menu.items.tr_assist', icon: Sparkles, iconColor: 'text-amber-500', href: '/tr-assist' },
          { id: 'hr_time', labelKey: 'menu.items.hr_time', icon: Clock, iconColor: 'text-cyan-500', href: '/hr-time' },
        ],
      },
      {
        id: 'LEADS_KUNDEN',
        titleKey: 'menu.groups.LEADS_KUNDEN',
        items: [
          { id: 'lead_customers', labelKey: 'menu.items.lead_customers', icon: UserCheck, iconColor: 'text-rose-500', href: '/leads' },
          { id: 'qc_queue', labelKey: 'menu.items.qc_queue', icon: ShieldCheck, iconColor: 'text-purple-600', href: '/qc' },
        ],
      },
      {
        id: 'PROJEKTE_FRAGEN',
        titleKey: 'menu.groups.PROJEKTE_FRAGEN',
        items: [
          { id: 'project_management', labelKey: 'menu.items.project_management', icon: FolderKanban, iconColor: 'text-purple-500', href: '/projects' },
        ],
      },
      {
        id: 'CALL_CENTER_DIALER',
        titleKey: 'menu.groups.CALL_CENTER_DIALER',
        items: [
          { id: 'database', labelKey: 'menu.items.database', icon: Database, iconColor: 'text-teal-500', href: '/leads' },
          { id: 'campaigns', labelKey: 'menu.items.campaigns', icon: Inbox, iconColor: 'text-purple-600', href: '/campaigns' },
          { id: 'auto_dial_settings', labelKey: 'menu.items.auto_dial_settings', icon: Sliders, iconColor: 'text-indigo-500', href: '/auto-dial-settings' },
          { id: 'call_recordings', labelKey: 'menu.items.call_recordings', icon: CircleDot, iconColor: 'text-rose-600', href: '/recordings' },
        ],
      },
      {
        id: 'FINANZEN',
        titleKey: 'menu.groups.FINANZEN',
        items: [
          { id: 'cash_income', labelKey: 'menu.items.cash_income', icon: Banknote, iconColor: 'text-emerald-600', href: '/cash-income' },
          { id: 'balance_costs', labelKey: 'menu.items.balance_costs', icon: Wallet, iconColor: 'text-emerald-500', href: '/balance-costs' },
          { id: 'call_overview', labelKey: 'menu.items.call_overview', icon: PhoneOutgoing, iconColor: 'text-amber-600', href: '/call-overview' },
        ],
      },
      {
        id: 'BERICHTE',
        titleKey: 'menu.groups.BERICHTE',
        items: [
          { id: 'user_stats', labelKey: 'menu.items.user_stats', icon: BarChart3, iconColor: 'text-blue-500', href: '/user-stats' },
          { id: 'analytics_conversion', labelKey: 'menu.items.analytics_conversion', icon: Filter, iconColor: 'text-teal-600', href: '/analytics-calibration' },
          { id: 'talk_time_report', labelKey: 'menu.items.talk_time_report', icon: Timer, iconColor: 'text-cyan-600', href: '/talk-time-report' },
        ],
      },
      {
        id: 'BENUTZER',
        titleKey: 'menu.groups.BENUTZER',
        items: [
          { id: 'user_management', labelKey: 'menu.items.user_management', icon: Users, iconColor: 'text-indigo-600', href: '/users' },
          { id: 'new_user', labelKey: 'menu.items.new_user', icon: UserPlus, iconColor: 'text-emerald-500', href: '/users' },
          { id: 'new_team', labelKey: 'menu.items.new_team', icon: Network, iconColor: 'text-amber-500', href: '/users' },
          { id: 'company_management', labelKey: 'menu.items.company_management', icon: Building, iconColor: 'text-amber-600', href: '/company-management' },
          { id: 'company_logo', labelKey: 'menu.items.company_logo', icon: ImageIcon, iconColor: 'text-indigo-500', href: '/branding' },
        ],
      },
      {
        id: 'ALLGEMEIN',
        titleKey: 'menu.groups.ALLGEMEIN',
        items: [
          { id: 'chat', labelKey: 'menu.items.chat', icon: MessageCircle, iconColor: 'text-sky-500', href: '/chat' },
          { id: 'announcements', labelKey: 'menu.items.announcements', icon: Megaphone, iconColor: 'text-rose-500', href: '/announcements' },
          { id: 'vacation', labelKey: 'menu.items.vacation', icon: Calendar, iconColor: 'text-amber-500', href: '/vacation' },
          { id: 'bonuses', labelKey: 'menu.items.bonuses', icon: Trophy, iconColor: 'text-amber-600', href: '/bonuses' },
          { id: 'profile', labelKey: 'menu.items.profile', icon: User, iconColor: 'text-slate-600', href: '/branding' },
        ],
      },
      {
        id: 'LEAD_MARKTPLATZ',
        titleKey: 'menu.groups.LEAD_MARKTPLATZ',
        items: [
          { id: 'lead_upload', labelKey: 'menu.items.lead_upload', icon: Upload, iconColor: 'text-indigo-600', href: '/excel' },
          { id: 'ai_matching', labelKey: 'menu.items.ai_matching', icon: Sparkles, iconColor: 'text-purple-600', href: '/quality-pool' },
          { id: 'quality_pool', labelKey: 'menu.items.quality_pool', icon: Gem, iconColor: 'text-teal-600', href: '/quality-pool' },
          { id: 'buyers', labelKey: 'menu.items.buyers', icon: Building2, iconColor: 'text-blue-600', href: '/buyers' },
          { id: 'price_lists', labelKey: 'menu.items.price_lists', icon: Tags, iconColor: 'text-emerald-600', href: '/buyers' },
          { id: 'returns_credits', labelKey: 'menu.items.returns_credits', icon: RotateCcw, iconColor: 'text-rose-600', href: '/returns' },
          { id: 'api_webhooks', labelKey: 'menu.items.api_webhooks', icon: Webhook, iconColor: 'text-cyan-600', href: '/api-webhooks' },
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
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 p-3 flex flex-col select-none">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200/90 p-3 flex-1 flex flex-col h-[calc(100vh-4.5rem)] overflow-hidden transition-all">
        {/* Brand Header & Customize Sliders */}
        <div className="flex items-center justify-between px-2 py-1.5 mb-2">
          <div
            onClick={() => router.push('/dashboard')}
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

        {/* Search Field: "Im Menü suchen..." */}
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

        {/* Navigation Item: Dashboard (Active Pill) */}
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
                {/* Group Header: Title + Count + Chevron */}
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
      </div>
    </aside>
  );
};
