import type { Meta, StoryObj } from "@storybook/react";
import { Icons } from "@fincheck/design-system";
import { useState } from "react";

const COPY_FEEDBACK_TIMEOUT = 1500;

// Icon container component - circular background with semantic colors
function IconContainer({
	icon,
	name,
	size = 24,
	variant = "default",
	onClick,
}: {
	icon: React.ComponentType<any>;
	name: string;
	size?: number;
	variant?: "default" | "success" | "warning" | "danger" | "info";
	onClick?: () => void;
}) {
	const IconComponent = icon;
	const [copied, setCopied] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(name);
		setCopied(true);
		setTimeout(() => setCopied(false), COPY_FEEDBACK_TIMEOUT);
		onClick?.();
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleCopy();
		}
	};

	const getVariantStyles = () => {
		const baseStyles =
			"w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer";

		switch (variant) {
			case "success":
				return `${baseStyles} bg-green-1 hover:bg-green-2 text-green-7 hover:text-green-8`;
			case "warning":
				return `${baseStyles} bg-yellow-1 hover:bg-yellow-2 text-yellow-7 hover:text-yellow-8`;
			case "danger":
				return `${baseStyles} bg-red-1 hover:bg-red-2 text-red-7 hover:text-red-8`;
			case "info":
				return `${baseStyles} bg-blue-1 hover:bg-blue-2 text-blue-7 hover:text-blue-8`;
			default:
				return `${baseStyles} bg-gray-1 hover:bg-gray-2 text-gray-7 hover:text-gray-8`;
		}
	};

	return (
		<div className="flex flex-col items-center gap-2 min-w-20">
			<button
				type="button"
				className={getVariantStyles()}
				onClick={handleCopy}
				onKeyDown={handleKeyDown}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				title={`Click to copy: ${name}`}
				aria-label={`Copy icon name: ${name}`}
			>
				<div className="relative">
					<IconComponent
						width={size}
						height={size}
						className="transition-transform duration-200"
						style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
					/>
					{copied && (
						<div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-9 text-gray-0 text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg z-10">
							Copied "{name}"
						</div>
					)}
				</div>
			</button>
			<span className="text-xs text-gray-6 text-center font-mono truncate w-full px-1">
				{name}
			</span>
		</div>
	);
}

// Icon section component - represents a Figma-like section block
function IconSection({
	title,
	description,
	icons,
	variant = "default",
	size = 24,
	className = "",
}: {
	title: string;
	description?: string;
	icons: Array<{
		name: string;
		icon: React.ComponentType<any>;
		variant?: "default" | "success" | "warning" | "danger" | "info";
	}>;
	variant?: "default" | "success" | "warning" | "danger" | "info";
	size?: number;
	className?: string;
}) {
	const getSectionStyles = () => {
		switch (variant) {
			case "success":
				return "bg-green-0 border border-green-2";
			case "warning":
				return "bg-yellow-0 border border-yellow-2";
			case "danger":
				return "bg-red-0 border border-red-2";
			case "info":
				return "bg-blue-0 border border-blue-2";
			default:
				return "bg-gray-0 border border-gray-2";
		}
	};

	return (
		<div className={`rounded-xl p-6 mb-6 ${getSectionStyles()} ${className}`}>
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-gray-9 mb-1">{title}</h3>
				{description && <p className="text-sm text-gray-6">{description}</p>}
			</div>
			<div className="flex flex-wrap gap-4 items-start">
				{icons.map(({ name, icon, variant: iconVariant }) => (
					<IconContainer
						key={name}
						icon={icon}
						name={name}
						size={size}
						variant={iconVariant || variant}
					/>
				))}
			</div>
		</div>
	);
}

// Icon row component - horizontal scroll layout for categories
function IconRow({
	title,
	icons,
	variant = "default",
	size = 24,
}: {
	title: string;
	icons: Array<{
		name: string;
		icon: React.ComponentType<any>;
		variant?: "default" | "success" | "warning" | "danger" | "info";
	}>;
	variant?: "default" | "success" | "warning" | "danger" | "info";
	size?: number;
}) {
	return (
		<div className="mb-6">
			<h4 className="text-sm font-medium text-gray-7 mb-3 px-1">{title}</h4>
			<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-3 scrollbar-track-transparent">
				{icons.map(({ name, icon, variant: iconVariant }) => (
					<IconContainer
						key={name}
						icon={icon}
						name={name}
						size={size}
						variant={iconVariant || variant}
					/>
				))}
			</div>
		</div>
	);
}

