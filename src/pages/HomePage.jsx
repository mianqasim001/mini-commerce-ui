import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/api';

// Local dynamic category images mapped to backend uploads folder
const CATEGORY_IMAGES = {
  'Paints': 'http://localhost:5190/uploads/CATEGORY/Category-1.jpg',
  'Brushes': 'http://localhost:5190/uploads/CATEGORY/Category-2.jpg',
  'Canvas': 'http://localhost:5190/uploads/CATEGORY/Category-3.jpg',
  'Pencils': 'http://localhost:5190/uploads/CATEGORY/Category-4.jpg',
  'Sketchbooks': 'http://localhost:5190/uploads/CATEGORY/Category-5.jpg',
  'Mediums': 'http://localhost:5190/uploads/CATEGORY/Category-1.jpg',
  'All Supplies': 'http://localhost:5190/uploads/CATEGORY/Category-1.jpg',
  'Default': 'http://localhost:5190/uploads/CATEGORY/Category-1.jpg'
};

export function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAll()
      .then(({ data }) => {
        // Filter out 'All Supplies' database category from home
        const filtered = data.filter(c => c.categoryName && c.categoryName.toLowerCase() !== 'all supplies');
        setCategories(filtered.slice(0, 5));
      })
      .catch(err => console.error("Failed to fetch categories:", err));
  }, []);

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero Section */}
      <section className="min-h-[calc(100vh-80px)] max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-12 overflow-hidden">
        <div className="flex-1 max-w-xl relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <span className="w-6 h-[1px] bg-ochre inline-block" />
            <span className="text-ochre text-[0.65rem] tracking-[0.25em] font-sans font-bold uppercase">The 2026 Collection</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif text-charcoal leading-[1.05] mb-8">
            Master<br />
            <em className="font-light italic pr-2">your</em> craft.
          </h1>
          
          <p className="text-charcoal/70 text-[0.95rem] max-w-md mb-12 leading-relaxed font-sans">
            Hand-selected pigments, sable brushes, and Belgian linen — the same supplies trusted by working studio artists for over a century.
          </p>
          
          <div className="flex items-center gap-8 flex-wrap">
            <button 
              onClick={() => navigate('/shop')}
              className="bg-charcoal text-white text-[0.7rem] tracking-[0.2em] font-bold uppercase px-8 py-4 flex items-center gap-3 hover:bg-black transition-colors"
            >
              Shop the Collection <span className="text-lg leading-none mt-[1px]">→</span>
            </button>
            
            {/* Scroll to categories when clicked */}
            <button 
              onClick={() => {
                document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-charcoal text-[0.7rem] tracking-[0.2em] font-bold uppercase flex items-center gap-3 hover:text-ochre transition-colors"
            >
              Explore by Category <span className="w-8 h-[1px] bg-current inline-block" />
            </button>
          </div>
        </div>

        <div className="flex-1 mt-16 md:mt-0 relative flex justify-end">
          {/* Decorative frame line */}
          <div className="absolute top-[-20px] left-[10%] right-[10%] bottom-[-20px] border border-ochre/30 z-0 pointer-events-none hidden md:block" />
          
          <img 
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1000&q=80" 
            alt="Art brushes" 
            className="w-full md:w-[90%] max-w-[600px] h-[500px] md:h-[600px] object-cover shadow-xl relative z-10"
          />
        </div>
      </section>

      {/* Categories Navigation Cards */}
      {/* These navigate to the shop page with the selected category filter */}
      <section id="categories" className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-center gap-3 mb-12 justify-center">
          <span className="w-6 h-[1px] bg-ochre inline-block" />
          <h2 className="text-ochre text-[0.7rem] tracking-[0.25em] font-sans font-bold uppercase">Categories</h2>
          <span className="w-6 h-[1px] bg-ochre inline-block" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {categories.map((c) => (
            <motion.div
              key={c.categoryId}
              whileHover={{ y: -6 }}
              onClick={() => navigate(`/shop?category=${c.categoryId}`)}
              className="group cursor-pointer flex flex-col items-center"
            >
              <div className="w-[140px] h-[140px] rounded-full overflow-hidden mb-6 border border-stone/50 bg-stone/20">
                <img 
                   src={CATEGORY_IMAGES[c.categoryName] || CATEGORY_IMAGES.Default} 
                   alt={c.categoryName} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <p className="font-serif text-charcoal text-[1.1rem] group-hover:text-ochre transition-colors text-center">{c.categoryName}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-stone/5 py-24 px-8 border-y border-stone/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <span className="w-6 h-[1px] bg-ochre inline-block" />
            <span className="text-ochre text-[0.65rem] tracking-[0.25em] font-sans font-bold uppercase">Our Story</span>
            <span className="w-6 h-[1px] bg-ochre inline-block" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-8 leading-tight">
            Crafting the future of <br />
            <em className="font-light italic text-ochre">artistic expression.</em>
          </h2>
          
          <div className="space-y-6 text-charcoal/70 text-[1.05rem] leading-relaxed font-sans max-w-2xl mx-auto">
            <p>
              Art Effect began as a small studio corner, dedicated to the belief that every artist deserves tools that resonate with their passion. We don't just sell supplies; we curate experiences for the modern creator.
            </p>
            <p>
              From our hand-poured pigments to our ethically sourced brushes, every item in our collection is a testament to quality and the timeless spirit of the arts.
            </p>
          </div>
          
          <div className="mt-12 flex justify-center">
             <div className="w-12 h-12 border border-stone/30 rounded-full flex items-center justify-center rotate-45">
                <div className="w-8 h-[1px] bg-stone/50" />
             </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
