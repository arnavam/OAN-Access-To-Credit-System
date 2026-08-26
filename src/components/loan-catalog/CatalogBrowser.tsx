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

/** Handed to `renderCard` for the parts of a card the browser has to own. */
export interface CatalogCardControls {
  /**
   * Present only when the host supplied `onBookmarkToggle`, so a view without
   * one (the bank's) renders no bookmark control at all.
   */
  onBookmarkToggle?:
    | ((product: CatalogProduct, currentlyBookmarked: boolean) => Promise<void>)
    | undefined;
}

interface CatalogBrowserProps {
  /**
   * How this view loads products. Injected rather than called directly so the
   * hosting feature owns its own data access — the browser itself only knows
   * the query shape.
   */
  fetchProducts: CatalogFetcher;
  renderCard: (product: CatalogProduct, controls: CatalogCardControls) => ReactNode;
  /**
   * The bookmark write, if this view offers one. Routed through the browser
   * rather than straight to the card because the browser is what owns the
   * filters: under "Bookmarked only" the list on screen *is* the saved set, so
   * un-bookmarking a card has to refetch rather than leave behind a row that no
   * longer belongs in it.
   */
  onBookmarkToggle?: (product: CatalogProduct, currentlyBookmarked: boolean) => Promise<void>;
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
  onBookmarkToggle,
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
  // Bumped when the page on screen stops matching the server. Only the bookmark
  // toggle does that today: under "Bookmarked only" the list *is* the saved set,
  // so un-saving a card leaves behind a row that no longer belongs in it.
  const [catalogAttempt, setCatalogAttempt] = useState(0);

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

        // Un-bookmarking the only row on the last page empties the page the
        // user is standing on while results still exist behind it. Stepping
        // back to the last populated page beats showing "No loans found" over a
        // non-empty result. Guarded on total > 0, so it cannot loop.
        const lastPage = Math.ceil(response.pagination.total / entriesPerPage);
        if (page.length === 0 && lastPage > 0 && currentPage > lastPage) {
          setCurrentPage(lastPage);
        }
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
  }, [
    fetchProducts,
    filterProducts,
    debouncedSearch,
    sortBy,
    filters,
    currentPage,
    entriesPerPage,
    catalogAttempt,
  ]);

  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);
  // Only when nothing else is narrowing the list does an empty result mean "you
  // have no bookmarks"; with a search term or a second filter on top, the honest
  // advice is still to widen the filters.
  const showsOnlyBookmarks =
    filters.is_saved === true && !debouncedSearch && Object.keys(filters).length === 1;

  const handleBookmarkToggle = useCallback(
    async (product: CatalogProduct, currentlyBookmarked: boolean) => {
      if (!onBookmarkToggle) return;
      await onBookmarkToggle(product, currentlyBookmarked);

      // Refetch rather than splice the row out locally: the grid is one page of
      // a server-side count, and dropping a row here would leave the pager
      // claiming a total the list no longer has.
      if (filters.is_saved) {
        setCatalogAttempt((attempt) => attempt + 1);
      }
    },
    [onBookmarkToggle, filters.is_saved]
  );

  const cardControls: CatalogCardControls = {
    onBookmarkToggle: onBookmarkToggle ? handleBookmarkToggle : undefined,
  };

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
              {products.map((product) => renderCard(product, cardControls))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white rounded-2xl text-center px-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-[#16A34A]" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {loadError
                  ? 'Could not load loans'
                  : showsOnlyBookmarks
                    ? 'No bookmarks yet'
                    : emptyTitle}
              </h3>
              <p className="text-[15px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                {loadError ??
                  (showsOnlyBookmarks
                    ? 'Tap the bookmark icon on any loan to save it, and it will show up here.'
                    : searchQuery || hasActiveFilters
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
