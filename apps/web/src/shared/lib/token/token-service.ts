import { tokenStorage, type TokenStorageConfig } from "@/shared/lib/storage";

export interface TokenServiceConfig {
	onTokenExpired?: () => void;
	storage?: Storage;
}

export class TokenService {
	private tokenStorage = tokenStorage;

	constructor(config: TokenServiceConfig = {}) {
		if (config.onTokenExpired) {
			this.configure(config);
		}
	}

	getToken(): string | null {
		return this.tokenStorage.getToken();
	}

	setToken(token: string): boolean {
		return this.tokenStorage.setToken(token);
	}

	removeToken(): boolean {
		return this.tokenStorage.removeToken();
	}

	hasToken(): boolean {
		return this.tokenStorage.hasToken();
	}

	/**
	 * Configura callbacks do token service
	 */
	configure(config: TokenServiceConfig): void {
		this.tokenStorage.configure({
			onTokenExpired: config.onTokenExpired,
			storage: config.storage,
		});
	}

	/**
	 * Notifica que o token expirou (chamado pelo api-client quando recebe 401)
	 */
	notifyTokenExpired(): void {
		this.tokenStorage.notifyTokenExpired();
	}
}

/**
 * Factory para configurar o token service com função de logout
 */
export function configureTokenServiceWithLogout(logoutFn: () => void): void {
	tokenService.configure({
		onTokenExpired: logoutFn,
	});
}

export const tokenService = new TokenService();
