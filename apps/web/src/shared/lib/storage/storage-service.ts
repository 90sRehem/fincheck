export type StorageChangeType = "set" | "remove" | "error";

export interface StorageChangeData<T> {
  key: string;
  type: StorageChangeType;
  newValue: T | null;
  oldValue: T | null;
  error?: Error;
}

export type StorageObserver<T> = (data: StorageChangeData<T>) => void;

export interface StorageServiceConfig {
  storage?: Storage;
}

export class StorageService<T> {
  private readonly storage: Storage;
  private readonly observers: Set<StorageObserver<T>> = new Set();
  private readonly key: string;

  constructor(key: string, config: StorageServiceConfig = {}) {
    this.key = key;
    this.storage = config.storage || sessionStorage;
  }

  get(): T | null {
    try {
      const value = this.storage.getItem(this.key);
      if (value === null) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      this.notifyObservers({
        key: this.key,
        type: "error",
        newValue: null,
        oldValue: null,
        error: error as Error,
      });
      return null;
    }
  }

  set(value: T): boolean {
    try {
      const oldValue = this.get();

      const serializedValue =
        typeof value === "string" ? value : JSON.stringify(value);

      this.storage.setItem(this.key, serializedValue);

      this.notifyObservers({
        key: this.key,
        type: "set",
        newValue: value,
        oldValue,
      });

      return true;
    } catch (error) {
      this.notifyObservers({
        key: this.key,
        type: "error",
        newValue: value,
        oldValue: null,
        error: error as Error,
      });
      return false;
    }
  }

  remove(): boolean {
    try {
      const oldValue = this.get();
      this.storage.removeItem(this.key);

      this.notifyObservers({
        key: this.key,
        type: "remove",
        newValue: null,
        oldValue,
      });

      return true;
    } catch (error) {
      this.notifyObservers({
        key: this.key,
        type: "error",
        newValue: null,
        oldValue: null,
        error: error as Error,
      });
      return false;
    }
  }

  has(): boolean {
    return this.get() !== null;
  }

  update(partialValue: Partial<T>): T | null {
    const currentValue = this.get();

    if (currentValue === null) {
      console.warn(`Cannot update ${this.key}: no current value found`);
      return null;
    }

    if (typeof currentValue !== "object" || Array.isArray(currentValue)) {
      console.warn(
        `Cannot update ${this.key}: current value is not a plain object`,
      );
      return null;
    }

    const updatedValue = { ...currentValue, ...partialValue } as T;
    const success = this.set(updatedValue);

    return success ? updatedValue : null;
  }

  observe(observer: StorageObserver<T>): () => void {
    this.observers.add(observer);

    return () => {
      this.observers.delete(observer);
    };
  }

  clearObservers(): void {
    this.observers.clear();
  }

  private notifyObservers(data: StorageChangeData<T>): void {
    this.observers.forEach((observer) => {
      try {
        observer(data);
      } catch (error) {
        console.error(`Error in storage observer for ${this.key}:`, error);
      }
    });
  }
}

export function createStorageService<T>(
  key: string,
  config?: StorageServiceConfig,
): StorageService<T> {
  return new StorageService<T>(key, config);
}
