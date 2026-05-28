<script setup lang="ts">
import { ref, computed } from 'vue';
import { CreditCard, Package, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-vue-next';
import type { CartItem, CheckoutForm, Order } from '../types';

const props = defineProps<{
  cartItems: CartItem[];
}>();

const emit = defineEmits<{
  (e: 'order-completed', order: Order): void;
  (e: 'back-to-cart'): void;
  (e: 'clear-cart'): void;
  (e: 'navigate-home'): void;
}>();

// Données du formulaire
const formData = ref<CheckoutForm>({
  name: '',
  address: '',
  phone: ''
});

// Gestion des erreurs
const errors = ref({
  name: '',
  address: '',
  phone: ''
});


const checkoutState = ref<'form' | 'submitting' | 'success'>('form');
const createdOrder = ref<Order | null>(null);

// Calculs financiers réutilisés
const subtotal = computed(() => {
  return props.cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
});

const isFreeShipping = computed(() => subtotal.value >= 60);
const shippingCost = computed(() => {
  if (subtotal.value === 0) return 0;
  return isFreeShipping.value ? 0 : 4.90;
});
const total = computed(() => subtotal.value + shippingCost.value);

// Validation des données saisies par l'utilisateur
const validateForm = (): boolean => {
  let isValid = true;
  errors.value = { name: '', address: '', phone: '' };

  if (!formData.value.name.trim()) {
    errors.value.name = 'Le nom complet est obligatoire.';
    isValid = false;
  }
  if (!formData.value.address.trim()) {
    errors.value.address = 'L’adresse de livraison complète est obligatoire.';
    isValid = false;
  }
  
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  if (!formData.value.phone.trim()) {
    errors.value.phone = 'Le numéro de téléphone est requis.';
    isValid = false;
  } else if (!phoneRegex.test(formData.value.phone.replace(/\s/g, ''))) {
    errors.value.phone = 'Format de téléphone invalide (Ex: 06 12 34 56 78).';
    isValid = false;
  }

  return isValid;
};

// Soumission simulée de traitement de paiement
const handlePay = () => {
  if (!validateForm()) return;

  // si c'est = "Submitting"
  checkoutState.value = 'submitting';

  // Simulation de l'appel API sécurisé de paiement avec un délai de 2 secondes
  setTimeout(() => {
    const orderId = 'CMD-' + Math.floor(Math.random() * 900000 + 100000);
    const newOrder: Order = {
      id: orderId,
      items: [...props.cartItems],
      total: total.value,
      customerInfo: { ...formData.value },
      date: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    createdOrder.value = newOrder;
    checkoutState.value = 'success';
    
    // Déclencher l'événement émis
    emit('order-completed', newOrder);
  }, 2000);
};

const handleFinalize = () => {
  emit('clear-cart');
  emit('navigate-home');
};
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
   
    <button
      v-if="checkoutState !== 'success'"
      id="back-cart-btn"
      @click="emit('back-to-cart')"
      class="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-sans font-medium text-sm transition-colors cursor-pointer"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Retourner au panier</span>
    </button>

    <!-- Formulaire de commande -->
    <div v-if="checkoutState === 'form' || checkoutState === 'submitting'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 md:p-8 space-y-6 shadow-2xs">
        <div>
          <h2 class="font-sans font-extrabold text-xl text-slate-800 flex items-center gap-2">
            <Package class="w-5 h-5 text-indigo-600" />
            <span>Adresse de livraison</span>
          </h2>
          <p class="text-xs text-slate-400 mt-1">Vos coordonnées pour la livraison éco-express carbon-offset</p>
        </div>

    
        <form @submit.prevent="handlePay" class="space-y-4">
          
          <div class="space-y-1.5">
            <label for="name" class="block text-xs font-sans font-semibold text-slate-600">Nom Complet</label>
            <input
              id="name"
              type="text"
              v-model="formData.name"
              :disabled="checkoutState === 'submitting'"
              placeholder="Ex: Jean Dupont"
              :class="[
                'w-full px-4 py-3 rounded-xl border text-sm focus:outline-hidden focus:border-indigo-500 transition-colors text-slate-700',
                errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
              ]"
            />
            <span v-if="errors.name" class="text-xxs text-rose-500 font-sans block">{{ errors.name }}</span>
          </div>

          <!-- Adresse complète -->
          <div class="space-y-1.5">
            <label for="address" class="block text-xs font-sans font-semibold text-slate-600">Adresse de livraison</label>
            <textarea
              id="address"
              rows="3"
              v-model="formData.address"
              :disabled="checkoutState === 'submitting'"
              placeholder="Ex: 12 Rue de Rivoli, 75001 Paris"
              :class="[
                'w-full px-4 py-3 rounded-xl border text-sm focus:outline-hidden focus:border-indigo-500 transition-colors text-slate-700 resize-none',
                errors.address ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
              ]"
            ></textarea>
            <span v-if="errors.address" class="text-xxs text-rose-500 font-sans block">{{ errors.address }}</span>
          </div>

          <!-- Téléphone portable -->
          <div class="space-y-1.5">
            <label for="phone" class="block text-xs font-sans font-semibold text-slate-600">N° de Téléphone</label>
            <input
              id="phone"
              type="text"
              v-model="formData.phone"
              :disabled="checkoutState === 'submitting'"
              placeholder="Ex: 06 12 34 56 78"
              :class="[
                'w-full px-4 py-3 rounded-xl border text-sm focus:outline-hidden focus:border-indigo-500 transition-colors text-slate-700',
                errors.phone ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'
              ]"
            />
            <span v-if="errors.phone" class="text-xxs text-rose-500 font-sans block">{{ errors.phone }}</span>
          </div>

          <!-- Renseignements sécurité de paiement -->
          <div class="p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-xl space-y-3 mt-6">
            <div class="flex gap-2.5">
              <ShieldCheck class="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 class="text-xs font-sans font-bold text-slate-800">Paiement Sécurisé SSL Intégré</h4>
              </div>
            </div>
            
            <button
              type="submit"
              :disabled="checkoutState === 'submitting'"
              class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer disabled:bg-slate-350 disabled:cursor-not-allowed mt-4"
            >
              <CreditCard class="w-4 h-4 shrink-0" />
              <span>{{ checkoutState === 'submitting' ? 'Traitement Bancaire en cours...' : 'Payer la commande ' + total.toFixed(2) + ' FCFA' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!--  Récapitulatif  -->
      <div class="lg:col-span-5 bg-slate-50/80 border border-slate-100 rounded-2xl p-6 space-y-6">
        <h3 class="font-sans font-bold text-slate-800 text-base">Récapitulatif</h3>
        
        <!-- Liste des items commandés -->
        <div class="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
          <div 
            v-for="item in cartItems" 
            :key="item.product.id"
            class="py-3 flex items-center justify-between gap-4 text-xs"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <img :src="item.product.mainImage" alt="mini" class="w-10 h-10 object-cover rounded-md border border-slate-100" referrerpolicy="no-referrer" />
              <div class="min-w-0">
                <p class="font-sans font-semibold text-slate-800 line-clamp-1">{{ item.product.name }}</p>
                <p class="text-slate-400 font-sans mt-0.5">Qté : {{ item.quantity }}</p>
              </div>
            </div>
            <span class="font-mono font-bold text-slate-700 shrink-0">
              {{ (item.product.price * item.quantity).toFixed(2) }} FCFA
            </span>
          </div>
        </div>

        
        <div class="border-t border-slate-250/20 pt-4 space-y-2 text-xs font-sans text-slate-600">
          <div class="flex justify-between">
            <span>Articles</span>
            <span class="font-mono">{{ subtotal.toFixed(2) }} FCFA</span>
          </div>
          <div class="flex justify-between">
            <span>Livraison</span>
            <span class="font-mono">{{ shippingCost === 0 ? 'Gratuite' : shippingCost.toFixed(2) + ' FCFA' }}</span>
          </div>
          <div class="flex justify-between font-bold text-sm text-slate-800 pt-2 border-t border-dashed border-slate-200">
            <span>Total TTC</span>
            <span class="font-mono text-indigo-700 text-base">{{ total.toFixed(2) }} FCFA</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification de succès -->
    <div 
      v-else-if="checkoutState === 'success' && createdOrder"
      class="bg-white rounded-2xl border border-emerald-100 p-8 text-center max-w-lg mx-auto space-y-6 shadow-sm"
    >
      <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
        <CheckCircle2 class="w-10 h-10" />
      </div>

      <div class="space-y-2">
        <h2 class="font-sans font-black text-2xl text-slate-800">Merci pour votre commande !</h2>
        <p class="text-xs text-slate-500">Votre paiement a été traité avec succès et votre envoi se prépare.</p>
      </div>

      
      <div class="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 text-slate-700 space-y-2.5 text-xs">
        <div class="flex justify-between border-b border-slate-200/50 pb-2">
          <span class="font-sans">N° de Suivi :</span>
          <strong class="font-mono font-bold text-indigo-600">{{ createdOrder.id }}</strong>
        </div>
        <div class="flex justify-between pb-1">
          <span class="font-sans text-slate-500">À l'attention de :</span>
          <span class="font-sans font-medium text-slate-800">{{ createdOrder.customerInfo.name }}</span>
        </div>
        <div class="pb-1">
          <span class="font-sans text-slate-500 block">Adresse de acheminement :</span>
          <p class="font-sans font-medium text-slate-800 mt-0.5 leading-relaxed">{{ createdOrder.customerInfo.address }}</p>
        </div>
        <div class="flex justify-between border-t border-slate-200/50 pt-2.5">
          <span class="font-sans font-bold text-slate-800">Montant payé :</span>
          <strong class="font-mono font-bold text-slate-800">{{ createdOrder.total.toFixed(2) }} FCFA</strong>
        </div>
      </div>

      <!-- Boutons de redirection -->
      <button
        @click="handleFinalize"
        class="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs active:scale-98"
      >
        <span>Continuer mes achats d'exploration</span>
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
