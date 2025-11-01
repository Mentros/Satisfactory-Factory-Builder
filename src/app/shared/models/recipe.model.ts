export interface RecipeItem {
  item: string;
  amount: number;
}

export interface FactoryRecipe {
  id: string;
  name: string;
  inputs: RecipeItem[];
  outputs: RecipeItem[];
  duration: number; // seconds
}

