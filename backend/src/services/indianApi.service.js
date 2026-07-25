import axios from "axios";

const BASE_URL = "https://stock.indianapi.in";

export async function enrichCompany(companyName) {
    try {

        const response = await axios.get(
            `${BASE_URL}/stock`,
            {
                params: {
                    name: companyName,
                },
                headers: {
                    "x-api-key": process.env.INDIAN_API_KEY,
                },
            }
        );

        const data = response.data;

        // Ensure financials always exists
        const financials = Array.isArray(data?.financials)
            ? data.financials
            : [];

        if (financials.length === 0) {
            console.log(
                `No financial statements found for ${companyName}`
            );
            return null;
        }

        // Prefer Annual statements
        const latestStatement =
            financials.find(
                (f) => f.Type === "Annual"
            ) ?? financials[0];

        const income =
            latestStatement?.stockFinancialMap?.INC ?? [];

        const balance =
            latestStatement?.stockFinancialMap?.BAL ?? [];

        const cashflow =
            latestStatement?.stockFinancialMap?.CAS ?? [];

        const getValue = (array, key) => {

            if (!Array.isArray(array))
                return null;

            const item = array.find(
                (x) => x.key === key
            );

            if (!item || item.value == null)
                return null;

            const value = Number(item.value);

            return Number.isNaN(value)
                ? null
                : value;
        };

        return {

            // ==========================
            // Company Details
            // ==========================

            companyName:
                data.companyName ?? companyName,

            industry:
                data.industry ?? null,

            sector:
                data.companyProfile?.mgIndustry ?? null,

            description:
                data.companyProfile?.about ?? null,

            website:
                data.companyProfile?.website ?? null,

            headquarters:
                data.companyProfile?.registeredOffice ?? null,

            city:
                data.companyProfile?.city ?? null,

            state:
                data.companyProfile?.state ?? null,

            country:
                data.companyProfile?.country ?? "India",

            isin:
                data.companyProfile?.isin ?? null,

            faceValue:
                data.companyProfile?.faceValue ?? null,

            // ==========================
            // Exchange Details
            // ==========================

            exchangeCodeNse:
                data.companyProfile?.exchangeCodeNse ?? null,

            exchangeCodeBse:
                data.companyProfile?.exchangeCodeBse ?? null,

            currentPrice:
                data.currentPrice?.NSE != null
                    ? Number(data.currentPrice.NSE)
                    : null,

            marketCap:
                data.stockDetailsReusableData?.marketCap != null
                    ? Number(
                        data.stockDetailsReusableData.marketCap
                    )
                    : null,

            // ==========================
            // Financial Metrics
            // ==========================

            revenue:
                getValue(
                    income,
                    "Revenue"
                ),

            totalRevenue:
                getValue(
                    income,
                    "TotalRevenue"
                ),

            operatingIncome:
                getValue(
                    income,
                    "OperatingIncome"
                ),

            netIncome:
                getValue(
                    income,
                    "NetIncome"
                ),

            totalAssets:
                getValue(
                    balance,
                    "TotalAssets"
                ),

            totalEquity:
                getValue(
                    balance,
                    "TotalEquity"
                ),

            totalDebt:
                getValue(
                    balance,
                    "TotalDebt"
                ),

            operatingCashFlow:
                getValue(
                    cashflow,
                    "CashfromOperatingActivities"
                ),

            // ==========================
            // Analyst Data
            // ==========================

            analystRating:
                data.stockDetailsReusableData?.averageRating ?? null,

            analystCount:
                data.recosBar?.noOfRecommendations ?? null,

            // ==========================
            // News
            // ==========================

            recentNews:
                data.recentNews ?? [],

            // ==========================
            // Raw Financial History
            // ==========================

            financials,

        };

    } catch (err) {

        console.error(
            `Indian API Error for ${companyName}:`,
            err.response?.data || err.message
        );

        return null;

    }
}