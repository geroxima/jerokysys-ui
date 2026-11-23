"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { usePermissions } from "@/components/permission-provider";
import { searchedList, useSearchQuery } from "@/lib/client-search";
import { useAllDisciplines, useDeleteDiscipline, useDisciplines } from "@/lib/query/disciplines";
import type { DisciplineDTO, PagedFilter } from "@/lib/academic/types";

export function DisciplinesList({ filter }: { filter: PagedFilter }) {
  const { can } = usePermissions();
  const query = useSearchQuery();
  const paged = useDisciplines(filter, { enabled: !query });
  const all = useAllDisciplines({ enabled: !!query });
  const deleteDiscipline = useDeleteDiscipline();
  const [pendingDelete, setPendingDelete] = useState<DisciplineDTO | null>(null);

  const handleConfirmDelete = async () => {
    if (!pendingDelete || pendingDelete.id == null) {
      return;
    }
    try {
      await deleteDiscipline.mutateAsync(pendingDelete.id);
      toast.success("Disciplina eliminada");
      setPendingDelete(null);
    } catch (err) {
      toast.error("Error al eliminar la disciplina", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  };

  const { data, isLoading, isError, error, isFetching, refetch } = searchedList(
    query,
    filter,
    paged,
    all,
    (discipline) => [discipline.name, discipline.description],
  );

  const columns: Column<DisciplineDTO>[] = [
    { header: "Nombre", accessorKey: "name", sortable: true, format: "strong" },
    { header: "Descripción", accessorKey: "description", format: "muted", emptyText: "—" },
  ];

  return (
    <>
      <QueryList<DisciplineDTO>
        columns={columns}
        data={data?.content}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isFetching={isFetching}
        refetch={refetch}
        page={data?.page ?? filter.page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        size={data?.size ?? filter.size}
        sort={filter.sort}
        direction={filter.direction}
        baseUrl="/disciplines"
        rowDoubleClickBaseUrl="/disciplines"
        rowEditBaseUrl={can("academic:write") ? "/disciplines" : undefined}
        onDelete={can("academic:write") ? setPendingDelete : undefined}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Eliminar disciplina"
        description={
          pendingDelete
            ? `¿Seguro que querés eliminar la disciplina "${pendingDelete.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        pending={deleteDiscipline.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
