import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  public getUserStats(tenantId: string) {
    return [
      {
        agentId: '99999999-0000-0000-0000-000000000005',
        name: 'Umut',
        team: 'Outbound Team Deutschland',
        callsDialed: 94,
        callsAnswered: 38,
        contactRatePercent: 40.4,
        conversions: 8,
        conversionRatePercent: 21.1,
        totalTalkTimeFormatted: '02h 45m',
        avgTalkTimeSeconds: 165,
        aiQualityScore: 89,
      },
      {
        agentId: '99999999-0000-0000-0000-000000000006',
        name: 'Erensamsun',
        team: 'Outbound Team Deutschland',
        callsDialed: 88,
        callsAnswered: 34,
        contactRatePercent: 38.6,
        conversions: 6,
        conversionRatePercent: 17.6,
        totalTalkTimeFormatted: '02h 18m',
        avgTalkTimeSeconds: 152,
        aiQualityScore: 84,
      },
      {
        agentId: '99999999-0000-0000-0000-000000000002',
        name: 'Agent',
        team: 'Outbound Team Deutschland',
        callsDialed: 62,
        callsAnswered: 22,
        contactRatePercent: 35.5,
        conversions: 4,
        conversionRatePercent: 18.2,
        totalTalkTimeFormatted: '01h 32m',
        avgTalkTimeSeconds: 140,
        aiQualityScore: 81,
      },
    ];
  }

  public getTalkTimeReport(tenantId: string) {
    return {
      summary: {
        totalTalkTimeHours: 6.58,
        totalWrapTimeHours: 1.45,
        totalPauseTimeHours: 1.2,
        avgHoldTimeSeconds: 18,
      },
      agents: [
        {
          name: 'Umut',
          talkTimeMinutes: 165,
          wrapTimeMinutes: 32,
          pauseTimeMinutes: 28,
          callsHandled: 38,
          scorecardGrade: 'A',
          complianceScorePercent: 96,
        },
        {
          name: 'Erensamsun',
          talkTimeMinutes: 138,
          wrapTimeMinutes: 29,
          pauseTimeMinutes: 30,
          callsHandled: 34,
          scorecardGrade: 'B+',
          complianceScorePercent: 92,
        },
        {
          name: 'Agent',
          talkTimeMinutes: 92,
          wrapTimeMinutes: 24,
          pauseTimeMinutes: 15,
          callsHandled: 22,
          scorecardGrade: 'B',
          complianceScorePercent: 88,
        },
      ],
    };
  }
}
