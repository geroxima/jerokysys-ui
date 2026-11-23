"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { usePermissions } from "@/components/permission-provider";
import { dayLabels, toNameMap } from "@/lib/academic/labels";
import { searchedList, useSearchQuery } from "@/lib/client-search";
import { useAllClasses, useClasses, useDeleteClass } from "@/lib/query/classes";
import { useAllDisciplines } from "@/lib/query/disciplines";
import type { DanceClassDTO, PagedFilter } from "@/lib/academic/types";

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  CANCELLED: "Cancelado",
  SUSPENDED: "Suspendido",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-yellow-100 text-yellow-800",
};

export function ClassesList({ filter }: { filter: PagedFilter }) {
  const { can } = usePermissions();
  const query = useSearchQuery();
  const paged = useClasses(filter, { enabled: !query });
  const all = useAllClasses({ enabled: !!query });
  const { data: disciplines = [] } = useAllDisciplines();
  const deleteClass = useDeleteClass();
  const [pendingDelete, setPendingDelete] = useState<DanceClassDTO | null>(null);

  const disciplineMap = toNameMap(disciplines, (discipline) => discipline.name);

  const { data, isLoading, isError, error, isFetching, refetch } = searchedList(
    query,
    filter,
    paged,
    all,
    (danceClass) => [
      disciplineMap.get(danceClass.disciplineId),
      danceClass.level,
      dayLabels[danceClass.dayOfWeek],
      statusLabels[danceClass.status ?? ""],
    ],
  );

  const handleConfirmDelete = async () => {
    if (!pendingDelete || pendingDelete.id == null) {
      return;
    }
    try {
      await deleteClass.mutateAsync(pendingDelete.id);
      toast.success("Clase eliminada");
      setPendingDelete(null);
    } catch (err) {
      toast.error("Error al eliminar la clase", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  };

  const columns: Column<DanceClassDTO>[] = [
    {
      header: "Disciplina",
      accessorKey: "disciplineId",
      format: { kind: "lookup", map: disciplineMap, fallback: "—" },
    },
    { header: "Nivel", accessorKey: "level", sortable: true, format: "strong" },
    { header: "Día", accessorKey: "dayOfWeek", sortable: true, format: { kind: "map", map: dayLabels } },
    {
      header: "Horario",
      accessorKey: "startTime",
      format: { kind: "timeRange", endKey: "endTime" },
    },
    { header: "Capacidad", accessorKey: "maxCapacity" },
    { header: "Precio", accessorKey: "monthlyPrice", format: "currency" },
    {
      header: "Estado",
      accessorKey: "status",
      sortable: true,
      format: { kind: "badge", labels: statusLabels, colors: statusColors },
    },
  ];

  return (
    <>
      <QueryList<DanceClassDTO>
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
        baseUrl="/classes"
        rowDoubleClickBaseUrl="/classes"
        rowEditBaseUrl={can("academic:write") ? "/classes" : undefined}
        onDelete={can("academic:write") ? setPendingDelete : undefined}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Eliminar clase"
        description={
          pendingDelete
            ? `¿Seguro que querés eliminar la clase "${pendingDelete.level}"? Esta acción no se puede deshacer.`
            : ""
        }
        pending={deleteClass.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