// Icon categories based on actual design system files
const ICON_CATEGORIES = {
	icons: {
		title: "Icons.tsx",
		description: "General interface icons from icons.tsx",
		variant: "default" as const,
		icons: [
			"EyeClosed",
			"EyeOpen",
			"Plus",
			"ArrowLeft",
			"ArrowRight",
			"ArrowDown",
			"Close",
			"Calendar",
			"Expense",
			"Revenue",
			"BankAccounts",
			"Delete",
			"Att",
			"MyAccount",
			"Logout",
			"Filter",
			"Transactions",
		],
	},
	general: {
		title: "General.tsx",
		description: "Financial transaction icons from general.tsx",
		variant: "success" as const,
		icons: ["Transactions", "Revenue", "Expense", "BankAccounts"],
	},
} as const;

// Get only available icons for categories
const getAvailableIconsForCategory = (categoryIcons: readonly string[]) => {
	return categoryIcons
		.map((iconName) => {
			const icon = Icons[iconName as keyof typeof Icons];
			return typeof icon === "function" ? { name: iconName, icon } : null;
		})
		.filter((item) => item !== null) as Array<{
		name: string;
		icon: React.ComponentType<any>;
	}>;
};

interface IconShowcaseProps {
	size: number;
	layout: "figma" | "sections" | "grid" | "compact";
	showDescriptions: boolean;
}

function IconShowcase({ size, layout, showDescriptions }: IconShowcaseProps) {
	// Transform Icons object into categorized format
	const getCategorizedIcons = () => {
		return Object.entries(ICON_CATEGORIES)
			.map(([, category]) => ({
				...category,
				icons: getAvailableIconsForCategory(category.icons),
			}))
			.filter((category) => category.icons.length > 0); // Only show categories with available icons
	};

	const getAllIcons = () => {
		return Object.entries(Icons).map(([name, icon]) => ({ name, icon }));
	};

	// Figma-inspired layout with sections
	if (layout === "figma") {
		const categorizedIcons = getCategorizedIcons();

		return (
			<div className="p-8 bg-gray-0 min-h-screen">
				<div className="max-w-7xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-9 mb-3">
							Fincheck Icon Library
						</h1>
						<p className="text-gray-6 text-lg">
							A comprehensive collection of SVG icons organized by purpose and
							context. Click any icon to copy its name to the clipboard.
						</p>
					</div>

					{categorizedIcons.map((category) => (
						<IconSection
							key={category.title}
							title={category.title}
							description={showDescriptions ? category.description : undefined}
							icons={category.icons}
							variant={category.variant}
							size={size}
						/>
					))}
				</div>
			</div>
		);
	}

	// Section-based layout
	if (layout === "sections") {
		const categorizedIcons = getCategorizedIcons();

		return (
			<div className="p-6">
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-9 mb-2">
						Icon Categories
					</h2>
					<p className="text-gray-6">
						Icons organized by their functional purpose.
					</p>
				</div>

				{categorizedIcons.map((category) => (
					<IconRow
						key={category.title}
						title={category.title}
						icons={category.icons}
						variant={category.variant}
						size={size}
					/>
				))}
			</div>
		);
	}

	// Compact grid layout
	if (layout === "compact") {
		const allIcons = getAllIcons();

		return (
			<div className="p-6">
				<div className="mb-4">
					<h2 className="text-xl font-semibold text-gray-9">All Icons</h2>
				</div>
				<div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-3">
					{allIcons.map(({ name, icon }) => (
						<IconContainer
							key={name}
							icon={icon}
							name={name}
							size={size}
							variant="default"
						/>
					))}
				</div>
			</div>
		);
	}

	// Classic grid layout
	const allIcons = getAllIcons();
	return (
		<div className="p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-9 mb-2">All Icons</h2>
				<p className="text-gray-6">Complete collection of available icons.</p>
			</div>
			<div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
				{allIcons.map(({ name, icon }) => (
					<IconContainer
						key={name}
						icon={icon}
						name={name}
						size={size}
						variant="default"
					/>
				))}
			</div>
		</div>
	);
}

