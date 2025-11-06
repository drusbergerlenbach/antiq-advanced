import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, Bell, Globe, Clock, LogOut, User, Tag, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export function Settings() {
  const navigate = useNavigate();
  const { user, logout, categories, fetchCategories, updateCategory, createCategory, deleteCategory } = useStore();
  const [notifications, setNotifications] = useState(false);
  const [timezone, setTimezone] = useState('Europe/Zurich');
  const [language, setLanguage] = useState('de');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#4A90E2');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleLogout = async () => {
    if (window.confirm('Möchten Sie sich wirklich abmelden?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleEditCategory = (id: string, name: string, color: string) => {
    setEditingCategoryId(id);
    setEditName(name);
    setEditColor(color);
  };

  const handleSaveCategory = async () => {
    if (editingCategoryId && editName.trim()) {
      await updateCategory(editingCategoryId, { name: editName, color: editColor });
      setEditingCategoryId(null);
      setEditName('');
      setEditColor('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditName('');
    setEditColor('');
  };

  const handleCreateCategory = async () => {
    if (newName.trim()) {
      await createCategory({ name: newName, color: newColor, active: true });
      setIsCreating(false);
      setNewName('');
      setNewColor('#4A90E2');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Möchten Sie die Kategorie "${name}" wirklich löschen?`)) {
      await deleteCategory(id);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await updateCategory(id, { active: !active });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2" />
          Einstellungen
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-gray-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Benutzerprofil</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{user?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rolle:</span>
              <span className="font-medium text-gray-900">
                {user?.role === 'admin' ? 'Administrator' : 'Benutzer'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-gray-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Benachrichtigungen</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Browser-Benachrichtigungen</p>
              <p className="text-sm text-gray-600">
                Erhalte Erinnerungen für fällige Aufgaben
              </p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                notifications ? 'bg-green-500' : 'bg-gray-300'
              }`}
              style={{ minHeight: '44px', minWidth: '56px' }}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                  notifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-gray-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Zeitzone</h2>
          </div>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="Europe/Zurich">Europa/Zürich (CET)</option>
            <option value="Europe/Berlin">Europa/Berlin (CET)</option>
            <option value="Europe/Vienna">Europa/Wien (CET)</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-gray-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Sprache</h2>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Tag className="w-5 h-5 text-gray-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">Kategorien</h2>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-3 py-1.5 bg-antiq-amber text-antiq-blue rounded-lg hover:bg-opacity-90 transition font-medium flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              Neue Kategorie
            </button>
          </div>

          {isCreating && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Kategoriename"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent"
                />
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Farbe:</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['#4A90E2', '#E94F37', '#7BC950', '#FFC857', '#A066FF', '#FF6B9D', '#00BCD4', '#8E9AAF'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewColor(color)}
                        className={`w-10 h-10 rounded-lg transition ${
                          newColor === color ? 'ring-2 ring-offset-2 ring-antiq-blue scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Eigene Farbe:</label>
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium" style={{ color: newColor }}>
                      {newColor}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCategory}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Erstellen
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewName('');
                      setNewColor('#4A90E2');
                    }}
                    className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                {editingCategoryId === category.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent"
                    />
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Farbe:</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {['#4A90E2', '#E94F37', '#7BC950', '#FFC857', '#A066FF', '#FF6B9D', '#00BCD4', '#8E9AAF'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditColor(color)}
                            className={`w-10 h-10 rounded-lg transition ${
                              editColor === color ? 'ring-2 ring-offset-2 ring-antiq-blue scale-110' : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Eigene Farbe:</label>
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <span className="text-sm font-medium" style={{ color: editColor }}>
                          {editColor}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveCategory}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Speichern
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <button
                        onClick={() => handleToggleActive(category.id, category.active)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          category.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {category.active ? 'Aktiv' : 'Inaktiv'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category.id, category.name, category.color)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition"
        >
          <LogOut className="w-5 h-5" />
          Abmelden
        </button>

        <div className="text-center text-sm text-gray-500 py-4">
          <p>AntiQ v1.0</p>
          <p className="mt-1">Organize with intelligence.</p>
        </div>
      </div>
    </div>
  );
}
