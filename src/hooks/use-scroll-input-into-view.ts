"use client";

import { useEffect } from "react";

export function useScrollInputIntoView() {
 useEffect(() => {
 function onFocusIn(e: FocusEvent) {
 const el = e.target as HTMLElement | null;
 if (!el || !el.matches("input, textarea, select")) return;

 if ("visualViewport" in window) {
 el.scrollIntoView({ block: "center", behavior: "smooth" });
 }
 }

 let lastVh = window.visualViewport?.height ?? window.innerHeight;

 function onResize() {
 const vv = window.visualViewport;
 if (!vv) return;
 const shrunk = lastVh - vv.height > 100;
 lastVh = vv.height;
 if (!shrunk) return;

 const el = document.activeElement as HTMLElement | null;
 if (el?.matches("input, textarea, select")) {
 el.scrollIntoView({ block: "center", behavior: "smooth" });
 }
 }

 document.addEventListener("focusin", onFocusIn);
 window.visualViewport?.addEventListener("resize", onResize);

 return () => {
 document.removeEventListener("focusin", onFocusIn);
 window.visualViewport?.removeEventListener("resize", onResize);
 };
 }, []);
}
