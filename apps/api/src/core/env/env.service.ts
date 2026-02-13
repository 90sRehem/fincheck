/** biome-ignore-all lint/style/useImportType: <explanation> */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "./env.schema";

@Injectable()
export class EnvService {
	constructor(private readonly configService: ConfigService<Env, true>) {}

	public get<T extends keyof Env>(key: T): Env[T] {
		return this.configService.get(key, { infer: true });
	}
}
