export { useStore } from "./core/store/use-store";
export { createStore } from "./core/store/create-store";
export type {
  HttpClient,
  HttpRequest,
  HttpResponse,
  PaginatedResponse,
  PaginationInfo,
} from "./core/http/http-client";
export { createApiClient } from "./core/http/create-api-client";

export {
  StorageService,
  createStorageService,
  TokenStorage,
  createTokenStorage,
  tokenStorage,
  UserStorage,
  createUserStorage,
  userStorage,
  type StorageChangeType,
  type StorageChangeData,
  type StorageObserver,
  type StorageServiceConfig,
  type TokenStorageConfig,
  type UserStorageConfig,
  type User,
} from "./storage";

export {
  TokenService,
  tokenService,
  configureTokenServiceWithLogout,
  type TokenServiceConfig,
} from "./token";
export { UserService, userService, type UserServiceConfig } from "./user";
export { formatBRLFromCents, formatToBRLCurrency } from "./currency";
export { formatDateToBR, formatDateToShortBR, formatDateToLongBR } from "./date";
