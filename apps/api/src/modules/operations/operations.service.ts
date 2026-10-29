import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';

export interface Shift {
  id: string;
  tenantId: string;
  teamId?: string;
  teamName: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  hasConflict?: boolean;
  conflictReason?: string;
}

export interface TimeEntry {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  totalMinutes?: number;
  status: 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  leaveType: 'URLAUB' | 'KRANK' | 'SONDERURLAUB';
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface BonusAward {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  ruleName: string;
  amount: number;
  awardedAt: string;
  referenceId?: string;
}

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  isPinned: boolean;
  authorName: string;
  readCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  tenantId: string;
  channelId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

@Injectable()
export class OperationsService {
  private readonly inMemoryShifts: Shift[] = [];
  private readonly inMemoryTimeEntries: TimeEntry[] = [];
  private readonly inMemoryLeaves: LeaveRequest[] = [];
  private readonly inMemoryBonusAwards: BonusAward[] = [];
  private readonly inMemoryAnnouncements: Announcement[] = [];
  private readonly inMemoryMessages: ChatMessage[] = [];

  constructor(private readonly db: DatabaseService) {
    this.seedDefaultOperationsData();
  }

  private seedDefaultOperationsData() {
    const tId = '11111111-1111-1111-1111-111111111111';

    // 1. Seed Leaves
    this.inMemoryLeaves.push(
      {
        id: 'leave-1',
        tenantId: tId,
        userId: '99999999-0000-0000-0000-000000000005',
        userName: 'Umut',
        startDate: '2026-10-30',
        endDate: '2026-11-02',
        leaveType: 'URLAUB',
        reason: 'Familienurlaub',
        status: 'APPROVED',
      },
      {
        id: 'leave-2',
        tenantId: tId,
        userId: '99999999-0000-0000-0000-000000000006',
        userName: 'Erensamsun',
        startDate: '2026-11-05',
        endDate: '2026-11-06',
        leaveType: 'SONDERURLAUB',
        reason: 'Umzugstag',
        status: 'PENDING',
      }
    );

    // 2. Seed Shifts (Rota-Tafel)
    this.inMemoryShifts.push(
      {
        id: 'shift-1',
        tenantId: tId,
        teamName: 'Outbound Team Deutschland',
        userId: '99999999-0000-0000-0000-000000000005',
        userName: 'Umut',
        date: '2026-10-28',
        startTime: '09:00',
        endTime: '17:30',
        status: 'SCHEDULED',
        hasConflict: false,
      },
      {
        id: 'shift-2',
        tenantId: tId,
        teamName: 'Outbound Team Deutschland',
        userId: '99999999-0000-0000-0000-000000000006',
        userName: 'Erensamsun',
        date: '2026-10-28',
        startTime: '10:00',
        endTime: '18:30',
        status: 'SCHEDULED',
        hasConflict: false,
      },
      {
        // Conflict shift: Umut is on approved leave on 2026-10-30!
        id: 'shift-3-conflict',
        tenantId: tId,
        teamName: 'Outbound Team Deutschland',
        userId: '99999999-0000-0000-0000-000000000005',
        userName: 'Umut',
        date: '2026-10-30',
        startTime: '09:00',
        endTime: '17:30',
        status: 'SCHEDULED',
        hasConflict: true,
        conflictReason: 'Konflikt: Genehmigter Urlaub für diesen Mitarbeiter am 30.10.2026 eingetragen.',
      }
    );

    // 3. Seed Time Entries (HR-Zeit)
    this.inMemoryTimeEntries.push(
      {
        id: 'time-1',
        tenantId: tId,
        userId: '99999999-0000-0000-0000-000000000005',
        userName: 'Umut',
        clockIn: '2026-10-28T09:02:15Z',
        breakMinutes: 30,
        status: 'ACTIVE',
      },
      {
        id: 'time-2',
        tenantId: tId,
        userId: '99999999-0000-0000-0000-000000000006',
        userName: 'Erensamsun',
        clockIn: '2026-10-27T08:58:10Z',
        clockOut: '2026-10-27T17:32:00Z',
        breakMinutes: 45,
        totalMinutes: 469,
        status: 'APPROVED',
        approvedBy: 'Admin User',
      }
    );

    // 4. Seed Bonuses (Prämien)
    this.inMemoryBonusAwards.push(
      {
        id: 'bonus-1',
        tenantId: tId,
        userId: '99999999-0000-0000-0000-000000000005',
        userName: 'Umut',
        ruleName: 'Termin-Erfolgsprämie (PV Deutschland)',
        amount: 25.0,
        awardedAt: '2026-10-28T11:20:00Z',
      },
      {
        id: 'bonus-2',
        tenantId: tId,
        userId: '99999999-0000-0000-0000-000000000006',
        userName: 'Erensamsun',
        ruleName: 'Wochenziel Übererfüllung (120%)',
        amount: 75.0,
        awardedAt: '2026-10-27T16:45:00Z',
      }
    );

    // 5. Seed Announcements (Ankündigungen)
    this.inMemoryAnnouncements.push(
      {
        id: 'ann-1',
        tenantId: tId,
        title: 'Neuer Kooperationspartner: Vitalis Pflege & Mobilität KG',
        content:
          'Ab sofort können Leads für Treppenlifte und Pflegeboxen über unseren Qualitätspool direkt bundesweit vermarktet werden. Provisionen je bestätigtem Lead steigen ab KW 45.',
        isPinned: true,
        authorName: 'Geschäftsführung',
        readCount: 14,
        createdAt: '2026-10-28T08:00:00Z',
      },
      {
        id: 'ann-2',
        tenantId: tId,
        title: 'Schulung: KfW 442 Solarförderung & Einwandbehandlung',
        content:
          'Diesen Donnerstag um 14:00 Uhr findet eine 30-minütige Teams-Schulung zu den neuen KfW-Kreditrichtlinien statt. Teilnahme für alle Outbound-Agenten verpflichtend.',
        isPinned: false,
        authorName: 'Teamleiter Schulung',
        readCount: 9,
        createdAt: '2026-10-27T13:30:00Z',
      }
    );

    // 6. Seed Chat Messages
    this.inMemoryMessages.push(
      {
        id: 'msg-1',
        tenantId: tId,
        channelId: 'general',
        senderId: '99999999-0000-0000-0000-000000000005',
        senderName: 'Umut',
        message: 'Guten Morgen zusammen! Kampagne PV Bayern läuft heute sehr stark an.',
        createdAt: '2026-10-28T09:15:00Z',
      },
      {
        id: 'msg-2',
        tenantId: tId,
        channelId: 'general',
        senderId: '99999999-0000-0000-0000-000000000006',
        senderName: 'Erensamsun',
        message: 'Morgen Umut! Ja, Kontaktquote liegt bei über 35%. Viel Erfolg allen!',
        createdAt: '2026-10-28T09:17:30Z',
      }
    );
  }

