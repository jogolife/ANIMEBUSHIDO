import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface VipButtonProps {
  userId: string;
  className?: string;
}

export default function VipButton({ userId, className = "" }: VipButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!userId || userId === "anonymous_user") {
      alert("Por favor, faça login com sua conta do Google antes de adquirir o status VIP!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Algo deu errado ao iniciar o pagamento.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não retornada.");
      }
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      const errMsg = err.message || "Não foi possível conectar ao Mercado Pago.";
      setError(errMsg);
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-650 hover:to-amber-700 text-black font-extrabold text-xs px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/15 transition-all outline-none ${className}`}
        id="vip-checkout-button"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
            <span>Processando...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5 text-black animate-pulse" />
            <span>Adquirir VIP Premium</span>
          </>
        )}
      </button>
      {error && (
        <span className="text-[10px] text-rose-400 mt-1 block max-w-xs text-center font-mono leading-tight bg-rose-950/20 px-2 py-1 rounded border border-rose-500/10">{error}</span>
      )}
    </div>
  );
}
