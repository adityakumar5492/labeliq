import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ScanLine,
} from "lucide-react";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register", formData);

            const loginResponse = await api.post(
                "/auth/login",
                {
                    email: formData.email,
                    password: formData.password,
                }
            );

            const { token, user } =
                loginResponse.data.data;

            login(token, user);

            navigate("/dashboard");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to create your account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

    return (
        <div className="min-h-screen overflow-x-hidden bg-gray-50">
            <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:px-6 sm:py-10">

                {/* Logo */}
                <Link
                    to="/"
                    className="mx-auto inline-flex min-h-10 items-center gap-2 text-xl font-bold text-gray-900"
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600">
                        <ScanLine className="h-5 w-5 text-white" />
                    </span>

                    <span>LabelIQ</span>
                </Link>

                {/* Register card */}
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-8">

                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                            Create your account
                        </h1>

                        <p className="mt-2 text-sm leading-5 text-gray-500">
                            Start understanding your food labels.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700 sm:mt-6 sm:px-4">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-5 space-y-4 sm:mt-6 sm:space-y-5"
                    >
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                autoComplete="name"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                className={inputClass}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                "Creating account..."
                            ) : (
                                <>
                                    <span>Create account</span>
                                    <ArrowRight className="h-4 w-4 shrink-0" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm leading-5 text-gray-500 sm:mt-6">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Back */}
                <Link
                    to="/"
                    className="mt-5 py-2 text-center text-sm text-gray-500 transition hover:text-gray-900 sm:mt-6"
                >
                    ← Back to LabelIQ
                </Link>
            </div>
        </div>
    );
};

export default Register;