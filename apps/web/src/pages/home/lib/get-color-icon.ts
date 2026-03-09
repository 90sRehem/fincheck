import * as ColorIcons from "@fincheck/design-system/icons/colors";

export const getColorIcon = (
	colorId: string,
): React.ComponentType<any> | null => {
	const iconName = colorId.charAt(0).toUpperCase() + colorId.slice(1);
	const IconComponent = ColorIcons[iconName as keyof typeof ColorIcons];

	// Verificar se é uma função válida antes de retornar
	if (typeof IconComponent === "function") {
		return IconComponent as React.ComponentType<any>;
	}

	return null;
};
