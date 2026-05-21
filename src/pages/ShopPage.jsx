import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { productService, categoryService } from '../services/api';
import { BrushLoader } from '../components/BrushLoader';

export function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [searchParams, setSearchParams] = useSearchParams();

  const [visibleCount, setVisibleCount] = useState(12);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const observer = useRef();

  const activeCategoryId = searchParams.get('category') || 'all';
  
  const setActiveCategory = (id) =>
    setSearchParams(id === 'all' ? {} : { category: id });

  // 1. Fetch categories on mount
  useEffect(() => {
    categoryService.getAll()
      .then(res => {
        const dbCats = res.data.filter(c => {
          const lower = c.categoryName?.trim().toLowerCase();
          return lower && lower !== 'all products' && lower !== 'all supplies';
        });
        
        // Ensure uniqueness by name
        const uniqueCats = [];
        const seen = new Set();
        for (const cat of dbCats) {
            if (!seen.has(cat.categoryName)) {
                seen.add(cat.categoryName);
                uniqueCats.push({ id: cat.categoryId, name: cat.categoryName });
            }
        }
        
        setCategories([{ id: 'all', name: 'All Products' }, ...uniqueCats]);
      })
      .catch(e => console.error("Error fetching categories:", e));
  }, []);

  // 2. Fetch products whenever activeCategoryId changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchPromise = activeCategoryId === 'all'
      ? productService.getAll()
      : categoryService.getById(activeCategoryId);

    fetchPromise
      .then(res => {
         // If it's a category response, products are in res.data.products
         const fetchedProducts = res.data.products || res.data;
         setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
         setLoading(false);
      })
      .catch(e => {
         setError(e.message || 'An unexpected error occurred.');
         setLoading(false);
      });
  }, [activeCategoryId]);

  // 3. Filter by search query if user typed something
  let filtered = products;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.productName?.toLowerCase().includes(q));
  }

  // Reset visible count when category or search changes
  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategoryId, searchQuery]);

  // Intersection Observer for infinite scrolling
  const lastProductElementRef = useCallback(node => {
    if (loading || isFetchingNext) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < filtered.length) {
        setIsFetchingNext(true);
        // Simulate a short delay so the animation is visible
        setTimeout(() => {
          setVisibleCount(prev => prev + 12);
          setIsFetchingNext(false);
        }, 1500);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isFetchingNext, visibleCount, filtered.length]);

  return (
    <motion.div
      key="shop"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col md:flex-row gap-16 px-8 md:px-16 py-12 max-w-[1400px] mx-auto w-full"
    >
      {/* Sidebar Navigation & Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="sticky top-[120px]">
          
          {/* Search Input Box */}
          <div className="relative mb-12">
            <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search supplies" 
              className="w-full bg-transparent border-b border-stone py-3 pl-8 text-sm font-sans placeholder:text-charcoal/50 focus:outline-none focus:border-ochre transition-colors" 
            />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="w-4 h-[1px] bg-ochre inline-block" />
            <span className="text-ochre text-[0.65rem] tracking-[0.25em] font-sans font-bold uppercase">Category</span>
          </div>
          
          {/* Category List */}
          <div className="flex flex-col gap-4">
            {categories.map((cat) => {
              const isActive = activeCategoryId === String(cat.id);
              return (
                <button key={cat.id}
                  onClick={() => setActiveCategory(String(cat.id))}
                  className={`flex items-center text-sm font-sans transition-colors text-left
                    ${isActive ? 'text-charcoal font-semibold' : 'text-charcoal/60 hover:text-charcoal'}`}>
                  {isActive && <span className="w-6 h-[1px] bg-ochre inline-block mr-3" />}
                  {!isActive && <span className="w-6 h-[1px] bg-stone inline-block mr-3 opacity-30" />}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Product Grid */}
      <main className="flex-1 min-w-0">
        {loading && (
          <div className="flex justify-center py-32">
            <div className="w-9 h-9 border-[3px] border-stone border-t-ochre rounded-full animate-spin" />
          </div>
        )}

        {/* Display error message if API fails */}
        {error && (
          <div className="bg-red-50 border-l-[3px] border-red-500 px-4 py-3 text-red-900 text-sm font-sans mb-8">
            <p className="font-bold mb-1">Could not load products</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        )}

        {/* Display products or empty state */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-charcoal/50 font-sans">
                <p>No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filtered.slice(0, visibleCount).map((p, index) => {
                  const isLastElement = filtered.slice(0, visibleCount).length === index + 1;
                  return (
                    <div ref={isLastElement ? lastProductElementRef : null} key={p.productId}>
                      <ProductCard product={p} />
                    </div>
                  );
                })}
              </div>
            )}
            {isFetchingNext && <BrushLoader />}
          </>
        )}
      </main>
    </motion.div>
  );
}
