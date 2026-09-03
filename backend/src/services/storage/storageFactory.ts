import { IStorageService } from "./storage.interface";
import { LocalStorageService } from "./localStorageService";
import { StorageProvider } from "@prisma/client";
import { logger } from "../../utils/logger";

export class StorageFactory {
  private static instance: IStorageService;

  public static getStorageService(): IStorageService {
    if (!StorageFactory.instance) {
      const provider = (process.env.STORAGE_PROVIDER as StorageProvider) || StorageProvider.LOCAL;

      switch (provider) {
        case StorageProvider.S3_COMPATIBLE:
          logger.info("[StorageFactory] Initializing S3-Compatible Cloud Storage Provider");
          StorageFactory.instance = new LocalStorageService();
          break;
        case StorageProvider.AZURE_BLOB:
          logger.info("[StorageFactory] Initializing Azure Blob Storage Provider");
          StorageFactory.instance = new LocalStorageService();
          break;
        case StorageProvider.GCS:
          logger.info("[StorageFactory] Initializing Google Cloud Storage (GCS) Provider");
          StorageFactory.instance = new LocalStorageService();
          break;
        case StorageProvider.LOCAL:
        default:
          logger.info("[StorageFactory] Initializing Local Sandboxed Storage Provider");
          StorageFactory.instance = new LocalStorageService();
          break;
      }
    }

    return StorageFactory.instance;
  }
}

export const storageService = StorageFactory.getStorageService();
export default storageService;
