'use client';

import { getCatalogFacets } from '@/lib/api/catalogApi';
import { logger } from '@/lib/logger';
import { Loader } from '@/components/ui/Loader';
import type {
  CatalogFacets,
  CatalogFetcher,
  CatalogFilters,
  CatalogProduct,
  CatalogSortKey,
} from '@/types/loan-catalog';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import CatalogPagination from './CatalogPagination';
import CatalogSidebarFilters from './CatalogSidebarFilters';
import CatalogTopBar from './CatalogTopBar';

interface CatalogBrowserProps {
  /**
   * How this view loads products. Injected rather than called directly so the
   * hosting feature owns its own data access — the browser itself only knows
   * the query shape.
   */
  fetchProducts: CatalogFetcher;
  renderCard: (product: CatalogProduct) => ReactNode;
  /** Rendered above the top bar. The bank portals put their header card here. */
  header?: ReactNode;
  /**
   * Applied to each page after it arrives — for rows the caller must not show
   * but the endpoint has no parameter to exclude, such as archived products.
   * The pager still counts them, which is the honest trade for not having a
   * server-side filter.
   */
  filterProducts?: (products: CatalogProduct[]) => CatalogProduct[];
  emptyTitle?: string;
  emptySubtitle?: string;
}

export default function CatalogBrowser({
  fetchProducts,
  renderCard,
  header,
  filterProducts,
  emptyTitle = 'No loans found',
  emptySubtitle = 'No loan products are available yet. Please check back soon.',
}: CatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  // What the box shows and what we query are separate: firing a request per
  // keystroke means results trail the input, and on a slow link whichever
  // response lands last wins — which reads as search ignoring what was typed.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<CatalogSortKey>('product_name');
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [facets, setFacets] = useState<CatalogFacets | null>(null);
  const [facetsFailed, setFacetsFailed] = useState(false);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filter options come from the catalog itself, so the sidebar only ever offers
  // choices that match something. Fetched once — the option set changes when a
  // bank publishes a product, not while the user is browsing.
  //
  // A failure is reported as a failure. Substituting an all-empty facet set here
  // made the sidebar say "No filters available", which is a statement about the
  // catalog, not about the request that did not arrive — and it is the wrong
  // statement in the one case where the user most needs to know to retry.
  const [facetsAttempt, setFacetsAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getCatalogFacets()
      .then((res) => {
        if (!isMounted) return;
        setFacets(res.data);
        setFacetsFailed(false);
      })
      .catch((error) => {
        logger.error('Error fetching catalog facets', error);
        if (!isMounted) return;
        setFacets(null);
        setFacetsFailed(true);
      });
    return () => {
      isMounted = false;
    };
  }, [facetsAttempt]);

  // Clearing the failure here rather than at the top of the effect keeps the
  // reset in the event that caused it — an effect body that calls setState
  // synchronously is a cascading render, and the lint rule says so.
  const retryFacets = useCallback(() => {
    setFacetsFailed(false);
    setFacetsAttempt((attempt) => attempt + 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when the result set changes underneath the pager.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [debouncedSearch, sortBy, filters, entriesPerPage]);

  useEffect(() => {
    let isMounted = true;
    const fetchLoans = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetchProducts({
          ...filters,
          search: debouncedSearch,
          sort_by: sortBy,
          start: (currentPage - 1) * entriesPerPage,
          limit: entriesPerPage,
        });

        if (!isMounted) return;

        const page = response.data.products || [];
        setProducts(filterProducts ? filterProducts(page) : page);
        setTotalEntries(response.pagination.total);
      } catch (error) {
        logger.error('Error fetching catalog', error);
        if (!isMounted) return;
        setProducts([]);
        setTotalEntries(0);
        setLoadError('We could not load loan products just now. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLoans();
    return () => {
      isMounted = false;
    };
  }, [fetchProducts, filterProducts, debouncedSearch, sortBy, filters, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="flex flex-col gap-6 w-full">
      {header}

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Sidebar - Left */}
        <div className="w-full lg:w-[320px] shrink-0">
          <CatalogSidebarFilters
            facets={facets}
            hasFailed={facetsFailed}
            onRetry={retryFacets}
            filters={filters}
            onApply={setFilters}
            onReset={() => setFilters({})}
          />
        </div>

        {/* Main Content - Right */}
        <div className="flex-1 min-w-0 flex flex-col">
          <CatalogTopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {isLoading ? (
            <div className="flex-1 flex justify-center items-center py-20">
              <Loader label="Loading loans…" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {products.map(renderCard)}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white rounded-2xl text-center px-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-[#16A34A]" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {loadError ? 'Could not load loans' : emptyTitle}
              </h3>
              <p className="text-[15px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                {loadError ??
                  (searchQuery || hasActiveFilters
                    ? "Try adjusting your filters or search query to find what you're looking for."
                    : emptySubtitle)}
              </p>
            </div>
          )}

          {totalEntries > 0 && (
            <div className="mt-2">
              <CatalogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalEntries={totalEntries}
                visibleCount={products.length}
                entriesPerPage={entriesPerPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={setEntriesPerPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
