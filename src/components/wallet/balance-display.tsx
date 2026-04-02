"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";
import { Coins } from "lucide-react";

interface BalanceDisplayProps {
  balance: number;
  pendingBets?: number;
}

function BalanceDisplay({ balance, pendingBets = 0 }: BalanceDisplayProps) {
  const [displayed, setDisplayed] = useState(0);
  const prevBalance = useRef(0);

  useEffect(() => {
    const start = prevBalance.current;
    const end = balance;
    prevBalance.current = balance;

    if (start === end) {
      setDisplayed(end);
      return;
    }

    const duration = 600;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplayed(start + (end - start) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [balance]);

  return (
    <Card glow>
      <div className="text-center py-2">
        <Coins className="h-8 w-8 text-[var(--accent-green)] mx-auto mb-2" />
        <p className="text-sm text-[var(--text-muted)] mb-1">Votre solde</p>
        <p className="text-3xl font-bold font-[family-name:var(--font-mono)] text-[var(--accent-green)]">
          {formatAmount(displayed)}
        </p>
        {pendingBets > 0 && (
          <p className="text-xs text-[var(--accent-gold)] mt-2">
            {pendingBets} pari{pendingBets > 1 ? "s" : ""} en cours
          </p>
        )}
      </div>
    </Card>
  );
}

export { BalanceDisplay };
