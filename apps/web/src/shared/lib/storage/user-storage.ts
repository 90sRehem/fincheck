import { USER_STORAGE_KEY } from "@/shared/config";
import {
  createStorageService,
  type StorageChangeData,
} from "./storage-service";
import type { User } from "../user";

export interface UserStorageConfig {
  onUserChanged?: (user: User | null) => void;
  storage?: Storage;
}

export class UserStorage {
  private readonly storageService =
    createStorageService<User>(USER_STORAGE_KEY);
  private config: UserStorageConfig;
  private removeObserver?: () => void;

  constructor(config: UserStorageConfig = {}) {
    this.config = config;
    this.setupObserver();
  }

  getUser(): User | null {
    return this.storageService.get();
  }

  setUser(user: User): boolean {
    return this.storageService.set(user);
  }

  removeUser(): boolean {
    return this.storageService.remove();
  }

  updateUser(userUpdate: Partial<User>): User | null {
    return this.storageService.update(userUpdate);
  }

  hasUser(): boolean {
    return this.storageService.has();
  }

  configure(config: UserStorageConfig): void {
    this.config = { ...this.config, ...config };
  }

  destroy(): void {
    this.removeObserver?.();
  }

  private setupObserver(): void {
    this.removeObserver = this.storageService.observe(
      (data: StorageChangeData<User>) => {
        this.config.onUserChanged?.(data.newValue);

        if (data.type === "error") {
          console.error(`User storage error:`, data.error);
        } else {
          console.log(`User ${data.type}:`, data.newValue?.email || "null");
        }
      },
    );
  }
}

export function createUserStorage(config: UserStorageConfig): UserStorage {
  return new UserStorage(config);
}

export const userStorage = new UserStorage();
