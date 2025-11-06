import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Login } from './pages/Login';
import { TaskList } from './pages/TaskList';
import { TaskDetail } from './pages/TaskDetail';
import { Settings } from './pages/Settings';
import { UntimedTasks } from './pages/UntimedTasks';
import { Layout } from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const initAuth = useStore((state) => state.initAuth);

  useEffect(() => {
    initAuth().finally(() => setAuthInitialized(true));
  }, [initAuth]);

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiq-amber mx-auto mb-4"></div>
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TaskList />} />
          <Route path="all" element={<TaskList />} />
          <Route path="untimed" element={<UntimedTasks />} />
          <Route path="task/:id" element={<TaskDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
