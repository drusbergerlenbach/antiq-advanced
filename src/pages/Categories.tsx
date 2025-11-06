import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Tag } from 'lucide-react';

export function Categories() {
  const { categories, fetchCategories, updateCategory } = useStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await updateCategory(id, { active: !currentActive });
  };

  const handleColorChange = async (id: string, color: string) => {
    await updateCategory(id, { color });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Tag className="w-6 h-6 mr-2" />
          Kategorien verwalten
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Kategorien aktivieren/deaktivieren und Farben anpassen
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Farbe
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Aktiv
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={category.color}
                          onChange={(e) => handleColorChange(category.id, e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                        />
                        <span className="text-sm text-gray-600 font-mono">
                          {category.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleActive(category.id, category.active)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                          category.active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{ minHeight: '44px', minWidth: '56px' }}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                            category.active ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Hinweis:</strong> Deaktivierte Kategorien werden in der Aufgabenliste nicht
            angezeigt, beeinflussen jedoch keine Alarme oder bestehende Aufgaben.
          </p>
        </div>
      </div>
    </div>
  );
}
