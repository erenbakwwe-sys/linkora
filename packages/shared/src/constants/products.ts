export interface ProductDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'ENERGY' | 'HOME_IMPROVEMENT' | 'HEALTH_CARE' | 'UTILITIES';
  questions: Array<{
    code: string;
    label: string;
    inputType: 'TEXT' | 'SELECT' | 'MULTI_SELECT' | 'NUMBER' | 'BOOLEAN';
    options?: Array<{ label: string; value: string }>;
    isRequired: boolean;
    orderIndex: number;
  }>;
}

export const SEEDED_PRODUCTS: ProductDefinition[] = [
  {
    slug: 'photovoltaik',
    name: 'Photovoltaik',
    description: 'Solaranlagen für Eigenheime und Gewerbe mit Speicher und Einspeisevergütung',
    icon: 'Sun',
    category: 'ENERGY',
    questions: [
      {
        code: 'PROPERTY_OWNERSHIP',
        label: 'Sind Sie Eigentümer der Immobilie?',
        inputType: 'SELECT',
        options: [
          { label: 'Ja, Alleineigentümer', value: 'OWNER' },
          { label: 'Ja, Miteigentümer / Gemeinschaft', value: 'CO_OWNER' },
          { label: 'Nein, Mieter', value: 'TENANT' },
        ],
        isRequired: true,
        orderIndex: 1,
      },
      {
        code: 'ROOF_TYPE',
        label: 'Welche Dachform hat das Gebäude?',
        inputType: 'SELECT',
        options: [
          { label: 'Satteldach', value: 'SATTELDACH' },
          { label: 'Flachdach', value: 'FLACHDACH' },
          { label: 'Pultdach', value: 'PULTDACH' },
          { label: 'Walmdach', value: 'WALMDACH' },
        ],
        isRequired: true,
        orderIndex: 2,
      },
      {
        code: 'ANNUAL_CONSUMPTION',
        label: 'Jährlicher Stromverbrauch (kWh)?',
        inputType: 'NUMBER',
        isRequired: true,
        orderIndex: 3,
      },
      {
        code: 'BATTERY_STORAGE',
        label: 'Wird ein Batteriespeicher gewünscht?',
        inputType: 'BOOLEAN',
        isRequired: false,
        orderIndex: 4,
      },
    ],
  },
  {
    slug: 'waermepumpe',
    name: 'Wärmepumpe',
    description: 'Moderne Luft-Wasser- und Erdwärmepumpen für Heizung und Warmwasser',
    icon: 'Flame',
    category: 'ENERGY',
    questions: [
      {
        code: 'BUILDING_YEAR',
        label: 'Baujahr der Immobilie?',
        inputType: 'NUMBER',
        isRequired: true,
        orderIndex: 1,
      },
      {
        code: 'CURRENT_HEATING',
        label: 'Aktuelle Heizungsart?',
        inputType: 'SELECT',
        options: [
          { label: 'Gasheizung', value: 'GAS' },
          { label: 'Ölheizung', value: 'OIL' },
          { label: 'Pellet / Holz', value: 'WOOD' },
          { label: 'Nachtspeicher / Strom', value: 'ELECTRIC' },
        ],
        isRequired: true,
        orderIndex: 2,
      },
      {
        code: 'LIVING_SPACE_SQM',
        label: 'Beheizte Wohnfläche in m²?',
        inputType: 'NUMBER',
        isRequired: true,
        orderIndex: 3,
      },
      {
        code: 'INSULATION_STATUS',
        label: 'Dämmzustand des Hauses?',
        inputType: 'SELECT',
        options: [
          { label: 'Voll gedämmt / Neubau', value: 'EXCELLENT' },
          { label: 'Teilweise gedämmt', value: 'MODERATE' },
          { label: 'Ungedämmt / Altbau', value: 'POOR' },
        ],
        isRequired: false,
        orderIndex: 4,
      },
    ],
  },
  {
    slug: 'treppenlift',
    name: 'Treppenlift',
    description: 'Barrierefreie Mobilitätslösungen für kurvige und gerade Treppen',
    icon: 'MoveUp',
    category: 'HEALTH_CARE',
    questions: [
      {
        code: 'STAIR_TYPE',
        label: 'Treppenverlauf?',
        inputType: 'SELECT',
        options: [
          { label: 'Gerade Treppe', value: 'STRAIGHT' },
          { label: 'Kurvige Treppe / Podest', value: 'CURVED' },
          { label: 'Außentreppe', value: 'OUTDOOR' },
        ],
        isRequired: true,
        orderIndex: 1,
      },
      {
        code: 'NUMBER_OF_FLOORS',
        label: 'Anzahl der Etagen?',
        inputType: 'NUMBER',
        isRequired: true,
        orderIndex: 2,
      },
      {
        code: 'CARE_LEVEL',
        label: 'Liegt ein Pflegegrad vor (Zuschuss bis 4.000 €)?',
        inputType: 'SELECT',
        options: [
          { label: 'Ja, Pflegegrad 1-2', value: 'LEVEL_1_2' },
          { label: 'Ja, Pflegegrad 3-5', value: 'LEVEL_3_5' },
          { label: 'Beantragt / Noch offen', value: 'PENDING' },
          { label: 'Nein / Kein Pflegegrad', value: 'NONE' },
        ],
        isRequired: true,
        orderIndex: 3,
      },
    ],
  },
  {
    slug: 'energieberatung',
    name: 'Energieberatung',
    description: 'Geförderter individueller Sanierungsfahrplan (iSFP) für Bestandsgebäude',
    icon: 'FileCheck',
    category: 'ENERGY',
    questions: [
      {
        code: 'BUILDING_TYPE',
        label: 'Gebäudetyp?',
        inputType: 'SELECT',
        options: [
          { label: 'Einfamilienhaus', value: 'EFH' },
          { label: 'Zweifamilienhaus', value: 'ZFH' },
          { label: 'Mehrfamilienhaus', value: 'MFH' },
        ],
        isRequired: true,
        orderIndex: 1,
      },
      {
        code: 'DESIRED_MEASURES',
        label: 'Geplante Sanierungsmaßnahmen?',
        inputType: 'MULTI_SELECT',
        options: [
          { label: 'Heizungstausch', value: 'HEATING' },
          { label: 'Dachdämmung', value: 'ROOF' },
          { label: 'Fassadendämmung', value: 'FACADE' },
          { label: 'Fenstertausch', value: 'WINDOWS' },
        ],
        isRequired: false,
        orderIndex: 2,
      },
    ],
  },
  {
    slug: 'fenster-sanierung',
    name: 'Fenster & Sanierung',
    description: 'Hochwärmedämmende Fenster, Haustüren und energetische Gebäudesanierung',
    icon: 'Grid',
    category: 'HOME_IMPROVEMENT',
    questions: [
      {
        code: 'WINDOW_COUNT',
        label: 'Geschätzte Anzahl der Fenster?',
        inputType: 'NUMBER',
        isRequired: true,
        orderIndex: 1,
      },
      {
        code: 'GLAZING_PREFERENCE',
        label: 'Gewünschte Verglasung?',
        inputType: 'SELECT',
        options: [
          { label: '3-fach Wärmeschutzverglasung', value: 'TRIPLE' },
          { label: '2-fach Isolierverglasung', value: 'DOUBLE' },
          { label: 'Beratung erforderlich', value: 'CONSULT' },
        ],
        isRequired: false,
        orderIndex: 2,
      },
    ],
  },
  {
    slug: 'strom',
    name: 'Strom',
    description: 'Günstige Ökostrom- und Gewerbestromtarife mit Preisgarantie',
    icon: 'Zap',
    category: 'UTILITIES',
    questions: [
      {
        code: 'YEARLY_KWH',
        label: 'Jährlicher Stromverbrauch (kWh)?',
        inputType: 'NUMBER',
        isRequired: true,
        orderIndex: 1,
      },
      {
        code: 'CURRENT_PROVIDER',
        label: 'Aktueller Stromanbieter / Grundversorger?',
        inputType: 'TEXT',
        isRequired: false,
        orderIndex: 2,
      },
    ],
  },
  {
    slug: 'gas',
    name: 'Gas',
    description: 'Erdgas- und Biogastarife für Haushalts- und Gewerbekunden',
    icon: 'Wind',
    category: 'UTILITIES',
    questions: [
      {
        code: 'YEARLY_GAS_KWH',
        label: 'Jährlicher Gasverbrauch (kWh oder m³)?',
        inputType: 'NUMBER',
        isRequired: true,
        orderIndex: 1,
      },
      {
        code: 'CURRENT_GAS_PROVIDER',
        label: 'Aktueller Gasanbieter?',
        inputType: 'TEXT',
        isRequired: false,
        orderIndex: 2,
      },
    ],
  },
  {
    slug: 'pflegebox',
    name: 'Pflegebox',
    description: 'Kostenlose monatliche Pflegehilfsmittel im Wert von bis zu 40 € (gem. § 40 SGB XI)',
    icon: 'HeartHandshake',
    category: 'HEALTH_CARE',
    questions: [
      {
        code: 'CARE_LEVEL_CONFIRMED',
        label: 'Besteht ein anerkannter Pflegegrad (1-5)?',
        inputType: 'BOOLEAN',
        isRequired: true,
        orderIndex: 1,
      },
      {
        code: 'CARE_SITUATION',
        label: 'Wird die Person im häuslichen Umfeld gepflegt?',
        inputType: 'BOOLEAN',
        isRequired: true,
        orderIndex: 2,
      },
    ],
  },
];
