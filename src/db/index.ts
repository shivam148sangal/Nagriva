import { initMySqlDatabase } from './mysql/connection';
import { seedMySqlData } from './mysql/seed';
import { initMongoDatabase } from './mongo/connection';
import { MongoComplaintService } from '../services/mongoService';

export async function initDualDatabases() {
  console.log('[GramSewa DB Orchestrator] Initializing Dual Database Architecture (MongoDB + MySQL)...');

  // 1. Initialize MySQL Relational Database (Government, Officials, Designations, Jurisdictions, SLA)
  try {
    await initMySqlDatabase();
    await seedMySqlData();
    console.log('[GramSewa DB Orchestrator] MySQL Relational Governance DB initialized.');
  } catch (err) {
    console.error('[GramSewa DB Orchestrator] MySQL initialization error:', err);
  }

  // 2. Initialize MongoDB Document Database (Complaints, Events, GIS, AI Analysis, Notifications)
  try {
    await initMongoDatabase();
    await MongoComplaintService.seedMongoData();
    console.log('[GramSewa DB Orchestrator] MongoDB Application DB initialized.');
  } catch (err) {
    console.error('[GramSewa DB Orchestrator] MongoDB initialization error:', err);
  }

  console.log('[GramSewa DB Orchestrator] Dual Database Architecture (MongoDB + MySQL) is ready and synchronized.');
}

export * from './mysql/connection';
export * from './mysql/models';
export * from './mongo/connection';
export * from './mongo/models';
