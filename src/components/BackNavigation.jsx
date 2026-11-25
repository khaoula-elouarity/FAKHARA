/*
 * From Uiverse.io by karthik092726122003 - https://uiverse.io/karthik092726122003/clever-crab-26
 * MIT License, Copyright (c) karthik092726122003
 */
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BackNavigation.css";

const HISTORY_KEY = "fakhara-internal-route-history";

function readRouteHistory() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

export default function BackNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const historyIndex = window.history.state?.idx;
  const currentIndex = Number.isInteger(historyIndex) ? historyIndex : 0;
  const routeHistory = readRouteHistory();
  const previousRoute = routeHistory[String(currentIndex - 1)];
  const area = location.pathname.startsWith("/admin") ? "admin" : "customer";
  const canGoBack =
    currentIndex > 0 &&
    typeof previousRoute?.pathname === "string";

  useEffect(() => {
    const routes = readRouteHistory();
    routes[String(currentIndex)] = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    };

    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(routes));
    } catch {
      // If history cannot be recorded, the button stays hidden until a prior route is known.
    }
  }, [currentIndex, location.hash, location.pathname, location.search]);

  function handleBack() {
    if (canGoBack) {
      navigate(-1);
    }
  }

  if (!canGoBack) {
    return null;
  }

  return (
    <div className={`back-navigation back-navigation--${area}`}>
      <button
        className="uiverse-back-button"
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        title="Go back"
      >
        <span className="uiverse-back-arrow" aria-hidden="true" />
        <span className="uiverse-back-arrow" aria-hidden="true" />
      </button>
    </div>
  );
}
