import { useEffect, useState } from "react";

import {
  fetchProductRating,
  saveProductRating,
} from "../services/ratingsApi.js";

export default function useProductRating(productId) {
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${productId}:${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchProductRating(productId, { signal: controller.signal })
      .then((summary) => {
        if (active) {
          setResult({
            key: requestKey,
            data: summary,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") {
          setResult({
            key: requestKey,
            data: null,
            error: error.code || "request_failed",
          });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [productId, requestKey]);

  async function submit({ rating, review }) {
    setSubmitting(true);

    try {
      const summary = await saveProductRating(productId, {
        rating,
        review,
      });
      setResult({
        key: requestKey,
        data: summary,
        error: null,
      });
      return summary;
    } finally {
      setSubmitting(false);
    }
  }

  function reload() {
    setReloadToken((value) => value + 1);
  }

  const currentResult = result?.key === requestKey ? result : null;

  return {
    data: currentResult?.data || null,
    loading: !currentResult,
    error: currentResult?.error || null,
    submitting,
    submit,
    reload,
  };
}
