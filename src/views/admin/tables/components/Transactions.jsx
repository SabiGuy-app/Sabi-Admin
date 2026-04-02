import React from "react";
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import { MdContentCopy } from "react-icons/md";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { transactionsAPI } from "services/api";

const columnHelper = createColumnHelper();

const formatAmount = (amount) => {
  if (typeof amount !== "number") return "N/A";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const shortRef = (value) => {
  if (!value) return "N/A";
  return value.slice(0, 4).toUpperCase();
};

function Transactions() {
  const [sorting, setSorting] = React.useState([]);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const limit = 30;
  const [totalPages, setTotalPages] = React.useState(0);
  const [hasNext, setHasNext] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(null);
  const copiedTimerRef = React.useRef(null);

  const handleCopy = React.useCallback((reference, key) => {
    if (!reference) return;
    navigator.clipboard?.writeText(reference);
    setCopiedId(key);
    if (copiedTimerRef.current) {
      clearTimeout(copiedTimerRef.current);
    }
    copiedTimerRef.current = setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  }, []);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await transactionsAPI.getCompletedPayments(page, limit);
        const list = data?.data || [];
        const mapped = list.map((item) => ({
          id: item._id,
          reference: item.reference,
          type: item.type,
          fromName: item?.from?.userId?.fullName || "N/A",
          fromEmail: item?.from?.userId?.email || "N/A",
          toName: item?.to?.userId?.fullName || "N/A",
          toEmail: item?.to?.userId?.email || "N/A",
          amount: item.amount,
          status: item.status,
          completedAt: item.completedAt,
          createdAt: item.createdAt,
          description: item.description,
        }));

        setTransactions(mapped);
        const meta = data?.pagination || data?.meta || {};
        const totalItems =
          meta?.totalItems ??
          meta?.total ??
          meta?.count ??
          data?.totalItems ??
          data?.total ??
          data?.count ??
          null;
        const computedTotalPages =
          meta?.totalPages ||
          (typeof totalItems === "number" ? Math.ceil(totalItems / limit) : 0);
        setTotalPages(computedTotalPages);
        setHasNext(
          computedTotalPages > 0
            ? page < computedTotalPages
            : list.length === limit
        );
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch transactions");
        setTransactions([]);
        setTotalPages(0);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("reference", {
        id: "reference",
        header: () => (
          <p className="text-xs font-bold text-gray-600 dark:text-white">
            REFERENCE
          </p>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold uppercase text-gray-700 dark:bg-navy-700 dark:text-gray-200">
              {shortRef(info.getValue())}
            </span>
            <button
              onClick={() =>
                handleCopy(
                  info.getValue(),
                  info.row.original.id || info.row.original.reference
                )
              }
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition-all hover:text-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white"
              title="Copy reference"
            >
              <MdContentCopy className="h-3.5 w-3.5" />
            </button>
            {copiedId ===
              (info.row.original.id || info.row.original.reference) && (
              <span className="text-xs font-semibold text-green-600">
                Copied!
              </span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("fromName", {
        id: "from",
        header: () => (
          <p className="text-xs font-bold text-gray-600 dark:text-white">
            FROM
          </p>
        ),
        cell: (info) => (
          <div>
            <p className="text-sm font-medium text-navy-700 dark:text-white">
              {info.getValue()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {info.row.original.fromEmail}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("toName", {
        id: "to",
        header: () => (
          <p className="text-xs font-bold text-gray-600 dark:text-white">TO</p>
        ),
        cell: (info) => (
          <div>
            <p className="text-sm font-medium text-navy-700 dark:text-white">
              {info.getValue()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {info.row.original.toEmail}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("amount", {
        id: "amount",
        header: () => (
          <p className="text-xs font-bold text-gray-600 dark:text-white">
            AMOUNT
          </p>
        ),
        cell: (info) => (
          <p className="text-sm font-semibold text-navy-700 dark:text-white">
            {formatAmount(info.getValue())}
          </p>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: () => (
          <p className="text-xs font-bold text-gray-600 dark:text-white">
            STATUS
          </p>
        ),
        cell: (info) => (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: () => (
          <p className="text-xs font-bold text-gray-600 dark:text-white">
            CREATED
          </p>
        ),
        cell: (info) => (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDateTime(info.getValue())}
          </p>
        ),
      }),
    ],
    [copiedId, handleCopy]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card extra="w-full h-full sm:overflow-auto px-6">
      <header className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Transactions
        </div>
        <CardMenu />
      </header>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading transactions...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mt-6 overflow-x-scroll xl:overflow-x-hidden">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="!border-px !border-gray-400"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer border-b-[1px] border-gray-200 pb-2 pr-4 pt-4 text-start"
                      >
                        <div className="items-center justify-between text-xs text-gray-600 dark:text-gray-200">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="min-w-[150px] border-white/0 py-3 pr-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-8 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No transactions found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between px-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium text-navy-700 dark:text-white">
                {(page - 1) * limit + (transactions.length ? 1 : 0)}
              </span>{" "}
              to{" "}
              <span className="font-medium text-navy-700 dark:text-white">
                {(page - 1) * limit + transactions.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-navy-700 dark:text-white">
                {totalPages > 0 ? totalPages * limit : "many"}
              </span>{" "}
              transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {page}
                {totalPages > 0 ? ` of ${totalPages}` : ""}
              </span>
              <button
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

export default Transactions;
