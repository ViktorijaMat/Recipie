// ========================================
// Recipie — APP LOGIC
// ========================================
 
const STORAGE_KEY = 'Recipie';
 
// ===== STATE =====
let recipes = [];
let currentView = 'home';
let currentRecipeId = null;
let activeCategory = 'all';
let searchActive = false;
let pendingDeleteId = null;
let selectedEmoji = '🍽️';
 
// ===== SAMPLE RECIPES =====
const sampleRecipes = [
  {
    id: 'sample-1',
    name: "Fluffy Strawberry Pancakes",
    emoji: "🥞",
    category: "Breakfast",
    description: "Light, airy pancakes loaded with fresh strawberries. Perfect lazy Sunday morning treat.",
    servings: 4,
    prep: "10 min",
    cook: "20 min",
    ingredients: [
      "1½ cups all-purpose flour",
      "2 tbsp sugar",
      "2 tsp baking powder",
      "½ tsp salt",
      "1 cup milk",
      "2 eggs",
      "3 tbsp melted butter",
      "1 cup fresh strawberries, sliced",
      "Maple syrup to serve"
    ],
    steps: [
      "In a large bowl, whisk together flour, sugar, baking powder and salt.",
      "In another bowl, beat together milk, eggs and melted butter.",
      "Pour wet ingredients into dry ingredients and stir until just combined — lumps are okay!",
      "Gently fold in most of the strawberries, saving some for topping.",
      "Heat a non-stick pan over medium heat and grease lightly.",
      "Pour ¼ cup batter per pancake. Cook until bubbles form, then flip. Cook 1 min more.",
      "Serve stacked with remaining strawberries and maple syrup."
    ],
    notes: "Don't overmix the batter — a few lumps give you fluffier pancakes! Swap strawberries for blueberries anytime.",
    tags: ["breakfast", "quick", "family favourite", "sweet"],
    createdAt: Date.now() - 86400000
  },
  {
    id: 'sample-2',
    name: "Creamy Tomato Pasta",
    emoji: "🍝",
    category: "Dinner",
    description: "A rich, velvety tomato sauce with a touch of cream. Ready in 30 minutes and absolutely delicious.",
    servings: 3,
    prep: "5 min",
    cook: "25 min",
    ingredients: [
      "300g pasta (penne or rigatoni)",
      "2 tbsp olive oil",
      "4 garlic cloves, minced",
      "1 can (400g) crushed tomatoes",
      "½ tsp chilli flakes",
      "100ml heavy cream",
      "Salt & pepper to taste",
      "Fresh basil leaves",
      "Parmesan to serve"
    ],
    steps: [
      "Cook pasta in well-salted boiling water until al dente. Reserve ½ cup pasta water.",
      "Heat olive oil in a large pan. Sauté garlic for 1–2 minutes until fragrant.",
      "Add chilli flakes and cook 30 seconds more.",
      "Pour in crushed tomatoes, season with salt and pepper. Simmer 10 minutes.",
      "Stir in heavy cream and simmer another 5 minutes.",
      "Add drained pasta, toss well. Add pasta water if sauce is too thick.",
      "Serve topped with fresh basil and parmesan."
    ],
    notes: "For extra depth, add a splash of white wine before the tomatoes.",
    tags: ["dinner", "vegetarian", "30 minutes", "comfort food"],
    createdAt: Date.now() - 172800000
  },
  {
    id: 'sample-3',
    name: "Lemon Lavender Loaf Cake",
    emoji: "🍰",
    category: "Baking",
    description: "A fragrant, tender loaf with bright lemon and subtle floral lavender notes. Drizzled with a tart lemon glaze.",
    servings: 8,
    prep: "15 min",
    cook: "50 min",
    ingredients: [
      "1¾ cups all-purpose flour",
      "1½ tsp baking powder",
      "¼ tsp salt",
      "1 cup sugar",
      "Zest of 2 lemons",
      "1 tsp dried culinary lavender, crushed",
      "3 eggs",
      "½ cup sour cream",
      "½ cup vegetable oil",
      "2 tbsp lemon juice",
      "For glaze: 1 cup icing sugar + 3 tbsp lemon juice"
    ],
    steps: [
      "Preheat oven to 175°C (350°F). Grease and line a 9x5 loaf pan.",
      "Rub sugar, lemon zest and lavender together in a bowl until fragrant.",
      "Whisk in eggs, sour cream, oil and lemon juice until smooth.",
      "Fold in flour, baking powder and salt until just combined.",
      "Pour into prepared pan. Bake 50–55 minutes until a skewer comes out clean.",
      "Cool in pan 10 minutes, then turn out onto a rack.",
      "Once fully cool, mix glaze ingredients and drizzle over the top."
    ],
    notes: "Use culinary-grade lavender only. Make sure the cake is fully cool before glazing or the glaze will melt in.",
    tags: ["baking", "cake", "lemon", "afternoon tea"],
    createdAt: Date.now() - 259200000
  }
];
 
