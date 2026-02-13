import type { IconProps } from "./types";
import { CurrentAccountBase, MoneyBase, InvestmentsBase } from "./base";

export function CurrentAccount(props: Readonly<IconProps>) {
	return <CurrentAccountBase className="text-gray-7" {...props} />;
}

export function Investments(props: Readonly<IconProps>) {
	return <InvestmentsBase className="text-gray-7" {...props} />;
}

export function Money(props: Readonly<IconProps>) {
	return <MoneyBase className="text-gray-7" {...props} />;
}

export function Revenue(props: Readonly<IconProps>) {
	return (
		<svg
			width={44}
			height={44}
			viewBox="0 0 44 44"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-11 h-11"
			{...props}
		>
			<title>Revenue icon</title>
			<rect
				x={1}
				y={1}
				width={42}
				height={42}
				rx={21}
				className="fill-green-0"
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
				d="M23.26 28.348h-6.838c-1.888 0-3.062-1.332-3.062-3.217v-7.103c0-1.885 1.174-3.217 3.06-3.217h11.16c1.88 0 3.06 1.332 3.06 3.217v1.919M26.538 25.551l2.05-2.051 2.051 2.051M28.589 23.5v4.848M16.444 18.173h1.347"
				className="stroke-green-9"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				clipRule="evenodd"
				d="M19.803 21.58a2.196 2.196 0 114.392 0 2.196 2.196 0 01-4.392 0z"
				className="stroke-green-9"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function Expense(props: Readonly<IconProps>) {
	return (
		<svg
			width={44}
			height={44}
			viewBox="0 0 44 44"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-11 h-11"
			{...props}
		>
			<title>Expense icon</title>
			<rect x={1} y={1} width={42} height={42} rx={21} className="fill-red-0" />
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
				d="M23.26 28.348h-6.838c-1.888 0-3.062-1.332-3.062-3.217v-7.103c0-1.885 1.174-3.217 3.06-3.217h11.16c1.88 0 3.06 1.332 3.06 3.217v1.919M16.444 18.171h1.347"
				className="stroke-red-9"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				clipRule="evenodd"
				d="M19.805 21.58a2.196 2.196 0 114.391 0 2.196 2.196 0 01-4.391 0z"
				className="stroke-red-9"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M26.538 26.298l2.05 2.05 2.051-2.05M28.589 23.5v4.848"
				className="stroke-red-9"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function BankAccounts(props: Readonly<IconProps>) {
	return (
		<svg
			width={44}
			height={44}
			viewBox="0 0 44 44"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-11 h-11"
			{...props}
		>
			<title>Bank Accounts icon</title>
			<rect
				x={1}
				y={1}
				width={42}
				height={42}
				rx={21}
				className="fill-blue-0"
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
				d="M13.722 18.552l7.87-5.08a.701.701 0 01.76 0l7.87 5.08c.2.13.32.351.32.59v.551a.7.7 0 01-.7.7h-15.74a.7.7 0 01-.7-.7v-.552c0-.238.12-.46.32-.589zM21.971 17.455v.01"
				className="stroke-blue-9"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				clipRule="evenodd"
				d="M30.568 30.044l-.37-1.686a.49.49 0 00-.48-.384H14.225a.49.49 0 00-.479.384l-.37 1.686a.49.49 0 00.477.594h16.239a.49.49 0 00.477-.594z"
				className="stroke-blue-9"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M24.138 20.391v7.584m4.333-7.584v7.584M15.47 20.39v7.584m4.333-7.584v7.584"
				className="stroke-blue-9"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
