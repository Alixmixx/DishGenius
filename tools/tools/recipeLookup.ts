/**
 * Recipe lookup tool 
 */
import { registerTool } from '../index';

// Mock database of recipes
const recipeDatabase = [
  {
    name: "Pasta Carbonara",
    ingredients: ["pasta", "eggs", "bacon", "cheese", "black pepper"],
    instructions: "1. Cook pasta. 2. Fry bacon. 3. Mix eggs and cheese. 4. Combine all ingredients with pasta. 5. Add black pepper.",
    difficulty: "easy",
    prepTime: "10 minutes",
    cookTime: "15 minutes"
  },
  {
    name: "Veggie Stir Fry",
    ingredients: ["rice", "bell peppers", "broccoli", "carrots", "soy sauce", "garlic", "ginger"],
    instructions: "1. Cook rice. 2. Stir-fry vegetables with garlic and ginger. 3. Add soy sauce. 4. Serve over rice.",
    difficulty: "easy",
    prepTime: "15 minutes",
    cookTime: "10 minutes"
  },
  {
    name: "Chocolate Chip Cookies",
    ingredients: ["flour", "butter", "sugar", "chocolate chips", "eggs", "vanilla extract"],
    instructions: "1. Cream butter and sugar. 2. Add eggs and vanilla. 3. Mix in flour. 4. Fold in chocolate chips. 5. Bake at 350°F for 10-12 minutes.",
    difficulty: "medium",
    prepTime: "20 minutes",
    cookTime: "12 minutes"
  }
];

/**
 * Execute function for recipe lookup
 * This will be attached to the tool definition but not sent to OpenAI
 */
async function executeRecipeLookup(params: any) {
  const { query, filterByDifficulty } = params;
  
  // Convert query to lowercase for case-insensitive matching
  const searchTerm = query.toLowerCase();
  
  // Check if we're searching by ingredients or name
  const isIngredientSearch = searchTerm.includes(",");
  
  let results = [];
  
  if (isIngredientSearch) {
    // Search by ingredients
    const ingredients = searchTerm.split(",").map((i: string) => i.trim());
    
    results = recipeDatabase.filter(recipe => {
      const matchedIngredients = ingredients.filter(ingredient => 
        recipe.ingredients.some(ri => ri.toLowerCase().includes(ingredient))
      );
      // Return recipes that match at least half of the requested ingredients
      return matchedIngredients.length >= ingredients.length / 2;
    });
  } else {
    // Search by recipe name
    results = recipeDatabase.filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply difficulty filter if provided
  if (filterByDifficulty) {
    results = results.filter(recipe => recipe.difficulty === filterByDifficulty);
  }
  
  return {
    results,
    query,
    totalResults: results.length,
    searchType: isIngredientSearch ? "ingredients" : "recipe_name"
  };
}

/**
 * Register the recipe lookup tool
 */
registerTool({
  type: "function",
  function: {
    name: "lookupRecipe",
    description: "Look up a recipe by name or ingredients",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Recipe name or a comma-separated list of ingredients"
        },
        filterByDifficulty: {
          type: ["string", "null"],
          description: "Filter recipes by difficulty level",
          enum: ["easy", "medium", "hard"]
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
  execute: executeRecipeLookup
});