import React, { useEffect, useState } from "react";

const Marquee = () => {
  // ✅ Temporary static data — API issue test karne ke liye
  const [coins, setCoins] = useState([
    { id: "bitcoin", symbol: "btc", image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", current_price: 97234, price_change_percentage_24h: 2.34 },
    { id: "ethereum", symbol: "eth", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", current_price: 3456, price_change_percentage_24h: -1.23 },
    { id: "tether", symbol: "usdt", image: "https://assets.coingecko.com/coins/images/325/large/Tether.png", current_price: 1.0, price_change_percentage_24h: 0.01 },
    { id: "binancecoin", symbol: "bnb", image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png", current_price: 678, price_change_percentage_24h: 1.45 },
    { id: "solana", symbol: "sol", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png", current_price: 189, price_change_percentage_24h: 3.21 },
  ]);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,dogecoin,cardano,polkadot,avalanche-2"
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCoins(data);  // ✅ only update if data valid
        }
      } catch (error) {
        console.error("Marquee api:", error);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000);  // ✅ 60 sec

    return () => clearInterval(interval);
  }, []);

  // ✅ Agar coins empty hai toh kuch render nahi karo
  if (!coins || coins.length === 0) {
    return (
      <div style={{ width: "100%", background: "#000", padding: "16px", color: "#fff", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        background: "#000",
        padding: "12px 0",
        borderBottom: "1px solid #222",
      }}
    >
      <div
        style={{
          display: "flex",
          animation: "scroll 30s linear infinite",
          width: "max-content",
        }}
      >
        {[...coins, ...coins, ...coins].map((coin, index) => {
          const change = coin.price_change_percentage_24h || 0;
          const isPositive = change >= 0;

          return (
            <div
              key={`${coin.id}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "48px",
                gap: "10px",
                fontSize: "14px",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
            >
              <img
                src={coin.image}
                alt={coin.symbol}
                style={{ width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0 }}
                onError={(e) => { e.target.style.display = "none"; }}
              />

              {/* ✅ Symbol — WHITE with !important force */}
              <span
                style={{
                  fontWeight: "700",
                  color: "#ffffff",
                  fontSize: "14px",
                  textShadow: "0 0 1px #ffffff",  // ✅ force render
                }}
              >
                {coin.symbol.toUpperCase()}
              </span>

              {/* ✅ Price — WHITE */}
              <span
                style={{
                  color: "#ffffff",
                  fontWeight: "500",
                  fontSize: "14px",
                  textShadow: "0 0 1px #ffffff",
                }}
              >
                ${coin.current_price?.toLocaleString()}
              </span>

              {/* ✅ Change Badge */}
              <span
                style={{
                  fontWeight: "600",
                  fontSize: "13px",
                  padding: "2px 12px",
                  borderRadius: "20px",
                  color: isPositive ? "#16c784" : "#ea3943",
                  background: isPositive
                    ? "rgba(22, 199, 132, 0.15)"
                    : "rgba(234, 57, 67, 0.15)",
                }}
              >
                {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
        `}
      </style>
    </div>
  );
};

export default Marquee;