  // --- Rota / Shifts with Conflict Detection ---
  public getShifts(tenantId: string): Shift[] {
    return this.inMemoryShifts.filter((s) => s.tenantId === tenantId);
  }

  public createShift(params: {
    tenantId: string;
    teamName: string;
    userId: string;
    userName: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Shift {
    // Check for approved leave on this date
    const leave = this.inMemoryLeaves.find(
      (l) =>
        l.tenantId === params.tenantId &&
        l.userId === params.userId &&
        l.status === 'APPROVED' &&
        params.date >= l.startDate &&
        params.date <= l.endDate
    );

    const hasConflict = !!leave;
    const conflictReason = leave
      ? `Konflikt: Genehmigter Urlaub (${leave.leaveType}) für ${params.userName} von ${leave.startDate} bis ${leave.endDate}.`
      : undefined;

    const shift: Shift = {
      id: `shift-${randomUUID()}`,
      tenantId: params.tenantId,
      teamName: params.teamName,
      userId: params.userId,
      userName: params.userName,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      status: 'SCHEDULED',
      hasConflict,
      conflictReason,
    };

    this.inMemoryShifts.push(shift);
    return shift;
  }

  // --- HR-Zeit Tracking ---
  public getTimeEntries(tenantId: string): TimeEntry[] {
    return this.inMemoryTimeEntries.filter((t) => t.tenantId === tenantId);
  }

  public clockIn(tenantId: string, userId: string, userName: string): TimeEntry {
    const active = this.inMemoryTimeEntries.find(
      (t) => t.tenantId === tenantId && t.userId === userId && t.status === 'ACTIVE'
    );
    if (active) {
      throw new BadRequestException('Mitarbeiter ist bereits eingestempelt.');
    }

    const entry: TimeEntry = {
      id: `time-${randomUUID()}`,
      tenantId,
      userId,
      userName,
      clockIn: new Date().toISOString(),
      breakMinutes: 0,
      status: 'ACTIVE',
    };

    this.inMemoryTimeEntries.unshift(entry);
    return entry;
  }

  public clockOut(tenantId: string, userId: string, breakMinutes = 30): TimeEntry {
    const entry = this.inMemoryTimeEntries.find(
      (t) => t.tenantId === tenantId && t.userId === userId && t.status === 'ACTIVE'
    );
    if (!entry) {
      throw new BadRequestException('Keine aktive Einstempelung gefunden.');
    }

    const now = new Date();
    const clockInTime = new Date(entry.clockIn);
    const diffMinutes = Math.max(0, Math.floor((now.getTime() - clockInTime.getTime()) / 60000));
    const totalWorkingMinutes = Math.max(0, diffMinutes - breakMinutes);

    entry.clockOut = now.toISOString();
    entry.breakMinutes = breakMinutes;
    entry.totalMinutes = totalWorkingMinutes;
    entry.status = 'PENDING';

    return entry;
  }

  public approveTimeEntry(tenantId: string, entryId: string, approvedBy: string): TimeEntry {
    const entry = this.inMemoryTimeEntries.find((t) => t.id === entryId && t.tenantId === tenantId);
    if (!entry) throw new NotFoundException(`Zeiteintrag ${entryId} nicht gefunden.`);

    entry.status = 'APPROVED';
    entry.approvedBy = approvedBy;
    return entry;
  }

  // --- Leaves (Urlaub) ---
  public getLeaves(tenantId: string): LeaveRequest[] {
    return this.inMemoryLeaves.filter((l) => l.tenantId === tenantId);
  }

  public requestLeave(params: {
    tenantId: string;
    userId: string;
    userName: string;
    startDate: string;
    endDate: string;
    leaveType: LeaveRequest['leaveType'];
    reason?: string;
  }): LeaveRequest {
    const leave: LeaveRequest = {
      id: `leave-${randomUUID()}`,
      tenantId: params.tenantId,
      userId: params.userId,
      userName: params.userName,
      startDate: params.startDate,
      endDate: params.endDate,
      leaveType: params.leaveType,
      reason: params.reason,
      status: 'PENDING',
    };

    this.inMemoryLeaves.push(leave);
    return leave;
  }

  public updateLeaveStatus(tenantId: string, leaveId: string, status: 'APPROVED' | 'REJECTED'): LeaveRequest {
    const leave = this.inMemoryLeaves.find((l) => l.id === leaveId && l.tenantId === tenantId);
    if (!leave) throw new NotFoundException(`Urlaubsantrag ${leaveId} nicht gefunden.`);

    leave.status = status;
    return leave;
  }

  // --- Bonuses (Prämien) ---
  public getBonusAwards(tenantId: string): BonusAward[] {
    return this.inMemoryBonusAwards.filter((b) => b.tenantId === tenantId);
  }

  public awardBonus(params: {
    tenantId: string;
    userId: string;
    userName: string;
    ruleName: string;
    amount: number;
    referenceId?: string;
  }): BonusAward {
    const award: BonusAward = {
      id: `bonus-${randomUUID()}`,
      tenantId: params.tenantId,
      userId: params.userId,
      userName: params.userName,
      ruleName: params.ruleName,
      amount: params.amount,
      awardedAt: new Date().toISOString(),
      referenceId: params.referenceId,
    };
    this.inMemoryBonusAwards.unshift(award);
    return award;
  }

  // --- Announcements ---
  public getAnnouncements(tenantId: string): Announcement[] {
    return this.inMemoryAnnouncements.filter((a) => a.tenantId === tenantId);
  }

  public createAnnouncement(params: {
    tenantId: string;
    title: string;
    content: string;
    isPinned: boolean;
    authorName: string;
  }): Announcement {
    const announcement: Announcement = {
      id: `ann-${randomUUID()}`,
      tenantId: params.tenantId,
      title: params.title,
      content: params.content,
      isPinned: params.isPinned,
      authorName: params.authorName,
      readCount: 1,
      createdAt: new Date().toISOString(),
    };
    this.inMemoryAnnouncements.unshift(announcement);
    return announcement;
  }

  // --- Chat ---
  public getMessages(tenantId: string, channelId = 'general'): ChatMessage[] {
    return this.inMemoryMessages.filter((m) => m.tenantId === tenantId && m.channelId === channelId);
  }

  public sendMessage(params: {
    tenantId: string;
    channelId: string;
    senderId: string;
    senderName: string;
    message: string;
  }): ChatMessage {
    const msg: ChatMessage = {
      id: `msg-${randomUUID()}`,
      tenantId: params.tenantId,
      channelId: params.channelId || 'general',
      senderId: params.senderId,
      senderName: params.senderName,
      message: params.message,
      createdAt: new Date().toISOString(),
    };
    this.inMemoryMessages.push(msg);
    return msg;
  }
}
