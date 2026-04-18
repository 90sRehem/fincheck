import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";

export type Color = {
	id: string;
	name: string;
	hex: string;
};

async function listColors() {
	const response = await apiClient.get<Color[]>({
		url: "/colors",
	});
	return { colors: response.data };
}

export const colorsQueryFactory = {
	all: ["colors"] as const,
	listColors: () =>
		queryOptions({
			queryKey: colorsQueryFactory.all,
			queryFn: listColors,
		}),
};
