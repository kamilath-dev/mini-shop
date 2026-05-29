<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { MOCK_PRODUCTS } from './data';
import type { Category, Product, CartItem } from './types';
import Header from './components/Header.vue';
import Loader from './components/Loader.vue';
import ProductCard from './components/ProductCard.vue';
import ProductDetails from './components/ProductDetails.vue';
import Cart from './components/Cart.vue';
import Wishlist from './components/Wishlist.vue';
import Checkout from './components/Checkout.vue';

const searchTerm = ref('');
const selectedCategory = ref<Category>('Tous');
const cart = ref<CartItem[]>([]);
const favorites = ref<string[]>([]); 
const activeTab = ref<'catalog' | 'wishlist'>('catalog');
const selectedProduct = ref<Product | null>(null);
const isCartOpen = ref(false);
const activeScreen = ref<'catalog' | 'checkout'>('catalog');
const isLoading = ref(true);
const sortBy = ref<string>('default'); 



const categories: Category[] = ['Tous', 'Électronique', 'Mode', 'Maison & Déco', 'Livres & Papeterie'];

onMounted(() => {
  // C'est la partie concernant le chargement de panier dans le localStorage
  const savedCart = localStorage.getItem('ecoshop-cart');
  if (savedCart) {
    try { cart.value = JSON.parse(savedCart); } catch (e) { cart.value = []; }
  }

  // C'est la partie concernant le chargement de wishlist dans le localStorage
  const savedFavorites = localStorage.getItem('ecoshop-favorites');
  if (savedFavorites) {
    try { favorites.value = JSON.parse(savedFavorites); } catch (e) { favorites.value = []; }
  }

  setTimeout(() => {
    isLoading.value = false;
  }, 1200);
});

// watcher pour sauvegarder automatiquement les changements du panier
watch(cart, (newCart) => {
  localStorage.setItem('ecoshop-cart', JSON.stringify(newCart));
}, { deep: true });

// et de la wishlist
watch(favorites, (newFavorites) => {
  localStorage.setItem('ecoshop-favorites', JSON.stringify(newFavorites));
}, { deep: true });


