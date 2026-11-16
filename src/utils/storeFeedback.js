export const feedbackMessages = {
  ar: {
    cartAdded: "تمت إضافة قطعتك بنجاح إلى السلة.",
    cartUpdated: "تم تحديث الكمية في سلتك.",
    cartRemoved: "تمت إزالة القطعة من سلتك.",
    wishlistAdded: "أضفنا هذه القطعة إلى قائمة أمنياتك.",
    wishlistRemoved: "تمت إزالة القطعة من قائمة أمنياتك.",
    undo: "تراجع",
    orderSaved: "تم حفظ طلبك بنجاح.",
    contactReceived:
      "شكراً على ثقتكم بـ FAKHARA. يسعدنا تواصلكم معنا، وسنحرص على الرد عليكم في أقرب وقت.",
    contactError:
      "تعذر إرسال رسالتك حالياً. المرجو المحاولة مرة أخرى لاحقاً.",
    cartError: "تعذر تحديث السلة. المرجو المحاولة مرة أخرى.",
    ratingSaved: "شكراً لمشاركة رأيكم معنا.",
  },
  fr: {
    cartAdded: "Votre pièce a été ajoutée au panier avec succès.",
    cartUpdated: "La quantité de votre panier a été mise à jour.",
    cartRemoved: "Cette pièce a été retirée de votre panier.",
    wishlistAdded: "Cette pièce a été ajoutée à vos favoris.",
    wishlistRemoved: "Cette pièce a été retirée de vos favoris.",
    undo: "Annuler",
    orderSaved: "Votre commande a bien été enregistrée.",
    contactReceived:
      "Merci pour votre confiance. Nous sommes ravis de votre message et nous vous répondrons dans les meilleurs délais.",
    contactError:
      "L'envoi de votre message est momentanément indisponible. Veuillez réessayer plus tard.",
    cartError:
      "Impossible de mettre à jour le panier. Veuillez réessayer.",
    ratingSaved: "Merci d'avoir partagé votre avis.",
  },
  en: {
    cartAdded: "Your piece has been successfully added to your cart.",
    cartUpdated: "Your cart quantity has been updated.",
    cartRemoved: "This piece has been removed from your cart.",
    wishlistAdded: "This piece has been added to your wishlist.",
    wishlistRemoved: "This piece has been removed from your wishlist.",
    undo: "Undo",
    orderSaved: "Your order has been saved successfully.",
    contactReceived:
      "Thank you for trusting FAKHARA. We are delighted to hear from you and will get back to you as soon as possible.",
    contactError:
      "We could not send your message right now. Please try again later.",
    cartError: "We could not update your cart. Please try again.",
    ratingSaved: "Thank you for sharing your feedback.",
  },
};

export function getFeedback(language) {
  return feedbackMessages[language] || feedbackMessages.en;
}

export function readStoredCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem("fakhara-cart") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStoredCart(cart) {
  localStorage.setItem("fakhara-cart", JSON.stringify(cart));
}

export function cartLineKey(item) {
  return `${item.id}::${item.variantKey || ""}`;
}

export function addProductToCart(
  productId,
  quantity = 1,
  variantKey = ""
) {
  const cart = readStoredCart();
  const existing = cart.find(
    (item) =>
      item.id === productId && (item.variantKey || "") === variantKey
  );

  const updatedCart = existing
    ? cart.map((item) =>
        item.id === productId &&
        (item.variantKey || "") === variantKey
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    : [...cart, { id: productId, variantKey, quantity }];

  writeStoredCart(updatedCart);
  pulseCartIcon();
  return updatedCart;
}

export function pulseCartIcon() {
  window.dispatchEvent(new CustomEvent("fakhara:cart-pulse"));
}

export function pulseWishlistIcon() {
  window.dispatchEvent(new CustomEvent("fakhara:wishlist-pulse"));
}
