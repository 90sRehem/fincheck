import { Button, Dialog, IconButton, Select } from "@fincheck/design-system";
import { Link, useNavigate } from "@tanstack/react-router";
import { YearSelector } from "./year-selector";
import { useListAccounts } from "../model/use-list-accounts";
import { useUser } from "@/entities/users";
import { useTransactionsFilters } from "../model/use-transactions-filters";
import { useYearSelector } from "../model/use-year-selector";
import { useState, useEffect } from "react";

export function Filters() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { accounts } = useListAccounts({ userId: user.id });
  const { filters, updateFilters, clearFilters } = useTransactionsFilters();
  const { activePeriod } = useYearSelector();

  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(filters.accountId);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    filters.year || activePeriod.year,
  );

  useEffect(() => {
    setSelectedAccountId(filters.accountId);
    setSelectedYear(filters.year || activePeriod.year);
  }, [filters.accountId, filters.year, activePeriod.year]);

  const handleClose = () => {
    navigate({ to: "/", search: (prev) => prev });
  };

  const handleApplyFilters = () => {
    updateFilters({
      accountId: selectedAccountId,
      year: selectedYear,
    });
    navigate({
      to: "/",
      search: (prev) => prev,
    });
  };

  const handleClearFilters = () => {
    setSelectedAccountId(undefined);
    setSelectedYear(undefined);
    clearFilters();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Content
        showCloseButton={false}
        className="gap-10 w-full max-w-88"
      >
        <Dialog.Header className="relative flex items-center justify-center">
          <Link to="/">
            <Dialog.Close asChild className="absolute left-0 hover:bg-gray-1">
              <IconButton icon="Close" />
            </Dialog.Close>
          </Link>
          <Dialog.Title>Filtros</Dialog.Title>
        </Dialog.Header>
        <div className="w-full flex flex-col gap-4">
          <h4 className="heading-4 text-gray-8">Conta</h4>
          <Select
            value={selectedAccountId}
            onValueChange={(value) =>
              setSelectedAccountId(value === "all" ? undefined : value)
            }
          >
            <Select.Trigger>
              <Select.Value placeholder="Todas as contas" />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Item value="all">Todas as contas</Select.Item>
                {accounts.map((account) => (
                  <Select.Item key={account.id} value={account.id}>
                    {account.name}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="heading-4 text-gray-8">Ano</h4>
          <YearSelector
            currentYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleApplyFilters}
          >
            Aplicar Filtros
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleClearFilters}
          >
            Limpar Filtros
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
