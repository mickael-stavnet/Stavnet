export const ADMIN_ENTITY_TYPES = ["books", "persons", "organizations"] as const;

export type AdminEntityType = (typeof ADMIN_ENTITY_TYPES)[number];

export interface AdminRecord {
  id: number;
  entityType: AdminEntityType;
  label: string;
  secondary: string;
  status: "active" | "archived";
  version: number;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  imageKey: string | null;
  imageSrc?: string | null;
  personLinks?: Array<{ personId: number; role: string; label: string; archived: boolean }>;
  organizationLinks?: Array<{ organizationId: number; role: string; label: string; archived: boolean }>;
  linkedBooks?: Array<{ bookId: number; role: string; label: string; archived: boolean }>;
  tableOfContentsEntries?: BookTableOfContentsEntry[];
}

export interface BookTableOfContentsEntry {
  entryType: string;
  title: string;
  page: string;
  authorLastName: string;
  authorFirstName: string;
  authorWritingLanguage: string;
  translatorLastName: string;
  translatorFirstName: string;
  translatorLanguage: string;
}

export interface AdminPageResult {
  items: AdminRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminLogEntry {
  id: string;
  occurredAt: string;
  action: string;
  entityType: AdminEntityType;
  entityId: number;
  entityLabel: string;
  summary: string;
  beforeJson?: string | null;
  afterJson?: string | null;
}

export function isAdminEntityType(value: string): value is AdminEntityType {
  return ADMIN_ENTITY_TYPES.includes(value as AdminEntityType);
}
