import { useState } from 'react';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface AdvancedFiltersProps {
  fields: FilterField[];
  onApply: (filters: Record<string, any>) => void;
  onReset: () => void;
}

const AdvancedFilters = ({ fields, onApply, onReset }: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleChange = (name: string, value: any) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Count active filters
    const count = Object.values(newFilters).filter(v => v !== '' && v !== null && v !== undefined).length;
    setActiveFiltersCount(count);
  };

  const handleApply = () => {
    // Remove empty values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    onApply(cleanFilters);
  };

  const handleReset = () => {
    setFilters({});
    setActiveFiltersCount(0);
    onReset();
  };

  return (
    <div className="bg-base border border-primary rounded-lg">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-primary">Advanced Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-600 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="text-sm text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
            >
              Clear all
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-secondary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-secondary" />
          )}
        </div>
      </div>

      {/* Filters */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {fields.map((field) => (
              <div key={field.name}>
                {field.type === 'text' && (
                  <Input
                    label={field.label}
                    value={filters[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}

                {field.type === 'number' && (
                  <Input
                    label={field.label}
                    type="number"
                    value={filters[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}

                {field.type === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      {field.label}
                    </label>
                    <select
                      value={filters[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full px-4 py-2 bg-base border border-primary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {field.type === 'date' && (
                  <Input
                    label={field.label}
                    type="date"
                    value={filters[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}

                {field.type === 'daterange' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      {field.label}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={filters[`${field.name}_from`] || ''}
                        onChange={(e) => handleChange(`${field.name}_from`, e.target.value)}
                        placeholder="From"
                      />
                      <Input
                        type="date"
                        value={filters[`${field.name}_to`] || ''}
                        onChange={(e) => handleChange(`${field.name}_to`, e.target.value)}
                        placeholder="To"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="primary" onClick={handleApply} className="flex-1">
              <Filter className="w-4 h-4" />
              Apply Filters
            </Button>
            <Button variant="secondary" onClick={handleReset} className="flex-1">
              <X className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;