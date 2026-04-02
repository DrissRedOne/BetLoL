"use client";

import { useState } from "react";
import { DepositForm } from "@/components/wallet/deposit-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function WalletActions() {
  const [showDeposit, setShowDeposit] = useState(false);

  async function handleDeposit(amount: number) {
    const response = await fetch("/api/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? "Erreur lors du dépôt");
    }

    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
  }

  return (
    <div className="space-y-3">
      {showDeposit ? (
        <>
          <DepositForm onDeposit={handleDeposit} />
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowDeposit(false)}
          >
            Annuler
          </Button>
        </>
      ) : (
        <Card>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => setShowDeposit(true)}>
              Déposer
            </Button>
            <Button variant="outline" className="w-full">
              Retirer
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export { WalletActions };
