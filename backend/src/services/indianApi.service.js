import axios from "axios";
import listedCompanies from "../data/nse-listed-companies.json" with { type: "json" };

const BASE_URL = "https://stock.indianapi.in";

/**
 * Normalize company names for matching
 */
function normalizeCompanyName(name) {
    return name
        .toLowerCase()
        .replace(
            /\b(private|public|limited|ltd|pvt|plc|inc|corporation|corp)\b/g,
            ""
        )
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Build lookup map once
 */
const listedCompaniesMap = new Map(
    listedCompanies.map(company => [
        normalizeCompanyName(company.company_name),
        company,
    ])
);

/**
 * Returns company metadata if listed, otherwise null
 */
export function getListedCompany(companyName) {
    return (
        listedCompaniesMap.get(
            normalizeCompanyName(companyName)
        ) ?? null
    );
}

export async function enrichCompany(companyName) {

    // ==========================
    // Check local cache first
    // ==========================

    const listedCompany = getListedCompany(companyName);

    if (!listedCompany) {

        return {

            listed: false,

            financialVerification: false,

            companyName,

            financials: null,

        };

    }

    try {

        const response = await axios.get(
            `${BASE_URL}/stock`,
            {
                params: {
                    name: listedCompany.ticker, // Use ticker instead of company name
                },
                headers: {
                    "x-api-key": process.env.INDIAN_API_KEY,
                },
            }
        );

        const data = response.data;

        const financials = Array.isArray(data?.financials)
            ? data.financials
            : [];

        if (financials.length === 0) {

            return {

                listed: true,

                financialVerification: false,

                companyName: listedCompany.company_name,

                ticker: listedCompany.ticker,

                financials: null,

            };

        }

        const latestStatement =
            financials.find(f => f.Type === "Annual") ??
            financials[0];

        const income =
            latestStatement?.stockFinancialMap?.INC ?? [];

        const balance =
            latestStatement?.stockFinancialMap?.BAL ?? [];

        const cashflow =
            latestStatement?.stockFinancialMap?.CAS ?? [];

        const getValue = (array, key) => {

            const item = array.find(x => x.key === key);

            if (!item) return null;

            const value = Number(item.value);

            return Number.isNaN(value)
                ? null
                : value;

        };

        return {

            listed: true,

            financialVerification: true,

            ticker: listedCompany.ticker,

            // ==========================
            // Company Details
            // ==========================

            companyName:
                data.companyName ??
                listedCompany.company_name,

            industry:
                data.industry ?? null,

            sector:
                data.companyProfile?.mgIndustry ?? null,

            description:
                data.companyProfile?.about ?? null,

            website:
                data.companyProfile?.website ?? null,

            headquarters:
                data.companyProfile?.registeredOffice ??
                null,

            city:
                data.companyProfile?.city ?? null,

            state:
                data.companyProfile?.state ?? null,

            country:
                data.companyProfile?.country ??
                "India",

            isin:
                data.companyProfile?.isin ?? null,

            faceValue:
                data.companyProfile?.faceValue ??
                null,

            // ==========================
            // Exchange
            // ==========================

            exchangeCodeNse:
                data.companyProfile?.exchangeCodeNse ??
                null,

            exchangeCodeBse:
                data.companyProfile?.exchangeCodeBse ??
                null,

            currentPrice:
                data.currentPrice?.NSE != null
                    ? Number(data.currentPrice.NSE)
                    : null,

            marketCap:
                data.stockDetailsReusableData
                    ?.marketCap != null
                    ? Number(
                        data.stockDetailsReusableData.marketCap
                    )
                    : null,

            // ==========================
            // Financial Metrics
            // ==========================

            revenue:
                getValue(income, "Revenue"),

            totalRevenue:
                getValue(income, "TotalRevenue"),

            operatingIncome:
                getValue(income, "OperatingIncome"),

            netIncome:
                getValue(income, "NetIncome"),

            totalAssets:
                getValue(balance, "TotalAssets"),

            totalEquity:
                getValue(balance, "TotalEquity"),

            totalDebt:
                getValue(balance, "TotalDebt"),

            operatingCashFlow:
                getValue(
                    cashflow,
                    "CashfromOperatingActivities"
                ),

            // ==========================
            // Analyst
            // ==========================

            analystRating:
                data.stockDetailsReusableData
                    ?.averageRating ?? null,

            analystCount:
                data.recosBar
                    ?.noOfRecommendations ?? null,

            // ==========================
            // News
            // ==========================

            recentNews:
                data.recentNews ?? [],

            // ==========================
            // Financial History
            // ==========================

            financials,

        };

    } catch (err) {

        console.error(
            `Indian API Error for ${companyName}:`,
            err.response?.data || err.message
        );

        return {

            listed: true,

            financialVerification: false,

            companyName,

            ticker: listedCompany.ticker,

            financials: null,

        };

    }

}