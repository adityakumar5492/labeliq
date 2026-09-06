import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProductAnalysis from "./pages/ProductAnalysis";
import ProductComparison from "./pages/ProductComparison";
import History from "./pages/History";
import ProductInput from "./pages/ProductInput";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/products/:productId"
                        element={<ProductAnalysis />}
                    />

                    <Route
                        path="/compare"
                        element={<ProductComparison />}
                    />

                    <Route
                        path="/history"
                        element={<History />}
                    />

                    <Route
                        path="/products/new"
                        element={<ProductInput />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;