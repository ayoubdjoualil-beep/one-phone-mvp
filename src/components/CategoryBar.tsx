import React from 'react';
import { Smartphone, Laptop, Watch, Headphones, Grid } from 'lucide-react';
import { ProductCategory } from '../types';
import { useCart } from '../context/CartContext';

interface CategoryItem {
  id: ProductCategory;
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
}

export const CategoryBar: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useCart();

  const categories: CategoryItem[] = [
    {
      id: 'all',
      label: 'الكل',
      icon: <Grid className="w-4 h-4" />
    },
    {
      id: 'phones',
      label: 'هواتف محمولة',
      subLabel: 'iPhone & Android',
      icon: <Smartphone className="w-4 h-4" />
    },
    {
      id: 'laptops',
      label: 'حواسيب Pc portable',
      subLabel: 'HP Victus, ROG, Mac',
      icon: <Laptop className="w-4 h-4" />
    },
    {
      id: 'watches',
      label: 'ساعات ذكية',
      subLabel: 'Smartwatch',
      icon: <Watch className="w-4 h-4" />
    },
    {
      id: 'accessories',
      label: 'أكسسوارات',
      subLabel: 'AirPods & Chargers',
      icon: <Headphones className="w-4 h-4" />
    }
  ];

  return (
    <div className="bg-white border-b border-gray-100 py-2.5">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30 scale-102'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200/60'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-amber-600'}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
