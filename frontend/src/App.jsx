import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import OrganizationSignup from './pages/auth/OrganizationSignup';
import AcceptInvite from './pages/auth/AcceptInvite';

// Dashboard Pages
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import AnalystDashboard from './pages/dashboard/AnalystDashboard';
import ReviewerDashboard from './pages/dashboard/ReviewerDashboard';

// Document Pages
import DocumentUpload from './pages/Documentupload';
import DocumentList from './pages/DocumentList';

// Role-based Dashboard Router Component
const WorkspaceDashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'owner' || user?.role === 'admin') {
    return <OwnerDashboard />;
  } else if (user?.role === 'analyst') {
    return <AnalystDashboard />;
  } else if (user?.role === 'reviewer') {
    return <ReviewerDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-400">Invalid role or authentication failed</p>
      </div>
    </div>
  );
};

// Placeholder component for pages not yet built
const ComingSoonPage = ({ title }) => {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-gray-400">Coming soon...</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<OrganizationSignup />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />

          {/* ========== WORKSPACE ROUTES ========== */}
          <Route path="/workspace/:slug">

            {/* Dashboard - All Authenticated Users */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst', 'reviewer']}>
                  <WorkspaceDashboard />
                </ProtectedRoute>
              }
            />

            {/* Team Management - Owner/Admin Only */}
            <Route
              path="team"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <ComingSoonPage title="Team Management" />
                </ProtectedRoute>
              }
            />

            {/* Upload Documents - Owner/Admin/Analyst */}
            <Route
              path="upload"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst']}>
                  <DocumentUpload />
                </ProtectedRoute>
              }
            />

            {/* Documents List - All Authenticated Users */}
            <Route
              path="documents"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst', 'reviewer']}>
                  <DocumentList />
                </ProtectedRoute>
              }
            />

            {/* Document Detail - All Authenticated Users (Phase 3) */}
            <Route
              path="documents/:id"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst', 'reviewer']}>
                  <ComingSoonPage title="Document Details" />
                </ProtectedRoute>
              }
            />

            {/* Requirements - All Authenticated Users */}
            <Route
              path="requirements"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst', 'reviewer']}>
                  <ComingSoonPage title="Requirements" />
                </ProtectedRoute>
              }
            />

            {/* Requirements Detail - All Authenticated Users */}
            <Route
              path="requirements/:id"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst', 'reviewer']}>
                  <ComingSoonPage title="Requirement Details" />
                </ProtectedRoute>
              }
            />

            {/* Analytics - Owner/Admin/Analyst */}
            <Route
              path="analytics"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst']}>
                  <ComingSoonPage title="Analytics" />
                </ProtectedRoute>
              }
            />

            {/* Review Queue - Owner/Admin/Reviewer */}
            <Route
              path="review"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'reviewer']}>
                  <ComingSoonPage title="Review Queue" />
                </ProtectedRoute>
              }
            />

            {/* Review Detail - Owner/Admin/Reviewer */}
            <Route
              path="review/:id"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'reviewer']}>
                  <ComingSoonPage title="Review Details" />
                </ProtectedRoute>
              }
            />

            {/* Approved - Owner/Admin/Reviewer */}
            <Route
              path="approved"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'reviewer']}>
                  <ComingSoonPage title="Approved Requirements" />
                </ProtectedRoute>
              }
            />

            {/* Rejected - Owner/Admin/Reviewer */}
            <Route
              path="rejected"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'reviewer']}>
                  <ComingSoonPage title="Rejected Requirements" />
                </ProtectedRoute>
              }
            />

            {/* Activity - All Authenticated Users */}
            <Route
              path="activity"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst', 'reviewer']}>
                  <ComingSoonPage title="Activity Log" />
                </ProtectedRoute>
              }
            />

            {/* Settings - All Authenticated Users */}
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst', 'reviewer']}>
                  <ComingSoonPage title="Settings" />
                </ProtectedRoute>
              }
            />

            {/* Profile - All Authenticated Users */}
            <Route
              path="profile"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'analyst', 'reviewer']}>
                  <ComingSoonPage title="Profile" />
                </ProtectedRoute>
              }
            />

            {/* Workspace root - redirect to dashboard */}
            <Route path="" element={<Navigate to="dashboard" replace />} />

            {/* Catch-all inside workspace - redirect to dashboard */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ========== LEGACY ROUTES REDIRECT ========== */}
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
          <Route path="/analyst/*" element={<Navigate to="/" replace />} />
          <Route path="/reviewer/*" element={<Navigate to="/" replace />} />

          {/* ========== GLOBAL CATCH-ALL ========== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;