/**
 * Nutrition information tool
 */
import { registerTool } from '../index';

// Mock database of nutrition info
const nutritionDatabase: Record<string, any> = {
  "apple": {
    calories: 95,
    protein: "0.5g",
    carbs: "25g",
    fiber: "4g",
    sugar: "19g",
    fat: "0.3g",
    servingSize: "1 medium apple (182g)"
  },
  "banana": {
    calories: 105,
    protein: "1.3g",
    carbs: "27g",
    fiber: "3.1g",
    sugar: "14g",
    fat: "0.4g",
    servingSize: "1 medium banana (118g)"
  },
  "chicken breast": {
    calories: 165,
    protein: "31g",
    carbs: "0g",
    fiber: "0g",
    sugar: "0g",
    fat: "3.6g",
    servingSize: "100g (cooked)"
  },
  "rice": {
    calories: 130,
    protein: "2.7g",
    carbs: "28g",
    fiber: "0.4g",
    sugar: "0.1g",
    fat: "0.3g",
    servingSize: "100g (cooked)"
  },
  "pasta": {
    calories: 158,
    protein: "5.8g",
    carbs: "31g",
    fiber: "1.8g",
    sugar: "0.6g",
    fat: "0.9g",
    servingSize: "100g (cooked)"
  }
};

/**
 * Execute function for nutrition info lookup
 * This will be attached to the tool definition but not sent to OpenAI
 */
async function executeNutritionLookup(params: any) {
  const { food, unit = "serving" } = params;
  
  // Try to find the food in our database (case-insensitive)
  const foodKey = Object.keys(nutritionDatabase).find(
    k => k.toLowerCase() === food.toLowerCase()
  );
  
  // If food not found, return an informative message
  if (!foodKey) {
    // Find closest matches for suggestions
    const suggestions = Object.keys(nutritionDatabase)
      .filter(k => k.toLowerCase().includes(food.toLowerCase()) || 
                food.toLowerCase().includes(k.toLowerCase()))
      .slice(0, 3);
    
    return {
      error: `Nutrition information for "${food}" not found.`,
      availableFoods: Object.keys(nutritionDatabase).sort(),
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }
  
  // Get the nutrition data
  const nutritionData = nutritionDatabase[foodKey];
  
  // Handle different units (simplified implementation)
  if (unit === "100g" && nutritionData.servingSize.includes("g")) {
    // Try to normalize to 100g if the serving is in grams
    const match = nutritionData.servingSize.match(/\((\d+)g\)/);
    if (match) {
      const servingGrams = parseInt(match[1], 10);
      const ratio = 100 / servingGrams;
      
      // Create a copy with adjusted values for 100g
      const adjustedData = { ...nutritionData };
      
      // Adjust calories (simple numeric value)
      adjustedData.calories = Math.round(nutritionData.calories * ratio);
      
      // For simplicity, we're not adjusting the string values like "31g"
      // In a real app, you would parse these and convert properly
      
      return {
        food: foodKey,
        unit: "100g",
        originalServing: nutritionData.servingSize,
        ...adjustedData
      };
    }
  }
  
  // Default: return the data as is with the original serving size
  return {
    food: foodKey,
    unit: "serving",
    ...nutritionData
  };
}

/**
 * Register the nutrition information tool
 */
registerTool({
  type: "function",
  function: {
    name: "getNutritionInfo",
    description: "Get nutritional information for a food item",
    parameters: {
      type: "object",
      properties: {
        food: {
          type: "string",
          description: "The food item to look up"
        },
        unit: {
          type: ["string", "null"],
          description: "The unit of measurement",
          enum: ["100g", "serving", "piece"]
        }
      },
      required: ["food"],
      additionalProperties: false
    }
  },
  execute: executeNutritionLookup
});