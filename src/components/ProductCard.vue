<script setup lang="ts">
import { ref, watch } from 'vue';
import { Heart, ShoppingCart, Shield, Truck, RotateCcw } from 'lucide-vue-next';
import type { Product } from '../types';

// Nous définissons les propriétés
const props = defineProps<{
  product: Product;
  isFavorite: boolean;
}>();

// Déclaration des événements renvoyés au parent
const emit = defineEmits<{
  (e: 'toggle-favorite'): void;
  (e: 'add-to-cart'): void;
  (e: 'back'): void;
}>();


const selectedImageIndex = ref(0);

// Si l'utilisateur change de produit de détail, nous réinitialisons l'index de l'image à 0
watch(() => props.product.id, () => {
  selectedImageIndex.value = 0;
});
</script>

<template>
  <div class="h-full">
    <!-- Conteneur principal de la carte -->
    <div class="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:shadow-md hover:border-indigo-100 transition-all duration-300 h-full flex flex-col group cursor-pointer">
      
      <!-- Section Image (Haut) -->
      <div class="relative mb-4">
          <div class="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 relative">
            <img
              :src="product.mainImage"
              :alt="product.name"
              referrerpolicy="no-referrer"
              class="w-full h-full object-cover"
            />
            
            
            <div 
              v-if="product.stock === 0" 
              class="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-centerReady"
            >
              <span class="bg-rose-500 text-white text-xs font-sans font-bold px-4 py-2 rounded-lg shadow-md">
                Rupture temporaire
              </span>
            </div>
          </div>
      </div>

      <!-- Section Contenu (Milieu) -->
      <div class="flex flex-col flex-1 space-y-4">
          <div class="space-y-1">
            <span class="text-xs font-sans font-bold text-indigo-600 tracking-wider uppercase">
              {{ product.category }}
            </span>
            <h1 class="font-sans font-extrabold text-base md:text-lg text-slate-800 leading-tight">
              {{ product.name }}
            </h1>
          </div>

          <div>
            <p class="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">
              {{ product.shortDescription }}
            </p>
          </div>

          <div class="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2">
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-500 font-sans font-medium">Disponibilité :</span>
              <span 
                :class="[
                  'font-sans font-semibold',
                  product.stock > 5 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-rose-500'
                ]"
              >
                {{ product.stock > 5 ? 'En stock' : product.stock > 0 ? `Seulement ${product.stock} restants` : 'Rupture de Stock' }}
              </span>
            </div>

            <!-- Grille -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/50">
              <div class="flex items-center gap-2 text-slate-600">
                <Truck class="w-4 h-4 text-emerald-500 shrink-0" />
                <span class="text-[10px] sm:text-xs">Livraison Offerte</span>
              </div>
              <div class="flex items-center gap-2 text-slate-600">
                <Shield class="w-4 h-4 text-indigo-500 shrink-0" />
                <span class="text-[10px] sm:text-xs">Garantie 2 ans</span>
              </div>
              <div class="flex items-center gap-2 text-slate-600">
                <RotateCcw class="w-4 h-4 text-slate-500 shrink-0" />
                <span class="text-[10px] sm:text-xs">Retours 30j</span>
              </div>
            </div>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row gap-4 items-center">
           
            <div class="sm:text-left text-center shrink-0">
              <span class="text-[10px] text-slate-400 font-sans block">Prix</span>
              <span class="font-mono font-black text-xl md:text-2xl text-slate-800">
                {{ product.price.toFixed(2) }} FCFA
              </span>
            </div>

            <div class="flex gap-3 w-full">
              
              <button
                id="add-to-cart-big-btn"
                :disabled="product.stock === 0"
                @click="emit('add-to-cart')"
                :class="[
                  'flex-1 py-2.5 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-200',
                  product.stock === 0
                    ? 'bg-slate-150 border border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-100 active:scale-98'
                ]"
              >
                <ShoppingCart class="w-4 h-4" />
                <span>{{ product.stock === 0 ? 'Rupture' : 'Ajouter' }}</span>
              </button>

              <button
                id="toggle-fav-big-btn"
                @click="emit('toggle-favorite')"
                :class="[
                  'p-3.5 rounded-xl border flex items-center justify-center transition-all active:scale-95',
                  isFavorite
                    ? 'border-pink-200 bg-pink-50 text-pink-600'
                    : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50'
                ]"
                title="Ajouter aux favoris"
              >
                <Heart class="w-5 h-5" :class="{ 'fill-pink-600': isFavorite }" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
</template>
