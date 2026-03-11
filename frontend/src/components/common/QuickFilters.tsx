interface QuickFilter {
  label: string;
  value: Record<string, any>;
  icon?: React.ReactNode;
  color?: string;
}

interface QuickFiltersProps {
  filters: QuickFilter[];
  onSelect: (filters: Record<string, any>) => void;
}

const QuickFilters = ({ filters, onSelect }: QuickFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter, index) => (
        <button
          key={index}
          onClick={() => onSelect(filter.value)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-colors border-2
            ${filter.color || 'border-primary-200 dark:border-primary-800 text-primary hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'}
          `}
        >
          {filter.icon}
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default QuickFilters;