// ===== INIT =====
window.addEventListener('load', () => {
  loadRecipes();
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.remove();
      document.getElementById('app').classList.remove('hidden');
      showView('home');
    }, 500);
  }, 1400);
});
 
// ===== STORAGE =====
function loadRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    recipes = raw ? JSON.parse(raw) : [...sampleRecipes];
    if (!raw) saveRecipes();
  } catch (e) {
    recipes = [...sampleRecipes];
  }
}
function saveRecipes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}
 
// ===== VIEW NAVIGATION =====
function showView(name, fromView) {
  const views = document.querySelectorAll('.view');
  views.forEach(v => { v.classList.remove('active', 'slide-out'); });
 
  if (fromView) {
    const from = document.getElementById(`view-${fromView}`);
    if (from) from.classList.add('slide-out');
  }
 
  const target = document.getElementById(`view-${name}`);
  if (target) {
    // slight delay for animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        target.classList.add('active');
      });
    });
  }
  currentView = name;
 
  if (name === 'home') {
    const fab = document.getElementById('fab');
    fab.style.display = '';
    renderRecipes();
  } else {
    document.getElementById('fab').style.display = 'none';
  }
}
 
// ===== RENDER HOME =====
function renderRecipes() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  const grid = document.getElementById('recipe-grid');
  const empty = document.getElementById('empty-state');
  const countLabel = document.getElementById('recipe-count-label');
 
  let filtered = recipes.filter(r => {
    const matchCat = activeCategory === 'all' || r.category === activeCategory;
    if (!matchCat) return false;
    if (!query) return true;
    return (
      r.name.toLowerCase().includes(query) ||
      (r.description || '').toLowerCase().includes(query) ||
      (r.ingredients || []).some(i => i.toLowerCase().includes(query)) ||
      (r.tags || []).some(t => t.toLowerCase().includes(query)) ||
      r.category.toLowerCase().includes(query)
    );
  });
 
  // Sort newest first
  filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
 
  countLabel.textContent = recipes.length === 0
    ? 'Add your first recipe!'
    : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} saved 💕`;
 
  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
 
  grid.innerHTML = filtered.map((r, i) => `
    <div class="recipe-card" data-id="${r.id}" style="animation-delay:${i * 0.04}s">
      <span class="card-emoji">${r.emoji || '🍽️'}</span>
      <span class="card-category">${r.category}</span>
      <div class="card-title">${escHtml(r.name)}</div>
      <div class="card-meta">
        ${r.prep ? `<span>⏱ Prep: ${escHtml(r.prep)}</span>` : ''}
        ${r.servings ? `<span>🍽 Serves ${r.servings}</span>` : ''}
      </div>
    </div>
  `).join('');
 
  grid.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => openRecipe(card.dataset.id));
  });
}
 
// ===== DETAIL VIEW =====
function openRecipe(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;
  currentRecipeId = id;
 
  const content = document.getElementById('detail-content');
  const tags = (recipe.tags || []).map(t => `<span class="tag-pill">${escHtml(t)}</span>`).join('');
  const ingredients = (recipe.ingredients || []).map(i => `<div class="ingredient-item">${escHtml(i)}</div>`).join('');
  const steps = (recipe.steps || []).map((s, i) => `
    <div class="step-item">
      <div class="step-num">${i + 1}</div>
      <div class="step-text">${escHtml(s)}</div>
    </div>
  `).join('');
 
  content.innerHTML = `
    <div class="detail-hero">
      <span class="detail-emoji">${recipe.emoji || '🍽️'}</span>
      <div class="detail-category-badge">${escHtml(recipe.category)}</div>
      <h2 class="detail-title">${escHtml(recipe.name)}</h2>
      ${recipe.description ? `<p class="detail-desc">${escHtml(recipe.description)}</p>` : ''}
    </div>
 
    <div class="detail-stats">
      <div class="stat-box">
        <span class="stat-icon">⏱</span>
        <div class="stat-value">${recipe.prep || '—'}</div>
        <div class="stat-label">Prep</div>
      </div>
      <div class="stat-box">
        <span class="stat-icon">🔥</span>
        <div class="stat-value">${recipe.cook || '—'}</div>
        <div class="stat-label">Cook</div>
      </div>
      <div class="stat-box">
        <span class="stat-icon">🍽️</span>
        <div class="stat-value">${recipe.servings || '—'}</div>
        <div class="stat-label">Serves</div>
      </div>
    </div>
 
    ${ingredients ? `
    <div class="detail-section">
      <h3 class="detail-section-title">Ingredients</h3>
      ${ingredients}
    </div>` : ''}
 
    ${steps ? `
    <div class="detail-section">
      <h3 class="detail-section-title">Instructions</h3>
      ${steps}
    </div>` : ''}
 
    ${recipe.notes ? `
    <div class="detail-section">
      <h3 class="detail-section-title">Notes & Tips</h3>
      <div class="notes-box">${escHtml(recipe.notes)}</div>
    </div>` : ''}
 
    ${tags ? `
    <div class="detail-section">
      <h3 class="detail-section-title">Tags</h3>
      <div class="tags-wrap">${tags}</div>
    </div>` : ''}
  `;
 
  showView('detail', 'home');
}
 
// ===== FORM =====
function openForm(editId = null) {
  const formTitle = document.getElementById('form-title');
  formTitle.textContent = editId ? 'Edit Recipe' : 'New Recipe';
  document.getElementById('edit-id').value = editId || '';
 
  // Reset
  document.getElementById('f-name').value = '';
  document.getElementById('f-category').value = 'Breakfast';
  document.getElementById('f-servings').value = '';
  document.getElementById('f-prep').value = '';
  document.getElementById('f-cook').value = '';
  document.getElementById('f-desc').value = '';
  document.getElementById('f-notes').value = '';
  document.getElementById('f-tags').value = '';
  selectedEmoji = '🍽️';
  renderEmojiPicker();
  clearIngredients();
  clearSteps();
 
  if (editId) {
    const r = recipes.find(x => x.id === editId);
    if (r) {
      document.getElementById('f-name').value = r.name || '';
      document.getElementById('f-category').value = r.category || 'Breakfast';
      document.getElementById('f-servings').value = r.servings || '';
      document.getElementById('f-prep').value = r.prep || '';
      document.getElementById('f-cook').value = r.cook || '';
      document.getElementById('f-desc').value = r.description || '';
      document.getElementById('f-notes').value = r.notes || '';
      document.getElementById('f-tags').value = (r.tags || []).join(', ');
      selectedEmoji = r.emoji || '🍽️';
      renderEmojiPicker();
      (r.ingredients || []).forEach(i => addIngredientRow(i));
      (r.steps || []).forEach(s => addStepRow(s));
    }
  } else {
    addIngredientRow();
    addIngredientRow();
    addStepRow();
  }
 
  const fromView = currentView;
  showView('form', fromView);
}
 
function clearIngredients() {
  document.getElementById('ingredients-list').innerHTML = '';
}
function clearSteps() {
  document.getElementById('steps-list').innerHTML = '';
}
 
function addIngredientRow(value = '') {
  const list = document.getElementById('ingredients-list');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.innerHTML = `
    <input type="text" placeholder="e.g. 2 cups flour" value="${escHtml(value)}" />
    <button class="btn-remove-item" type="button">✕</button>
  `;
  div.querySelector('.btn-remove-item').addEventListener('click', () => {
    div.remove();
    renumberSteps();
  });
  list.appendChild(div);
}
 
function addStepRow(value = '') {
  const list = document.getElementById('steps-list');
  const div = document.createElement('div');
  div.className = 'dynamic-item step-item-form';
  const idx = list.children.length + 1;
  div.innerHTML = `
    <div class="step-num-label">${idx}</div>
    <textarea placeholder="Describe this step…" rows="2">${escHtml(value)}</textarea>
    <button class="btn-remove-item" type="button">✕</button>
  `;
  div.querySelector('.btn-remove-item').addEventListener('click', () => {
    div.remove();
    renumberSteps();
  });
  list.appendChild(div);
}
 
function renumberSteps() {
  const steps = document.querySelectorAll('#steps-list .step-num-label');
  steps.forEach((el, i) => { el.textContent = i + 1; });
}
 
function renderEmojiPicker() {
  document.querySelectorAll('.emoji-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.emoji === selectedEmoji);
  });
}
 
function saveRecipe() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { showToast('Please enter a recipe name ✨'); return; }
 
  const ingredients = [...document.querySelectorAll('#ingredients-list input')]
    .map(i => i.value.trim()).filter(Boolean);
  const steps = [...document.querySelectorAll('#steps-list textarea')]
    .map(t => t.value.trim()).filter(Boolean);
 
  if (ingredients.length === 0) { showToast('Add at least one ingredient 🌸'); return; }
  if (steps.length === 0) { showToast('Add at least one instruction step 🌸'); return; }
 
  const tags = document.getElementById('f-tags').value
    .split(',').map(t => t.trim()).filter(Boolean);
 
  const editId = document.getElementById('edit-id').value;
  const now = Date.now();
 
  if (editId) {
    const idx = recipes.findIndex(r => r.id === editId);
    if (idx !== -1) {
      recipes[idx] = {
        ...recipes[idx],
        name,
        emoji: selectedEmoji,
        category: document.getElementById('f-category').value,
        servings: parseInt(document.getElementById('f-servings').value) || null,
        prep: document.getElementById('f-prep').value.trim(),
        cook: document.getElementById('f-cook').value.trim(),
        description: document.getElementById('f-desc').value.trim(),
        ingredients, steps, tags,
        notes: document.getElementById('f-notes').value.trim(),
        updatedAt: now
      };
      currentRecipeId = editId;
    }
    saveRecipes();
    showToast('Recipe updated! 💕');
    showView('detail', 'form');
    openRecipe(editId);
  } else {
    const newRecipe = {
      id: 'r_' + now + '_' + Math.random().toString(36).slice(2, 7),
      name, emoji: selectedEmoji,
      category: document.getElementById('f-category').value,
      servings: parseInt(document.getElementById('f-servings').value) || null,
      prep: document.getElementById('f-prep').value.trim(),
      cook: document.getElementById('f-cook').value.trim(),
      description: document.getElementById('f-desc').value.trim(),
      ingredients, steps, tags,
      notes: document.getElementById('f-notes').value.trim(),
      createdAt: now
    };
    recipes.unshift(newRecipe);
    saveRecipes();
    showToast('Recipe saved! 🌸');
    showView('home');
    renderRecipes();
  }
}
 
function deleteRecipe(id) {
  recipes = recipes.filter(r => r.id !== id);
  saveRecipes();
  showToast('Recipe deleted');
  showView('home');
  renderRecipes();
}
 
// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 300);
  }, 2200);
}
 
// ===== UTILS =====
function escHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
 
// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  // FAB
  document.getElementById('fab').addEventListener('click', () => openForm());
 
  // Back buttons
  document.getElementById('btn-back-detail').addEventListener('click', () => {
    showView('home');
  });
  document.getElementById('btn-back-form').addEventListener('click', () => {
    if (document.getElementById('edit-id').value) {
      showView('detail', 'form');
      openRecipe(currentRecipeId);
    } else {
      showView('home');
    }
  });
 
  // Edit / Delete
  document.getElementById('btn-edit-recipe').addEventListener('click', () => {
    if (currentRecipeId) openForm(currentRecipeId);
  });
  document.getElementById('btn-delete-recipe').addEventListener('click', () => {
    pendingDeleteId = currentRecipeId;
    document.getElementById('modal-overlay').classList.remove('hidden');
  });
 
  // Modal
  document.getElementById('modal-cancel').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('hidden');
    pendingDeleteId = null;
  });
  document.getElementById('modal-confirm').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('hidden');
    if (pendingDeleteId) {
      deleteRecipe(pendingDeleteId);
      pendingDeleteId = null;
    }
  });
 
  // Save
  document.getElementById('btn-save-recipe').addEventListener('click', saveRecipe);
 
  // Add ingredient/step
  document.getElementById('btn-add-ingredient').addEventListener('click', () => addIngredientRow());
  document.getElementById('btn-add-step').addEventListener('click', () => addStepRow());
 
  // Category filter
  document.querySelectorAll('.cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      renderRecipes();
    });
  });
 
  // Search
  document.getElementById('btn-search-toggle').addEventListener('click', () => {
    const bar = document.getElementById('search-bar');
    searchActive = !searchActive;
    bar.classList.toggle('hidden', !searchActive);
    if (searchActive) bar.querySelector('input').focus();
    else {
      document.getElementById('search-input').value = '';
      renderRecipes();
    }
  });
  document.getElementById('search-input').addEventListener('input', renderRecipes);
  document.getElementById('btn-search-clear').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    renderRecipes();
    document.getElementById('search-bar').classList.add('hidden');
    searchActive = false;
  });
 
  // Emoji picker
  document.querySelectorAll('.emoji-opt').forEach(el => {
    el.addEventListener('click', () => {
      selectedEmoji = el.dataset.emoji;
      renderEmojiPicker();
    });
  });
});

// ===== PWA SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.log('SW failed', err));
  });
}