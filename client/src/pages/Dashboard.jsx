import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ChevronRight,
    FileSearch,
    History,
    ScanLine,
    Scale,
    ShieldCheck,
    Sparkles,
    Target,
    Utensils,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();

    const goalLabels = {
        general: "General",
        "low-sugar": "Low Sugar",
        "low-sodium": "Low Sodium",
        "high-protein": "High Protein",
        "high-fiber": "High Fiber",
    };

    const goalDescriptions = {
        general:
            "Get a balanced view of nutrition, ingredients, and product information.",

        "low-sugar":
            "Focus on products with lower sugar per serving.",

        "low-sodium":
            "Pay closer attention to sodium levels per serving.",

        "high-protein":
            "Find products that provide more protein per serving.",

        "high-fiber":
            "Focus on products that provide more fiber per serving.",
    };

    const currentGoalKey =
        user?.preferences?.goal || "general";

    const currentGoal =
        goalLabels[currentGoalKey] || "General";

    const currentGoalDescription =
        goalDescriptions[currentGoalKey] ||
        goalDescriptions.general;

    const firstName = user?.name
        ? user.name.split(" ")[0]
        : "";

    return (
        <div className="min-h-screen overflow-x-hidden bg-gray-50">
            <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

                {/* Hero */}
                <section className="relative overflow-hidden rounded-2xl bg-gray-950 px-4 py-6 text-white shadow-sm sm:rounded-3xl sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                    <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />

                    <div className="relative max-w-3xl">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                                Smarter food label analysis
                            </span>
                        </div>

                        <h1 className="mt-4 break-words text-3xl font-bold tracking-tight sm:mt-5 sm:text-4xl lg:text-5xl">
                            Welcome back
                            {firstName
                                ? `, ${firstName}`
                                : ""}
                            .
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 sm:mt-4 sm:text-base sm:leading-7">
                            Understand what is inside your food,
                            see how it fits your goals, and make
                            more informed everyday choices.
                        </p>

                        <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
                            <Link
                                to="/products/new"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 active:bg-emerald-600"
                            >
                                <ScanLine className="h-4 w-4 shrink-0" />
                                <span>Analyze a product</span>
                                <ArrowRight className="h-4 w-4 shrink-0" />
                            </Link>

                            <Link
                                to="/history"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10 active:bg-white/15"
                            >
                                <History className="h-4 w-4 shrink-0" />
                                <span>View scan history</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Overview */}
                <section className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">

                    {/* Product analysis */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                <ScanLine className="h-5 w-5 text-emerald-600" />
                            </div>

                            <span className="text-xs font-medium text-gray-400">
                                Core
                            </span>
                        </div>

                        <p className="mt-4 text-lg font-bold text-gray-950 sm:mt-5">
                            Product analysis
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                            Nutrition and label insights in one place.
                        </p>
                    </div>

                    {/* Nutrition */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                            </div>

                            <span className="text-xs font-medium text-gray-400">
                                Detailed
                            </span>
                        </div>

                        <p className="mt-4 text-lg font-bold text-gray-950 sm:mt-5">
                            Nutrition breakdown
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                            Compare nutrients across servings.
                        </p>
                    </div>

                    {/* Ingredient insights */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                                <FileSearch className="h-5 w-5 text-purple-600" />
                            </div>

                            <span className="text-xs font-medium text-gray-400">
                                Evidence
                            </span>
                        </div>

                        <p className="mt-4 text-lg font-bold text-gray-950 sm:mt-5">
                            Ingredient insights
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                            Explore available ingredient references.
                        </p>
                    </div>

                    {/* Explainable results */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                                <ShieldCheck className="h-5 w-5 text-amber-600" />
                            </div>

                            <span className="text-xs font-medium text-gray-400">
                                Transparent
                            </span>
                        </div>

                        <p className="mt-4 text-lg font-bold text-gray-950 sm:mt-5">
                            Explainable results
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                            Clear separation between facts and AI.
                        </p>
                    </div>
                </section>

                {/* Goal + Analyze */}
                <section className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">

                    {/* Goal */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-1">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                <Target className="h-5 w-5 text-emerald-600" />
                            </div>

                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Current goal
                            </span>
                        </div>

                        <p className="mt-5 text-sm font-medium text-gray-500 sm:mt-6">
                            Your nutrition focus
                        </p>

                        <h2 className="mt-1 break-words text-2xl font-bold text-gray-950">
                            {currentGoal}
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            {currentGoalDescription}
                        </p>

                        <Link
                            to="/profile"
                            className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 sm:mt-6"
                        >
                            Update preferences
                            <ArrowRight className="h-4 w-4 shrink-0" />
                        </Link>
                    </div>

                    {/* Analyze */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm sm:p-6 lg:col-span-2">
                        <div className="flex flex-col justify-between gap-5 sm:gap-6 lg:flex-row">

                            <div className="min-w-0 max-w-xl">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                                    <Utensils className="h-5 w-5 text-emerald-600" />
                                </div>

                                <h2 className="mt-4 break-words text-2xl font-bold text-gray-950 sm:mt-5">
                                    Know more before you eat
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-gray-600 sm:leading-7">
                                    Analyze a product to see its
                                    nutrition, ingredients, personal
                                    goal alignment, and evidence-backed
                                    insights.
                                </p>
                            </div>

                            <div className="flex shrink-0 items-end">
                                <Link
                                    to="/products/new"
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:bg-gray-900 sm:w-auto"
                                >
                                    Start analysis
                                    <ArrowRight className="h-4 w-4 shrink-0" />
                                </Link>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-2.5 sm:mt-7 sm:grid-cols-3 sm:gap-3">

                            <div className="rounded-xl border border-emerald-100 bg-white/80 p-4">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                                <p className="mt-3 text-sm font-semibold text-gray-900">
                                    Nutrition
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Understand key nutrients per serving.
                                </p>
                            </div>

                            <div className="rounded-xl border border-emerald-100 bg-white/80 p-4">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                                <p className="mt-3 text-sm font-semibold text-gray-900">
                                    Ingredients
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    See available trusted references.
                                </p>
                            </div>

                            <div className="rounded-xl border border-emerald-100 bg-white/80 p-4">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                                <p className="mt-3 text-sm font-semibold text-gray-900">
                                    Your goal
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    See how the product fits your focus.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="mt-7 sm:mt-8">
                    <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-emerald-600">
                                Explore LabelIQ
                            </p>

                            <h2 className="mt-1 break-words text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
                                Built for smarter label decisions
                            </h2>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">

                        {/* History */}
                        <Link
                            to="/history"
                            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md active:bg-gray-50 sm:p-6"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-emerald-50">
                                    <History className="h-5 w-5 text-gray-600 transition group-hover:text-emerald-600" />
                                </div>

                                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-gray-950 sm:mt-5">
                                Scan history
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Review products you have previously
                                analyzed and revisit their results.
                            </p>
                        </Link>

                        {/* Product Comparison */}
                        <Link
                            to="/compare"
                            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md active:bg-gray-50 sm:p-6"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 transition group-hover:bg-emerald-100">
                                    <Scale className="h-5 w-5 text-emerald-600" />
                                </div>

                                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-gray-950 sm:mt-5">
                                Compare products
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Compare nutrition and scores to find the
                                better choice for your goal.
                            </p>
                        </Link>

                        {/* Multi-serving */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-gray-950 sm:mt-5">
                                Multi-serving analysis
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                See how nutrition changes when you eat
                                more than one serving.
                            </p>
                        </div>

                        {/* Ingredient Evidence */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                                <FileSearch className="h-5 w-5 text-purple-600" />
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-gray-950 sm:mt-5">
                                Ingredient evidence
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Explore available information from
                                trusted ingredient references.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Trust Footer */}
                <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="font-bold text-gray-950">
                                    Clear, explainable results
                                </h2>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                                    LabelIQ keeps product label facts,
                                    nutrition calculations, trusted
                                    references, and AI explanations
                                    clearly separated.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/products/new"
                            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                        >
                            Analyze a product
                            <ArrowRight className="h-4 w-4 shrink-0" />
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;