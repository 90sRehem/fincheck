import * as Expense from "@/components/ui/icons/expense.tsx";
import * as General from "@/components/ui/icons/general.tsx";
import * as Account from "@/components/ui/icons/account.tsx";
import type { Colors } from "./model";

export const icons = {
  food: <Expense.Food />,
  home: <Expense.Home />,
  education: <Expense.Education />,
  entertainment: <Expense.Entertainment />,
  grocery: <Expense.Grocery />,
  clothing: <Expense.Clothing />,
  health: <Expense.Health />,
  transport: <Expense.Transport />,
  trip: <Expense.Trip />,
  revenue: <General.Revenue />,
  expense: <General.Expense />,
  bankAccounts: <General.BankAccounts />,
  money: <General.Money />,
  investment: <Account.Investments />,
  transactions: <General.Transactions />,
  account: <Account.CurrentAccount />,
} as const;

export type IconName = keyof typeof icons;
export type Categories = keyof typeof icons;

// Mapeamento de categoria para cor baseado nas cores dos ícones SVG
export const categoryColors: Record<IconName, Colors> = {
  food: "red",           // stroke="#FF6B6B"
  home: "orange",        // genérico, representa lar
  education: "grape",    // stroke="#CC5DE8"
  entertainment: "violet", // stroke="#845EF7"
  grocery: "indigo",     // stroke="#5C7CFA"
  clothing: "blue",      // stroke="#339AF0"
  health: "cyan",        // stroke="#22B8CF"
  transport: "yellow",   // stroke="#FCC419"
  trip: "orange",        // stroke="#FF922B"
  revenue: "green",      // stroke="#2B8A3E"
  expense: "red",        // stroke="#C92A2A"
  bankAccounts: "blue",  // stroke="#1864AB"
  money: "gray",         // text-gray-7
  investment: "green",   // representa crescimento
  transactions: "indigo", // stroke="#364FC7"
  account: "gray",       // text-gray-7
};
