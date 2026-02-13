import { cn } from "../../lib/utils";

export interface TabProps extends React.ComponentProps<"div"> {
	active?: boolean;
	fullWidth?: boolean;
}

export function Tab({
	children,
	active = false,
	className,
	...props
}: Readonly<TabProps>) {
	return (
		<div
			className={cn(
				"flex items-center justify-center h-12 px-6 text-center rounded-full whitespace-nowrap hover:cursor-pointer",
				active ? "bg-white text-gray-8" : "hover:bg-gray-2 active:bg-white",
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					"button-small",
					active
						? "text-gray-8"
						: "text-gray-7 hover:text-gray-8 active:text-gray-8",
				)}
			>
				{children}
			</span>
		</div>
	);
}
