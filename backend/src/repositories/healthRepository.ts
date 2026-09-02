import { BaseRepository } from "./baseRepository";
import { checkDatabaseConnection } from "../config/database";

export class HealthRepository extends BaseRepository {
  async pingDatabase(): Promise<{
    connected: boolean;
    responseTimeMs: number;
    error?: string;
  }> {
    return checkDatabaseConnection();
  }
}

export const healthRepository = new HealthRepository();
export default healthRepository;
