/**
 * IROUP Database V2.2 configuration constants.
 *
 * Isolated V2 backend foundation. This file is not wired into the
 * production V1 Apps Script deployment yet.
 */

// TODO: Set this to the IROUP_DATABASE_V2 spreadsheet ID before deploying V2 APIs.
// Leave blank while running inside the bound IROUP_DATABASE_V2 Apps Script project.
const IROUP_V2_SPREADSHEET_ID = '';

const IROUP_V2_SCHEMA_VERSION = '2.2';

const IROUP_V2_SHEETS = {
  SYSTEM_SETTINGS: 'SYSTEM_SETTINGS',
  AUDIT_LOG: 'AUDIT_LOG',
  PUBLIC_CACHE: 'PUBLIC_CACHE',

  ADMIN: 'ADMIN',
  COUNTRY_MASTER: 'COUNTRY_MASTER',
  UP_UNIT_MASTER: 'UP_UNIT_MASTER',
  PERSON_STUDENT: 'PERSON_STUDENT',
  PERSON_STAFF: 'PERSON_STAFF',
  PERSON_MANUAL: 'PERSON_MANUAL',
  BUDGET_TYPE_MASTER: 'BUDGET_TYPE_MASTER',
  FILE_ROLE_MASTER: 'FILE_ROLE_MASTER',

  MOU: 'MOU',
  MOBILITY_PROJECT: 'MOBILITY_PROJECT',
  MOBILITY_PARTICIPANT: 'MOBILITY_PARTICIPANT',
  TRAVEL: 'TRAVEL',
  TRAVEL_PARTICIPANT: 'TRAVEL_PARTICIPANT',
  SCHOLARSHIP: 'SCHOLARSHIP',
  EVENT: 'EVENT',
  NEWS: 'NEWS',
  KNOWLEDGE: 'KNOWLEDGE',

  BUDGET: 'BUDGET',
  FILES: 'FILES'
};

const IROUP_V2_MODULES = ['mou', 'mobility', 'travel', 'scholarship', 'event', 'news', 'knowledge'];

const IROUP_V2_PUBLIC_MODULES = {
  MOU: 'mou',
  MOBILITY: 'mobility',
  TRAVEL: 'travel',
  SCHOLARSHIP: 'scholarship',
  EVENT: 'event'
};

const IROUP_V2_ENUMS = {
  status: ['draft', 'active', 'upcoming', 'ongoing', 'completed', 'expired', 'cancelled', 'archived'],
  visibility_level: ['public', 'internal', 'restricted', 'confidential'],
  direction: ['inbound', 'outbound'],
  event_mode: ['online', 'offline', 'hybrid'],
  participant_type: ['student', 'staff', 'external', 'guest'],
  person_source: ['STUDENT', 'STAFF', 'MANUAL'],
  source_system: ['REG_API', 'HR_API', 'MANUAL_CSV', 'APP_FORM'],
  currency: ['THB', 'USD', 'JPY', 'CNY', 'EUR', 'AUD', 'NZD', 'GBP'],
  budget_source_type: ['internal_unit', 'university', 'external_partner', 'self_funded', 'none', 'other']
};

const IROUP_V2_ID_PREFIXES = {
  MOU: 'MOU',
  MOBILITY_PROJECT: 'MOB',
  MOBILITY_PARTICIPANT: 'MBP',
  TRAVEL: 'TRV',
  TRAVEL_PARTICIPANT: 'TVP',
  SCHOLARSHIP: 'SCH',
  EVENT: 'EVT',
  BUDGET: 'BDG',
  FILES: 'FIL',
  AUDIT_LOG: 'LOG',
  PUBLIC_CACHE: 'PUB',
  PERSON_MANUAL: 'PER'
};
