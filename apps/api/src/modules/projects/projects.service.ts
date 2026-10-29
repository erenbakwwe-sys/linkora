import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { SEEDED_PRODUCTS, ProductDefinition } from '@linkora/shared';

export interface ProjectTypeItem {
  id: string;
  name: string;
  isGlobal: boolean;
}

export interface ProjectManagementData {
  activeCompany: string;
  activeProjectTypes: ProjectTypeItem[];
  availableGlobalTypes: string[];
  teamDistribution: Record<string, string[]>;
  leadStats: {
    totalLeads: number;
    companyName: string;
    items: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
  };
}

@Injectable()
export class ProjectsService {
  private activeCompany = 'Calendra';

  private activeProjectTypes: ProjectTypeItem[] = [
    { id: 'p-1', name: 'ARH Photovoltaik', isGlobal: true },
    { id: 'p-2', name: 'DA Photovoltaik', isGlobal: true },
    { id: 'p-3', name: 'NV Photovoltaik', isGlobal: true },
    { id: 'p-4', name: 'LS Photovoltaik', isGlobal: true },
    { id: 'p-5', name: 'ARH Treppenlift', isGlobal: true },
    { id: 'p-6', name: 'DA Treppenlift', isGlobal: true },
    { id: 'p-7', name: 'NV Treppenlift', isGlobal: true },
    { id: 'p-8', name: 'LS Treppenlift', isGlobal: true },
    { id: 'p-9', name: 'ARH Wärmepumpe', isGlobal: true },
    { id: 'p-10', name: 'DA Wärmepumpe', isGlobal: true },
    { id: 'p-11', name: 'NV Wärmepumpe', isGlobal: true },
    { id: 'p-12', name: 'LS Wärmepumpe', isGlobal: true },
  ];

  private availableGlobalTypes: string[] = [
    'Badsanierung',
    'ARH Badsanierung',
    'Elektromobil / Elektrorollstuhl',
    'ARH Elektromobil / Elektrorollstuhl',
    'Lift',
    'Pflegebox',
    'PV',
    'PV-FB',
    'PV-G',
    'WF Photovoltaik',
    'PV-WP Termin',
    'Treppenlift',
    'WF Treppenlift',
    'WP',
    'WF Wärmepumpe',
  ];

  private teamDistribution: Record<string, string[]> = {
    'MD-Team': ['p-1', 'p-2', 'p-5'],
    'Testcalendra': ['p-5', 'p-6', 'p-9'],
    'Izmir Core': ['p-1', 'p-2', 'p-3', 'p-4', 'p-5'],
    'Solar Direkt': ['p-1', 'p-2', 'p-3', 'p-4'],
  };

  private leadStats = {
    totalLeads: 469,
    companyName: 'Calendra',
    items: [
      { name: 'PV-DAA', count: 1, percentage: 0.2 },
      { name: 'Treppenlift-Aroundhome', count: 396, percentage: 84.4 },
      { name: 'Treppenlift-Leadnavigator', count: 0, percentage: 0 },
      { name: 'Treppenlift-Leadnodes', count: 3, percentage: 0.6 },
      { name: 'WP-Aroundhome', count: 1, percentage: 0.2 },
    ],
  };

  constructor(private db: DatabaseService) {}

  getProjectManagementData(companyName?: string): ProjectManagementData {
    return {
      activeCompany: companyName || this.activeCompany,
      activeProjectTypes: this.activeProjectTypes,
      availableGlobalTypes: this.availableGlobalTypes,
      teamDistribution: this.teamDistribution,
      leadStats: this.leadStats,
    };
  }

  addCustomProjectType(name: string): ProjectTypeItem {
    const trimmed = name.trim();
    const newItem: ProjectTypeItem = {
      id: 'custom-' + Date.now(),
      name: trimmed,
      isGlobal: false,
    };
    this.activeProjectTypes.push(newItem);
    return newItem;
  }

