import * as ColorIcons from "@fincheck/design-system/icons/colors";

export const getColorIcon = (colorId: string) => {
  const iconName = colorId.charAt(0).toUpperCase() + colorId.slice(1);
  return ColorIcons[iconName as keyof typeof ColorIcons];
};
