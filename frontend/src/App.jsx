import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import OrganizationSignup from './pages/auth/OrganizationSignup';

// TODO: Create these pages
// import AcceptInvite from './pages/auth/AcceptInvite';

// Temporary dashboard placeholders
const WorkspaceDashboard = () => {
  // This will show different content based on user role
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          {user?.role === 'owner' && 'Owner Dashboard'}
          {user?.role === 'admin' && 'Admin Dashboard'}
          {user?.role === 'analyst' && 'Analyst Dashboard'}
          {user?.role === 'reviewer' && 'Reviewer Dashboard'}
        </h1>
        <p className="text-gray-400">Coming soon...</p>
        <p className="text-gray-500 text-sm mt-2">
          Organization: {user?.organization?.name}
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<OrganizationSignup />} />

          {/* Accept Invitation - TODO: Create this component */}
          {/* <Route path="/accept-invite/:token" element={<AcceptInvite />} /> */}

          {/* Multi-Tenant Workspace Routes */}
          <Route
            path="/workspace/:slug/*"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst', 'reviewer']}>
                <Routes>
                  <Route path="dashboard" element={<WorkspaceDashboard />} />
                  {/* Add more workspace routes here later */}
                  {/* <Route path="team" element={<TeamManagement />} /> */}
                  {/* <Route path="upload" element={<UploadPage />} /> */}
                  {/* <Route path="requirements" element={<RequirementsList />} /> */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Legacy routes - redirect to workspace */}
          <Route path="/admin/*" element={<Navigate to="/workspace" replace />} />
          <Route path="/analyst/*" element={<Navigate to="/workspace" replace />} />
          <Route path="/reviewer/*" element={<Navigate to="/workspace" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;