// Filtre les produits du catalogue selon les critères de catégorie, barre de recherche & tri
const filteredProducts = computed(() => {
  const products = MOCK_PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory.value === 'Tous' || product.category === selectedCategory.value;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                          product.shortDescription.toLowerCase().includes(searchTerm.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Tri des produits selon la sélection de l'utilisateur
  if (sortBy.value === 'price-asc') {
    return [...products].sort((a, b) => a.price - b.price);
  } else if (sortBy.value === 'price-desc') {
    return [...products].sort((a, b) => b.price - a.price);
  } 

  return products;
});

// Lie l'état des favoris aux objets produits correspondants
const favoriteProducts = computed(() => {
  return MOCK_PRODUCTS.filter(p => favorites.value.includes(p.id));
});

// Nombre de produits au panier
const totalCartCount = computed(() => {
  return cart.value.reduce((acc, item) => acc + item.quantity, 0);
});


// Ouvrir une fiche produit de détail
const selectProduct = (product: Product) => {
  selectedProduct.value = product;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Fermer la fiche détails
const clearSelectedProduct = () => {
  selectedProduct.value = null;
};

// Ajouter/Retirer des favoris
const toggleFavorite = (productId: string) => {
  const index = favorites.value.indexOf(productId);
  if (index === -1) {
    favorites.value.push(productId);
  } else {
    favorites.value.splice(index, 1);
  }
};

// Ajouter un produit au panier
const addToCart = (product: Product) => {
  if (product.stock === 0) return;

  const existingItem = cart.value.find(item => item.product.id === product.id);
  if (existingItem) {
    // Si la quantité n'excède pas notre stock simulé
    if (existingItem.quantity < product.stock) {
      existingItem.quantity++;
    }
  } else {
    cart.value.push({
      product,
      quantity: 1
    });
  }
  
  isCartOpen.value = true;
};

// Mettre à jour la quantité d'un article du panier
const updateQuantity = (productId: string, delta: number) => {
  const item = cart.value.find(item => item.product.id === productId);
  if (!item) return;

  const newQuantity = item.quantity + delta;
  if (newQuantity <= 0) {
    // Si la quantité passe à 0, on supprime l'article
    removeFromCart(productId);
  } else if (newQuantity <= item.product.stock) {
    item.quantity = newQuantity;
  }
};

// Retirer un article totalement du panier
const removeFromCart = (productId: string) => {
  cart.value = cart.value.filter(item => item.product.id !== productId);
};

// Vider le panier
const clearCart = () => {
  cart.value = [];
};


const navigateToCheckout = () => {
  isCartOpen.value = false;
  activeScreen.value = 'checkout';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


const navigateToHome = () => {
  activeScreen.value = 'catalog';
  selectedProduct.value = null;
  activeTab.value = 'catalog';
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col text-slate-800">
    
    <!-- Header -->
    <Header
      v-model="searchTerm"
      :cart-count="totalCartCount"
      :wishlist-count="favorites.length"
      v-model:active-tab="activeTab"
      @clear-details="clearSelectedProduct"
      @open-cart="isCartOpen = true"
    />


    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div v-if="activeScreen === 'checkout'">
        <Checkout
          :cart-items="cart"
          @clear-cart="clearCart"
          @back-to-cart="activeScreen = 'catalog'; isCartOpen = true"
          @navigate-home="navigateToHome"
        />
      </div>

      <div v-else>
        <div v-if="isLoading" class="space-y-6">
          <Loader :type="selectedProduct ? 'detail' : 'grid'" />
        </div>

        <div v-else class="space-y-6">
          
          <div v-if="selectedProduct">
            <ProductDetails
              :product="selectedProduct"
              :is-favorite="favorites.includes(selectedProduct.id)"
              @toggle-favorite="toggleFavorite(selectedProduct.id)"
              @add-to-cart="addToCart(selectedProduct)"
              @back="clearSelectedProduct"
            />
          </div>

          <div v-else>
            <div v-if="activeTab === 'wishlist'">
              <Wishlist
                :favorite-products="favoriteProducts"
                @remove-favorite="toggleFavorite"
                @add-to-cart="addToCart"
                @select-product="selectProduct"
                @navigate-to-catalog="activeTab = 'catalog'"
              />
            </div>

            <div v-else class="space-y-6">
              
              <!-- Section de filtrage par catégorie et de tri -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <!-- Catégories -->
                <div class="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                  <button
                    v-for="cat in categories"
                    :key="cat"
                    @click="selectedCategory = cat"
                    :class="[
                      'px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all shrink-0',
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-100 hover:border-slate-250/50'
                    ]"
                  >
                    {{ cat }}
                  </button>
                </div>

                <!-- Menu de tri -->
                <div class="shrink-0">
                  <select
                    id="sort-select"
                    v-model="sortBy"
                    class="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-sans font-medium cursor-pointer transition-all shadow-sm"
                  >
                    <option value="default">Trier par (Défaut)</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                  </select>
                </div>
              </div>

              <div>
                <h1 class="font-sans font-black text-xl sm:text-2xl text-slate-800">
                  {{ selectedCategory === 'Tous' ? 'Tous nos produits' : selectedCategory }}
                </h1>
                <p class="text-xs text-slate-500 mt-1">
                  {{ filteredProducts.length }} article{{ filteredProducts.length > 1 ? 's' : '' }} disponible{{ filteredProducts.length > 1 ? 's' : '' }}
                </p>
              </div>

              <!-- Recherche -->
              <div 
                v-if="filteredProducts.length === 0" 
                class="bg-white rounded-2xl border border-slate-100 p-12 text-center max-w-sm mx-auto space-y-3"
              >
                <p class="text-sm font-sans font-bold text-slate-700">Aucun produit trouvé</p>
                <p class="text-xs text-slate-400">Essayez de modifier votre recherche ou de vider le filtre.</p>
                <button 
                  @click="searchTerm = ''; selectedCategory = 'Tous'"
                  class="px-4 py-2 rounded-xl text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold font-sans mt-2"
                >
                  Réinitialiser
                </button>
              </div>

              <!-- grille des produits -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProductCard
                  v-for="product in filteredProducts"
                  :key="product.id"
                  :product="product"
                  :is-favorite="favorites.includes(product.id)"
                  @toggle-favorite="toggleFavorite(product.id)"
                  @add-to-cart="addToCart(product)"
                  @click="selectProduct(product)"
                />
              </div>

            </div>
          </div>

        </div>
      </div>

    </main>

    <!-- panier -->
    <Cart
      :is-open="isCartOpen"
      :cart-items="cart"
      @close="isCartOpen = false"
      @update-quantity="updateQuantity"
      @remove-item="removeFromCart"
      @checkout="navigateToCheckout"
    />

    <footer class="border-t border-slate-200/50 bg-white py-8 mt-12 text-center text-xs text-slate-400 font-sans">
      <div class="max-w-7xl mx-auto px-4 space-y-2">
        <p>© 2026 Kamie Shop Inc. Conçu avec amour pour votre apprentissage Vue 3.</p>
        <div class="flex items-center justify-center gap-4">
          <span>Mentions fictives</span>
          <span>•</span>
          <span>Données Sandbox</span>
          <span>•</span>
          <span>Composition API</span>
        </div>
      </div>
    </footer>

  </div>
</template>

<style>

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
