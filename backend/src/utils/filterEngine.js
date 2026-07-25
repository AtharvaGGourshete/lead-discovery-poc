import { FILTERS } from "../config/filterConfig.js";

/**
 * Extract a financial metric from the Income Statement
 */
function getFinancialValue(statement, key) {

    if (!statement?.stockFinancialMap?.INC)
        return null;

    const item = statement.stockFinancialMap.INC.find(
        (metric) => metric.key === key
    );

    if (!item || item.value == null)
        return null;

    const value = Number(item.value);

    return Number.isNaN(value)
        ? null
        : value;
}

/**
 * Calculate Year-over-Year Revenue Growth (%)
 */
function calculateGrowth(financials = []) {

    const annualStatements = financials
        .filter(
            (statement) => statement.Type === "Annual"
        )
        .sort(
            (a, b) =>
                Number(b.FiscalYear) -
                Number(a.FiscalYear)
        );

    if (annualStatements.length < 2)
        return null;

    const currentRevenue = getFinancialValue(
        annualStatements[0],
        "Revenue"
    );

    const previousRevenue = getFinancialValue(
        annualStatements[1],
        "Revenue"
    );

    if (
        currentRevenue == null ||
        previousRevenue == null ||
        previousRevenue === 0
    )
        return null;

    return (
        ((currentRevenue - previousRevenue) /
            previousRevenue) *
        100
    );
}

/**
 * Revenue Filter
 */
function passesRevenue(company) {

    return (
        company.revenue != null &&
        company.revenue >=
            FILTERS.minimumRevenueCrores
    );

}

/**
 * Industry Filter
 */
function passesIndustry(company) {

    if (!company.industry)
        return false;

    return FILTERS.allowedSectors.includes(
        company.industry
    );

}

/**
 * Country Filter
 *
 * IndianAPI currently returns only Indian listed companies.
 */
function passesCountry() {

    return true;

}

/**
 * Main Filter Engine
 */
export function applyFilters(
    company,
    financials
) {

    const growthPercentage =
        calculateGrowth(financials);

    const revenuePass =
        passesRevenue(company);

    const growthPass =
        growthPercentage != null &&
        growthPercentage >=
            FILTERS.minimumRevenueGrowth;

    const industryPass =
        passesIndustry(company);

    const countryPass =
        passesCountry();

    const filters = {

        revenue: {
            passed: revenuePass,
            value: company.revenue,
            minimum:
                FILTERS.minimumRevenueCrores,
            message: revenuePass
                ? "Revenue meets minimum requirement."
                : "Revenue below minimum threshold.",
        },

        growth: {
            passed: growthPass,
            value: growthPercentage,
            minimum:
                FILTERS.minimumRevenueGrowth,
            message: growthPass
                ? "Revenue growth meets requirement."
                : "Revenue growth below minimum threshold.",
        },

        industry: {
            passed: industryPass,
            value: company.industry,
            message: industryPass
                ? "Industry is supported."
                : "Industry is not supported.",
        },

        country: {
            passed: countryPass,
            value: "India",
            message: "Indian listed company.",
        },

    };

    const failedReasons = Object.values(filters)
        .filter(
            (filter) => !filter.passed
        )
        .map(
            (filter) => filter.message
        );

    const filterScore =
        Object.values(filters)
            .filter(
                (filter) => filter.passed
            )
            .length;

    return {

        qualified:
            revenuePass &&
            growthPass &&
            industryPass &&
            countryPass,

        filterScore,

        growthPercentage,

        filters,

        failedReasons,

    };

}