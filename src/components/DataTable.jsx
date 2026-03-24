'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  searchPlaceholder = 'Search...',
  onRowClick,
  searchKey,
  filters,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(1);
  const perPage = 15;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  let filtered = [...(data || [])];

  // Search
  if (search && searchKey) {
    const q = search.toLowerCase();
    filtered = filtered.filter((row) => {
      const keys = Array.isArray(searchKey) ? searchKey : [searchKey];
      return keys.some((k) => String(row[k] || '').toLowerCase().includes(q));
    });
  }

  // Filters
  if (filters) {
    for (const f of filters) {
      const val = activeFilters[f.key];
      if (val && val !== 'All') {
        filtered = filtered.filter((row) => row[f.key] === val);
      }
    }
  }

  // Sort
  if (sortKey) {
    filtered.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-nuke-card rounded-xl border border-nuke-border overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-nuke-border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-nuke-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm bg-nuke-bg border border-nuke-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nuke-orange/30 focus:border-nuke-orange transition-colors"
          />
        </div>
        {filters?.map((f) => (
          <select
            key={f.key}
            value={activeFilters[f.key] || 'All'}
            onChange={(e) => {
              setActiveFilters({ ...activeFilters, [f.key]: e.target.value });
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-nuke-bg border border-nuke-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nuke-orange/30 focus:border-nuke-orange"
          >
            <option value="All">{f.label}: All</option>
            {f.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ))}
        <span className="text-xs text-nuke-muted ml-auto">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-nuke-bg/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`text-left px-4 py-3 text-xs font-semibold text-nuke-muted uppercase tracking-wider whitespace-nowrap ${
                    col.sortable !== false ? 'cursor-pointer select-none hover:text-nuke-dark' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-nuke-border">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-nuke-muted text-sm">
                  No records found
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row.id || i}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-nuke-orange/[0.03] transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-nuke-border flex items-center justify-between text-sm">
          <span className="text-nuke-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-nuke-border text-sm disabled:opacity-40 hover:bg-nuke-bg transition-colors"
            >
              Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-nuke-border text-sm disabled:opacity-40 hover:bg-nuke-bg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
