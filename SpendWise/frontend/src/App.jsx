import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Login, Signup } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import { AddExpense, EditExpense, Details, Categories, Budget, Analytics, Simple } from './pages/CrudPages';
import { ProfilePage, SettingsPage } from './pages/ProfileSettings';
import './index.css';

function Protected() {
  const { user } = useAuth();
  return user ? <Layout /> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<Protected />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/expenses/:id" element={<Details />} />
            <Route path="/expenses/:id/edit" element={<EditExpense />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
