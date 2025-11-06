import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Check, ChevronRight } from 'lucide-react';

export function CategoryPanel() {
  const {
    categories,
    filterCategories,
    categoryPanelOpen,
    setCategoryPanelOpen,
    toggleCategoryFilter,
    clearCategoryFilters,
    selectAllCategories,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setCategoryPanelOpen(!categoryPanelOpen);
        }
      }
      if (e.key === 'Escape' && categoryPanelOpen) {
        setCategoryPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categoryPanelOpen, setCategoryPanelOpen]);

  if (!categoryPanelOpen) return null;

  const activeCategories = categories.filter((c) => c.active);

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={() => setCategoryPanelOpen(false)}
        aria-hidden="true"
      />

      <div
        className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-soft-lg z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-panel-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-antiq-gray">
          <h2 id="category-panel-title" className="text-lg font-semibold text-antiq-blue">
            Kategorien filtern
          </h2>
          <button
            onClick={() => setCategoryPanelOpen(false)}
            className="p-1.5 hover:bg-antiq-gray rounded-full transition opacity-40 hover:opacity-100"
            aria-label="Schließen"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex gap-2 p-4 border-b border-antiq-gray">
          <button
            onClick={selectAllCategories}
            className="flex-1 px-3 py-2 bg-antiq-amber text-antiq-blue rounded-lg font-medium hover:bg-opacity-90 transition"
          >
            Alle auswählen
          </button>
          <button
            onClick={clearCategoryFilters}
            className="flex-1 px-3 py-2 bg-antiq-gray text-antiq-blue rounded-lg font-medium hover:bg-opacity-80 transition"
          >
            Zurücksetzen
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Kategorien verfügbar</p>
          ) : (
            activeCategories.map((category) => {
              const isSelected = filterCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategoryFilter(category.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCategoryFilter(category.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition ${
                    isSelected
                      ? 'border-antiq-amber bg-antiq-amber bg-opacity-10'
                      : 'border-antiq-gray hover:bg-antiq-gray hover:bg-opacity-50'
                  }`}
                  role="checkbox"
                  aria-checked={isSelected}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center border-2 flex-shrink-0"
                    style={{
                      borderColor: category.color,
                      backgroundColor: isSelected ? category.color : 'transparent',
                    }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />

                  <span className="font-medium text-antiq-blue flex-1 text-left">
                    {category.name}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-antiq-gray bg-gray-50 space-y-3">
          <button
            onClick={() => setCategoryPanelOpen(false)}
            className="w-full px-4 py-3 bg-antiq-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition shadow-sm"
          >
            Fertig
          </button>
          <p className="text-xs text-gray-500 text-center">
            Tastenkürzel: <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">C</kbd> oder{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">ESC</kbd>
          </p>
        </div>
      </div>
    </>
  );
}
