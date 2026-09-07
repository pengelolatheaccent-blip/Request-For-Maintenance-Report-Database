import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RequestsList from './pages/RequestsList'
import RequestForm from './pages/RequestForm'
import PrintView from './pages/PrintView'

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/requests" element={<Protected><RequestsList /></Protected>} />
          <Route path="/requests/new" element={<Protected><RequestForm /></Protected>} />
          <Route path="/requests/:id" element={<Protected><RequestForm /></Protected>} />
          <Route path="/requests/:id/print" element={<Protected><PrintView /></Protected>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