  activateGlobalProjectTypes(names: string[]): ProjectTypeItem[] {
    const added: ProjectTypeItem[] = [];
    for (const n of names) {
      const exists = this.activeProjectTypes.some(
        (p) => p.name.toLowerCase() === n.toLowerCase()
      );
      if (!exists) {
        const item: ProjectTypeItem = {
          id: 'global-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: n,
          isGlobal: true,
        };
        this.activeProjectTypes.push(item);
        added.push(item);
      }
    }
    return added;
  }

  removeProjectType(id: string): boolean {
    const idx = this.activeProjectTypes.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.activeProjectTypes.splice(idx, 1);
      // Clean up team assignments
      for (const team in this.teamDistribution) {
        this.teamDistribution[team] = this.teamDistribution[team].filter((tid) => tid !== id);
      }
      return true;
    }
    return false;
  }

  assignTeamProjectTypes(teamName: string, projectIds: string[]) {
    this.teamDistribution[teamName] = projectIds;
    return this.teamDistribution[teamName];
  }

  async listProjects(tenantId: string) {
    try {
      const res = await this.db.query(
        `SELECT id, name, slug, description, icon, is_active FROM projects WHERE tenant_id = $1 OR tenant_id = '11111111-1111-1111-1111-111111111111' ORDER BY name ASC`,
        [tenantId]
      );
      if (res.rows.length > 0) {
        return res.rows;
      }
    } catch {
      // Fallback
    }

    return SEEDED_PRODUCTS.map((p, idx) => ({
      id: `cccccccc-0000-0000-0000-${(idx + 1).toString().padStart(12, '0')}`,
      name: p.name,
      slug: p.slug,
      description: p.description,
      icon: p.icon,
      category: p.category,
      isActive: true,
      questionCount: p.questions.length,
    }));
  }

  async getProjectWithQuestionnaire(projectId: string, tenantId: string) {
    try {
      const projRes = await this.db.query(
        `SELECT id, name, slug, description, icon FROM projects WHERE id = $1`,
        [projectId]
      );
      if (projRes.rows.length > 0) {
        const project = projRes.rows[0];
        const questRes = await this.db.query(
          `SELECT q.id as quest_id, qv.id as version_id, qv.version, qv.status
           FROM questionnaires q
           JOIN questionnaire_versions qv ON qv.questionnaire_id = q.id
           WHERE q.project_id = $1 AND qv.status = 'PUBLISHED'
           ORDER BY qv.version DESC LIMIT 1`,
          [projectId]
        );

        let questions: any[] = [];
        if (questRes.rows.length > 0) {
          const versionId = questRes.rows[0].version_id;
          const questionsRes = await this.db.query(
            `SELECT id, code, label, input_type, options, is_required, order_index
             FROM questions
             WHERE questionnaire_version_id = $1
             ORDER BY order_index ASC`,
            [versionId]
          );
          questions = questionsRes.rows;
        }

        return {
          ...project,
          questionnaire: questRes.rows[0] || null,
          questions,
        };
      }
    } catch {
      // DB offline fallback
    }

    const foundIndex = SEEDED_PRODUCTS.findIndex(
      (p, idx) =>
        projectId === `cccccccc-0000-0000-0000-${(idx + 1).toString().padStart(12, '0')}` ||
        p.slug === projectId ||
        p.name.toLowerCase() === projectId.toLowerCase()
    );

    if (foundIndex !== -1) {
      const prod = SEEDED_PRODUCTS[foundIndex];
      return {
        id: `cccccccc-0000-0000-0000-${(foundIndex + 1).toString().padStart(12, '0')}`,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        icon: prod.icon,
        category: prod.category,
        questionnaire: {
          version: 1,
          status: 'PUBLISHED',
        },
        questions: prod.questions.map((q, qIdx) => ({
          id: `ffffffff-${(foundIndex + 1).toString().padStart(4, '0')}-0000-0000-${(qIdx + 1).toString().padStart(12, '0')}`,
          code: q.code,
          label: q.label,
          input_type: q.inputType,
          options: q.options || null,
          is_required: q.isRequired,
          order_index: q.orderIndex,
        })),
      };
    }

    throw new NotFoundException(`Project with ID ${projectId} not found`);
  }
}
