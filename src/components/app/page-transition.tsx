// "use client";

import { usePathname } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import type { ReactNode } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [animDir, setAnimDir] = useState<string | null>(null);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [leaving, setLeaving] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (pathname === prevPath.current) return;

    const dir = getDir(prevPath.current, pathname);
    setAnimDir(dir);
    setLeaving(displayChildren);
    setDisplayChildren(children);
    prevPath.current = pathname;
  }, [pathname, children, displayChildren]);

  function onAnimationEnd() {
    setAnimDir(null);
    setLeaving(null);
  }

  const isInOrder = ORDER.includes(pathname);

  if (!isInOrder || (!animDir && !leaving)) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden">
      {leaving && (
        <div
          className="absolute inset-0"
          style={{
            animation: `${animDir === "left" ? "slideOutLeft" : "slideOutRight"} 250ms ease-in-out forwards`,
          }}
        >
          {leaving}
        </div>
      )}
      <div
        onAnimationEnd={onAnimationEnd}
        style={{
          animation: animDir
            ? `${animDir === "left" ? "slideInRight" : "slideInLeft"} 250ms ease-in-out forwards`
            : "none",
        }}
      >
        {displayChildren}
      </div>
    </div>
  );
}
