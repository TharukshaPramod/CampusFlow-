export enum IncidentPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum IncidentStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
}

export interface IncidentAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

export interface IncidentComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  preferredContact: string;

  creatorId: string;
  creatorName: string;

  technicianId?: string;
  technicianName?: string;

  resourceId?: string;
  resourceName?: string;

  location?: string;
  resolutionNotes?: string;
  rejectionReason?: string;

  firstResponseAt?: string;
  resolvedAt?: string;

  createdAt: string;
  updatedAt: string;

  attachments: IncidentAttachment[];
  comments: IncidentComment[];
}

export interface IncidentCreateRequest {
  title: string;
  category: string;
  description: string;
  priority: IncidentPriority;
  preferredContact: string;
  resourceId?: string;
  location?: string;
  attachmentsBase64?: string[];
}

export interface IncidentUpdateRequest {
  title?: string;
  category?: string;
  description?: string;
  priority?: IncidentPriority;
  preferredContact?: string;
  resourceId?: string;
  location?: string;
}

export interface IncidentAddAttachmentsRequest {
  attachmentsBase64: string[];
}

export interface IncidentStatusUpdate {
  status: IncidentStatus;
  rejectionReason?: string;
  resolutionNotes?: string;
}

export interface IncidentCommentRequest {
  content: string;
}
