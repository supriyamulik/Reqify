// User Roles
export const ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  REVIEWER: 'reviewer'
};

// Requirement Status
export const STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  APPROVED: 'approved'
};

// File Types
export const ALLOWED_FILE_TYPES = ['.txt', '.pdf', '.docx'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Analysis Thresholds
export const SIMILARITY_THRESHOLD = 0.85;
export const AMBIGUITY_CONFIDENCE = 0.7;
