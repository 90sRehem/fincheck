import { TOKEN_STORAGE_KEY } from "@/shared/config";
import {
	createStorageService,
	type StorageChangeData,
} from "./storage-service";

export interface TokenStorageConfig {
	onTokenExpired?: () => void;
	onTokenChanged?: (token: string | null) => void;
	storage?: Storage;
}

export class TokenStorage {
	private storageService = createStorageService<string>(TOKEN_STORAGE_KEY);
	private config: TokenStorageConfig;
	private removeObserver?: () => void;

	constructor(config: TokenStorageConfig = {}) {
		this.config = config;
		this.setupObserver();
	}

	/**
	 * Obtém o token
	 */
	getToken(): string | null {
		return this.storageService.get();
	}

	/**
	 * Salva o token
	 */
	setToken(token: string): boolean {
		return this.storageService.set(token);
	}

	/**
	 * Remove o token
	 */
	removeToken(): boolean {
		return this.storageService.remove();
	}

	/**
	 * Verifica se existe token
	 */
	hasToken(): boolean {
		return this.storageService.has();
	}

	/**
	 * Notifica que o token expirou
	 */
	notifyTokenExpired(): void {
		this.config.onTokenExpired?.();
	}

	/**
	 * Configura callbacks
	 */
	configure(config: TokenStorageConfig): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Limpa observers e recursos
	 */
	destroy(): void {
		this.removeObserver?.();
	}

	/**
	 * Configura observer para mudanças no storage
	 */
	private setupObserver(): void {
		this.removeObserver = this.storageService.observe(
			(data: StorageChangeData<string>) => {
				// Notifica callback de mudança de token
				this.config.onTokenChanged?.(data.newValue);

				// Log das mudanças
				if (data.type === "error") {
					console.error(`Token storage error:`, data.error);
				} else {
					console.log(
						`Token ${data.type}:`,
						data.newValue ? "[TOKEN]" : "null",
					);
				}
			},
		);
	}
}

/**
 * Factory para configurar TokenStorage com callback de logout
 */
export function createTokenStorage(config: TokenStorageConfig): TokenStorage {
	return new TokenStorage(config);
}

// Instância padrão
export const tokenStorage = new TokenStorage();
