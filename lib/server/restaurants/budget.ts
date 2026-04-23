export function getRestaurantBudgetEstimate(priceRange: number) {
    if (priceRange <= 1) return { average: 20, label: "budget doux (~20-30 EUR)" };
    if (priceRange === 2) return { average: 35, label: "budget modere (~30-45 EUR)" };
    if (priceRange === 3) return { average: 60, label: "budget confort (~50-75 EUR)" };
    if (priceRange === 4) return { average: 90, label: "budget eleve (~80-110 EUR)" };

    return { average: 140, label: "budget premium (~120 EUR et plus)" };
}
