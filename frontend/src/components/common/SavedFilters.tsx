import { useState, useEffect } from 'react';
import { Bookmark, Trash2, Plus } from 'lucide-react';
import Button from '../ui/Button';

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
}

interface SavedFiltersProps {
  category: string; // 'agencies', 'properties', 'transactions', etc.
  onApply: (filters: Record<string, any>) => void;
  currentFilters: Record<string, any>;
}

const SavedFilters = ({ category, onApply, currentFilters }: SavedFiltersProps) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    loadSavedFilters();
  }, [category]);

  const loadSavedFilters = () => {
    const saved = localStorage.getItem(`saved_filters_${category}`);
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: currentFilters,
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(`saved_filters_${category}`, JSON.stringify(updated));
    
    setFilterName('');
    setShowSaveModal(false);
  };

  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(`saved_filters_${category}`, JSON.stringify(updated));
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  return (
    <div className="space-y-3">
      {/* Save Current Filter Button */}
      {hasActiveFilters && !showSaveModal && (
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <Plus className="w-4 h-4" />
          Save current filter
        </button>
      )}

      {/* Save Filter Input */}
      {showSaveModal && (
        <div className="flex gap-2">
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Filter name..."
            className="flex-1 px-3 py-2 bg-base border border-primary rounded-lg text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyPress={(e) => e.key === 'Enter' && saveCurrentFilter()}
          />
          <Button variant="primary" onClick={saveCurrentFilter} className="text-sm">
            Save
          </Button>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)} className="text-sm">
            Cancel
          </Button>
        </div>
      )}

      {/* Saved Filters List */}
      {savedFilters.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-secondary uppercase tracking-wider">
            Saved Filters
          </p>
          <div className="space-y-1">
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <button
                  onClick={() => onApply(filter.filters)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <Bookmark className="w-4 h-4 text-primary-600" />
                  <span className="text-sm text-primary">{filter.name}</span>
                </button>
                <button
                  onClick={() => deleteFilter(filter.id)}
                  className="p-1 hover:bg-danger-100 dark:hover:bg-danger-900 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-danger-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedFilters;