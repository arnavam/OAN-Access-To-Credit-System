'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCatalog, getCatalogFacets, removeBookmark, saveBookmark } from '../../api/farmerApi';
import type {
  CatalogFacets,
  CatalogFilters,
  CatalogSortKey,
  FarmerLoanProduct,
} from '../../types';
import LoanCard from './LoanCard';
import Pagination from './Pagination';
import SidebarFilters from './SidebarFilters';
import TopBar from './TopBar';

export default function DiscoverLoansClient() {
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
  const [products, setProducts] = useState<FarmerLoanProduct[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filter options come from the catalog itself, so the sidebar only ever offers
  // choices that match something. Fetched once — the option set changes when a
  // bank publishes a product, not while the farmer is browsing.
  useEffect(() => {
    let isMounted = true;
    getCatalogFacets()
      .then((res) => {
        if (isMounted) setFacets(res.data);
      })
      .catch((error) => {
        console.error('Error fetching catalog facets', error);
        if (isMounted) setFacets({ categories: [], tenures: [], amount_range: null, max_interest_rate: null });
      });
    return () => {
      isMounted = false;
    };
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
        const response = await getCatalog({
          ...filters,
          search: debouncedSearch,
          sort_by: sortBy,
          start: (currentPage - 1) * entriesPerPage,
          limit: entriesPerPage,
        });

        if (!isMounted) return;

        setProducts(response.data.products || []);
        setTotalEntries(response.pagination.total);
      } catch (error) {
        console.error('Error fetching catalog', error);
        if (isMounted) {
          setProducts([]);
          setTotalEntries(0);
          setLoadError('We could not load loan products just now. Please try again.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLoans();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, sortBy, filters, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  // Rethrows: the card renders the new state optimistically and needs to know
  // when the write failed so it can put the bookmark back rather than keep
  // showing a save that never happened.
  const handleBookmarkToggle = async (
    product: FarmerLoanProduct,
    isCurrentlyBookmarked: boolean
  ) => {
    if (isCurrentlyBookmarked) {
      await removeBookmark(product.name);
    } else {
      await saveBookmark(product.name);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Sidebar - Left */}
      <div className="w-full lg:w-[320px] shrink-0">
        <SidebarFilters
          facets={facets}
          filters={filters}
          onApply={setFilters}
          onReset={() => setFilters({})}
        />
      </div>

      {/* Main Content - Right */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {isLoading ? (
          <div className="flex-1 flex justify-center items-center py-20">Loading...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {products.map((loan) => (
              <LoanCard key={loan.name} loan={loan} onBookmarkToggle={handleBookmarkToggle} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white rounded-2xl text-center px-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Search className="w-7 h-7 text-[#16A34A]" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {loadError ? 'Could not load loans' : 'No loans found'}
            </h3>
            <p className="text-[15px] text-gray-500 max-w-sm mx-auto leading-relaxed">
              {loadError ??
                (searchQuery || hasActiveFilters
                  ? "Try adjusting your filters or search query to find what you're looking for."
                  : 'No loan products are available yet. Please check back soon.')}
            </p>
          </div>
        )}

        {totalEntries > 0 && (
          <div className="mt-2">
            <Pagination
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
  );
}
