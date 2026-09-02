import prisma from "../config/database";

export abstract class BaseRepository {
  protected db = prisma;
}

export default BaseRepository;
