import { cn } from "@/lib/utils";
import type { IconProps } from "../types";

export function CurrentAccountBase({ className, ...props }: IconProps) {
	return (
		<svg
			width={44}
			height={44}
			viewBox="0 0 44 44"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("w-11 h-11", className)}
			{...props}
		>
			<title>Current Account icon</title>
			<rect
				x={1}
				y={1}
				width={42}
				height={42}
				rx={21}
				className="fill-current opacity-10"
			/>
			<rect
				x={1}
				y={1}
				width={42}
				height={42}
				rx={21}
				stroke="#fff"
				strokeWidth={2}
			/>
			<path
				clipRule="evenodd"
				d="M27.035 14.54H16.964c-2.436 0-3.964 1.724-3.964 4.165v6.588c0 2.442 1.52 4.167 3.964 4.167h10.07c2.445 0 3.966-1.725 3.966-4.167v-6.588c0-2.44-1.52-4.166-3.965-4.166z"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M13 19.834h18M17.177 25.17h2.968"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
