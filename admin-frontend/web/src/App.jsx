import AuthPage from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

{
  /* <Route element={<ProtectedRoute />}>
    <Route
      path="/admin-dashboard/home/:company_id"
      element={<Home />}
    />
    <Route path="/admin-dashboard" element={<AdminDashboard />} />
    <Route path="/admin" element={<AdminDashboard />} />
  </Route> */
}
export default App;
