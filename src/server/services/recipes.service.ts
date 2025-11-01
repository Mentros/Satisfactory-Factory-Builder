import Database from 'better-sqlite3';
import { getDatabase } from '../db/init';
import { DatabaseRecipe, DatabaseRecipeItem } from '../models/database.models';
import { FactoryRecipe, RecipeItem } from '../../app/shared/models/recipe.model';

export class RecipesService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  getRecipesByFactory(factoryId: string): FactoryRecipe[] {
    const recipeRows = this.db
      .prepare('SELECT * FROM recipes WHERE factory_id = ? ORDER BY name')
      .all(factoryId) as DatabaseRecipe[];

    return recipeRows.map((recipeRow) => {
      const itemRows = this.db
        .prepare('SELECT * FROM recipe_items WHERE recipe_id = ? ORDER BY is_input DESC, item')
        .all(recipeRow.id) as DatabaseRecipeItem[];

      const inputs: RecipeItem[] = [];
      const outputs: RecipeItem[] = [];

      for (const itemRow of itemRows) {
        const recipeItem: RecipeItem = {
          item: itemRow.item,
          amount: itemRow.amount,
        };

        if (itemRow.is_input === 1) {
          inputs.push(recipeItem);
        } else {
          outputs.push(recipeItem);
        }
      }

      return {
        id: recipeRow.id,
        name: recipeRow.name,
        inputs,
        outputs,
        duration: recipeRow.duration,
      };
    });
  }
}