const meta = {
	title: "UI/Icons",
	component: IconShowcase,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
# Icons Collection

A comprehensive collection of SVG icons used throughout the Fincheck application, organized by their source files in the design system.

## File Structure

The icons are organized across multiple files in the design system:

- **icons.tsx**: General interface icons (EyeClosed, EyeOpen, Plus, Arrow*, Close, Calendar, etc.)
- **general.tsx**: Financial transaction icons (Transactions, Revenue, Expense, BankAccounts)
- **account.tsx**: Account type icons (CurrentAccount, Investments, Money)
- **expense.tsx**: Expense category icons (Food, Home, Education, Entertainment, etc.)
- **revenue.tsx**: Revenue source icons
- **colors.tsx**: Color variant icons (Gray, Green, Red, Blue, etc.)

## Usage

\`\`\`tsx
import { Icons } from "@fincheck/design-system";

// Use any icon from the collection
<Icons.Plus className="w-6 h-6" />
<Icons.Calendar className="w-5 h-5 text-blue-500" />
<Icons.BankAccounts className="w-8 h-8" />
\`\`\`

## Features

- All icons are SVG-based for scalability
- Support for Tailwind CSS classes
- Consistent sizing and styling
- Tree-shakeable imports
- TypeScript support with proper types
- Click-to-copy functionality in story view
        `,
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: { type: "range", min: 16, max: 48, step: 4 },
			description: "Icon size in pixels",
		},
		layout: {
			control: "select",
			options: ["figma", "sections", "grid", "compact"],
			description: "Layout style for displaying icons",
		},
		showDescriptions: {
			control: "boolean",
			description: "Show category descriptions",
		},
	},
} satisfies Meta<typeof IconShowcase>;

// biome-ignore lint/style/noDefaultExport: Storybook requires default export for meta configuration
export default meta;
type Story = StoryObj<typeof meta>;

export const ByFiles: Story = {
	args: {
		size: 24,
		layout: "figma",
		showDescriptions: true,
	},
	parameters: {
		docs: {
			description: {
				story:
					"Icons organized by their source files in the design system: icons.tsx and general.tsx",
			},
		},
	},
};

export const CompactGrid: Story = {
	args: {
		size: 20,
		layout: "compact",
		showDescriptions: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					"All icons displayed in a compact grid layout, perfect for quick visual reference.",
			},
		},
	},
};

export const FileStructure: Story = {
	args: {
		size: 28,
		layout: "sections",
		showDescriptions: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					"Icons displayed in horizontal rows, grouped by their source files.",
			},
		},
	},
};

export const LargeGrid: Story = {
	args: {
		size: 32,
		layout: "grid",
		showDescriptions: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					"Large icons displayed in a traditional grid layout for detailed viewing.",
			},
		},
	},
};

export const IconsFileOnly: Story = {
	render: (args) => {
		const iconsFileIcons = getAvailableIconsForCategory(
			ICON_CATEGORIES.icons.icons,
		);

		return (
			<div className="p-6 bg-gray-0 rounded-xl border border-gray-2">
				<h3 className="text-lg font-semibold text-gray-9 mb-4">icons.tsx</h3>
				<p className="text-sm text-gray-6 mb-4">
					General interface icons from the main icons.tsx file
				</p>
				<div className="flex flex-wrap gap-4">
					{iconsFileIcons.map(({ name, icon }) => (
						<IconContainer
							key={name}
							icon={icon}
							name={name}
							size={args.size}
							variant="default"
						/>
					))}
				</div>
			</div>
		);
	},
	args: {
		size: 24,
		layout: "sections",
		showDescriptions: true,
	},
	parameters: {
		docs: {
			description: {
				story: "Focus view showing icons from the main icons.tsx file.",
			},
		},
	},
};

export const GeneralFileOnly: Story = {
	render: (args) => {
		const generalFileIcons = getAvailableIconsForCategory(
			ICON_CATEGORIES.general.icons,
		);

		return (
			<div className="p-6 bg-green-0 rounded-xl border border-green-2">
				<h3 className="text-lg font-semibold text-gray-9 mb-4">general.tsx</h3>
				<p className="text-sm text-gray-6 mb-4">
					Financial transaction icons from general.tsx file
				</p>
				<div className="flex flex-wrap gap-4">
					{generalFileIcons.map(({ name, icon }) => (
						<IconContainer
							key={name}
							icon={icon}
							name={name}
							size={args.size}
							variant="success"
						/>
					))}
				</div>
			</div>
		);
	},
	args: {
		size: 32,
		layout: "sections",
		showDescriptions: true,
	},
	parameters: {
		docs: {
			description: {
				story:
					"Focus view showing financial transaction icons from the general.tsx file.",
			},
		},
	},
};
