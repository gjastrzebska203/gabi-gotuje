class Recipe {
  constructor(title, ingredients, steps, image, created_by) {
    this.title = title;
    this.ingredients = ingredients;
    this.steps = steps;
    this.image = image;
    this.created_by = created_by;
    this.created_at = new Date();
  }
}

class User {
  constructor(username, email, password, role) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.created_at = new Date();
  }
}

class Comment {
  constructor(recipe_id, user_id, content) {
    this.recipe_id = recipe_id;
    this.user_id = user_id;
    this.content = content;
    this.created_at = new Date();
  }
}

module.exports = { Recipe, User, Comment };
