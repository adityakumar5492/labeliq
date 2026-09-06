import { useEffect, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    History as HistoryIcon,
    LoaderCircle,
    ScanLine,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../api/axios";

const History = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const response = await api.get("/scans");

                setScans(response.data.data || []);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Unable to load scan history."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "Unknown date";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    const assessmentLabels = {
        everyday: "Everyday",
        regular: "Regular",
        occasional: "Occasional",
        "insufficient-data": "Insufficient data",
    };

    const assessmentStyles = {
        everyday:
            "bg-emerald-50 text-emerald-700",
        regular:
            "bg-blue-50 text-blue-700",
        occasional:
            "bg-amber-50 text-amber-700",
        "insufficient-data":
            "bg-gray-100 text-gray-600",
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-gray-50">
            <main className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

                {/* Back */}
                <Link
                    to="/dashboard"
                    className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span>Back to dashboard</span>
                </Link>

                {/* Header */}
                <div className="mt-6 sm:mt-8">
                    <div className="flex items-start gap-3 sm:items-center sm:gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                            <HistoryIcon className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                                Scan history
                            </h1>

                            <p className="mt-1 text-sm leading-5 text-gray-500 sm:text-base">
                                Products you have previously analyzed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700 sm:mt-8 sm:px-4">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="mt-10 flex justify-center sm:mt-12">
                        <LoaderCircle className="h-7 w-7 animate-spin text-emerald-600" />
                    </div>
                ) : scans.length === 0 ? (
                    /* Empty state */
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:mt-8 sm:p-10">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                            <ScanLine className="h-6 w-6 text-gray-500" />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-gray-900">
                            No scans yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            Once you analyze a product, it will appear here so you can quickly access it again.
                        </p>

                        <Link
                            to="/products/new"
                            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 active:bg-emerald-800 sm:mt-6"
                        >
                            Analyze a product
                        </Link>
                    </div>
                ) : (
                    /* Scan list */
                    <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
                        {scans.map((scan) => {
                            const product = scan.product;

                            return (
                                <Link
                                    key={scan._id}
                                    to={`/products/${product?._id}`}
                                    className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-sm active:bg-gray-50 sm:p-6"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">

                                        {/* Product info */}
                                        <div className="flex min-w-0 gap-3 sm:gap-4">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 sm:h-11 sm:w-11">
                                                <ScanLine className="h-5 w-5 text-emerald-600" />
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="break-words font-bold text-gray-900">
                                                    {product?.name ||
                                                        "Unknown product"}
                                                </h2>

                                                {product?.brand && (
                                                    <p className="mt-1 break-words text-sm text-gray-500">
                                                        {product.brand}
                                                    </p>
                                                )}

                                                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-400 sm:mt-3">

                                                    <span className="inline-flex items-center gap-1">
                                                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                                        <span>
                                                            {formatDate(
                                                                scan.createdAt
                                                            )}
                                                        </span>
                                                    </span>

                                                    <span className="break-words">
                                                        Input:{" "}
                                                        {scan.inputType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assessment */}
                                        {scan.assessment && (
                                            <span
                                                className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                    assessmentStyles[
                                                        scan.assessment
                                                    ] ||
                                                    "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {assessmentLabels[
                                                    scan.assessment
                                                ] ||
                                                    scan.assessment}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;