import { cn } from "@/lib/utils";
import type { IconProps } from "../types";

export function InvestmentsBase({ className, ...props }: IconProps) {
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
			<title>Investments icon</title>
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
				d="M15.52 30.274v-1.92"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				clipRule="evenodd"
				d="M16.255 28.354h-1.47a1.422 1.422 0 01-1.425-1.42v-4.841c0-.785.638-1.419 1.424-1.419h1.47c.788 0 1.426.634 1.426 1.419v4.841c0 .784-.638 1.42-1.425 1.42z"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M15.52 20.674v-1.92M22 26.434v-2.4"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				clipRule="evenodd"
				d="M22.735 24.034h-1.47a1.422 1.422 0 01-1.425-1.42v-1.001c0-.785.638-1.419 1.424-1.419h1.47c.788 0 1.426.634 1.426 1.419v1.001c0 .784-.638 1.42-1.425 1.42z"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M22 20.194v-5.28M28.48 23.554v-2.4"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				clipRule="evenodd"
				d="M29.215 21.154h-1.47a1.422 1.422 0 01-1.425-1.42v-2.921c0-.784.638-1.42 1.424-1.42h1.47c.788 0 1.426.636 1.426 1.42v2.921c0 .784-.638 1.42-1.425 1.42z"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M28.48 15.394v-2.4"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
