import { cn } from "@/lib/utils";
import type { IconProps } from "../types";

export function MoneyBase({ className, ...props }: IconProps) {
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
			<title>Money icon</title>
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
				d="M16.188 14.95h11.624c1.965 0 3.188 1.387 3.188 3.35V25.7c0 1.963-1.223 3.35-3.19 3.35H16.189C14.223 29.05 13 27.662 13 25.7V18.3c0-1.963 1.229-3.35 3.188-3.35zM16.664 21.299v1.403M27.336 22.702v-1.403"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				clipRule="evenodd"
				d="M24.287 22a2.287 2.287 0 10-4.575 0 2.287 2.287 0 004.575 0z"
				className="stroke-current"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
