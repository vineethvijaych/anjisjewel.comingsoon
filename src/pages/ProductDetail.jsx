import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";

const FALLBACK_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='650' viewBox='0 0 500 650'%3E%3Crect width='500' height='650' fill='%23f5f1eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='100' fill='%23c9907a' opacity='0.25'%3E%E2%97%86%3C/text%3E%3C/svg%3E`;

const zoomButton = {
  background: "#fff",
  color: "#0d2818",
  border: "none",
  borderRadius: 999,
  padding: "12px 18px",
  fontSize: 14,
  fontWeight: 700,
  minHeight: 46,
  cursor: "pointer",
};

function ProductImageZoom({ product, isMobile }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          border: "none",
          background: "var(--warm-white)",
          borderRadius: isMobile ? 14 : 18,
          overflow: "hidden",
          padding: isMobile ? 10 : 18,
          position: "relative",
          cursor: "pointer",
        }}
      >
        <img
          src={product.image || FALLBACK_IMG}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
          style={{
            width: "100%",
            maxHeight: isMobile ? 360 : 620,
            objectFit: "contain",
            borderRadius: 12,
          }}
        />

        <span
          style={{
            position: "absolute",
            right: isMobile ? 16 : 30,
            bottom: isMobile ? 16 : 30,
            background: "rgba(13,40,24,0.88)",
            color: "#fff",
            padding: "8px 13px",
            borderRadius: 999,
            fontSize: 12,
          }}
        >
          Tap to zoom
        </span>
      </button>

      {open && (
        <div
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            background: "rgba(13,40,24,0.96)",
            padding: isMobile ? 12 : 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 980 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
                gap: 12,
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  margin: 0,
                  fontSize: isMobile ? 22 : 34,
                  lineHeight: 1.2,
                }}
              >
                {product.name}
              </h2>

              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.28)",
                  background: "transparent",
                  color: "#fff",
                  fontSize: 24,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                background: "var(--warm-white)",
                borderRadius: 16,
                height: isMobile ? "72vh" : "min(72vh,720px)",
                overflow: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
              }}
            >
              <img
                src={product.image || FALLBACK_IMG}
                alt={product.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMG;
                }}
                onClick={() =>
                  setZoom((z) => Math.min(3, Number((z + 0.5).toFixed(1))))
                }
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  transform: `scale(${zoom})`,
                  transition: "transform 0.18s ease",
                  cursor: "zoom-in",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 10,
                marginTop: 14,
              }}
            >
              <button
                onClick={() =>
                  setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))
                }
                style={zoomButton}
              >
                − Zoom
              </button>

              <button onClick={() => setZoom(1)} style={zoomButton}>
                Reset
              </button>

              <button
                onClick={() =>
                  setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))
                }
                style={zoomButton}
              >
                + Zoom
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );

  const { user, fetchCartCount, addToast } = useCart();

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) console.error(error);

      setProduct(data || null);
      setLoading(false);
    };

    loadProduct();
  }, [id]);

  const addToCart = async () => {
    if (!product) return;

  if (!user) {
  addToast("Please sign in to continue", "error");

  navigate("/login", {
    state: {
      redirectTo: window.location.pathname,
    },
  });

  return;
}

    if (product.stock === 0) {
      addToast("Out of stock", "error");
      return;
    }

    setAdding(true);

    try {
      const { data: existing } = await supabase
        .from("cart")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("cart")
          .update({
            quantity: Math.min(product.stock, existing.quantity + qty),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart").insert({
          user_id: user.id,
          product_id: product.id,
          quantity: qty,
        });
      }

      await fetchCartCount();

      addToast(`${product.name} × ${qty} added`, "success");
    } finally {
      setAdding(false);
    }
  };

  const shareProduct = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `View ${product.name} on AnjisJewel`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);

        addToast("Product link copied", "success");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        addToast("Unable to share product", "error");
      }
    }
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "120px 24px",
          background: "var(--off-white)",
          textAlign: "center",
        }}
      >
        <div className="spinner" style={{ margin: "0 auto 18px" }} />

        <p style={{ color: "var(--text-muted)" }}>
          Loading product…
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "120px 24px",
          background: "var(--off-white)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 58,
            color: "var(--gold)",
            marginBottom: 16,
          }}
        >
          ◆
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isMobile ? 32 : 44,
            fontWeight: 400,
          }}
        >
          Product not found
        </h1>

        <p
          style={{
            color: "var(--text-muted)",
            margin: "12px 0 28px",
          }}
        >
          This product may be unavailable or removed.
        </p>

        <Link className="btn-primary" to="/">
          <span>Explore Collection</span>
        </Link>
      </main>
    );
  }

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          padding: isMobile
            ? "88px 16px 120px"
            : "120px 24px 90px",
          background: "var(--off-white)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Link
            to="/#products"
            style={{
              color: "var(--gold-dark)",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            ← Back to Collections
          </Link>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "minmax(320px, 1fr) minmax(340px, 480px)",
              gap: isMobile ? 24 : 44,
              alignItems: "start",
              marginTop: 28,
            }}
          >
            <ProductImageZoom
              product={product}
              isMobile={isMobile}
            />

            <section
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: isMobile
                  ? "22px 18px"
                  : "34px 30px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <p
                style={{
                  color: "var(--gold-dark)",
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {product.category}
              </p>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: isMobile
                    ? "clamp(28px,8vw,38px)"
                    : "clamp(36px,5vw,58px)",
                  fontWeight: 400,
                  lineHeight: 1.08,
                  marginBottom: 16,
                }}
              >
                {product.name}
              </h1>

              <p
                style={{
                  color: "var(--gold-dark)",
                  fontSize: isMobile ? 22 : 24,
                  fontWeight: 700,
                  marginBottom: 18,
                }}
              >
                ₹{" "}
                {Number(product.price || 0).toLocaleString(
                  "en-IN"
                )}
              </p>

              {product.description && (
                <p
                  style={{
                    color: "var(--text-muted)",
                    lineHeight: 1.8,
                    marginBottom: 24,
                    fontSize: isMobile ? 14 : 15,
                  }}
                >
                  {product.description}
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  marginBottom: 26,
                  fontSize: 14,
                  color: "var(--text-mid)",
                }}
              >
                {product.material && (
                  <p>
                    <strong>Material:</strong>{" "}
                    {product.material}
                  </p>
                )}

                {product.purity && (
                  <p>
                    <strong>Purity:</strong> {product.purity}
                  </p>
                )}

                {product.weight && (
                  <p>
                    <strong>Weight:</strong> {product.weight}
                  </p>
                )}

                {product.occasion && (
                  <p>
                    <strong>Occasion:</strong>{" "}
                    {product.occasion}
                  </p>
                )}

                {product.details && (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      lineHeight: 1.7,
                    }}
                  >
                    {product.details}
                  </p>
                )}
              </div>

              {product.stock > 0 ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile
                        ? "column"
                        : "row",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        border:
                          "1px solid rgba(0,0,0,0.12)",
                        borderRadius: 10,
                        overflow: "hidden",
                        height: 52,
                      }}
                    >
                      <button
                        onClick={() =>
                          setQty((q) => Math.max(1, q - 1))
                        }
                        style={{
                          width: 52,
                          height: 52,
                          background:
                            "var(--warm-white)",
                          border: "none",
                          fontSize: 20,
                          cursor: "pointer",
                        }}
                      >
                        −
                      </button>

                      <span
                        style={{
                          minWidth: 60,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {qty}
                      </span>

                      <button
                        onClick={() =>
                          setQty((q) =>
                            Math.min(
                              product.stock,
                              q + 1
                            )
                          )
                        }
                        style={{
                          width: 52,
                          height: 52,
                          background:
                            "var(--warm-white)",
                          border: "none",
                          fontSize: 20,
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={addToCart}
                      disabled={adding}
                      style={{
                        flex: 1,
                        minHeight: 52,
                        background: "var(--forest)",
                        color: "#fff",
                        borderRadius: 10,
                        border: "none",
                        letterSpacing: "0.12em",
                        fontSize: 14,
                        fontWeight: 700,
                        opacity: adding ? 0.7 : 1,
                        cursor: "pointer",
                        padding: "0 18px",
                      }}
                    >
                      {adding
                        ? "Adding..."
                        : "Add to Cart"}
                    </button>
                  </div>

                  <p
                    style={{
                      color: "var(--sage)",
                      fontSize: 13,
                      marginBottom: 18,
                    }}
                  >
                    {product.stock} in stock
                  </p>
                </>
              ) : (
                <div
                  style={{
                    background: "#eee",
                    color: "#777",
                    borderRadius: 8,
                    padding: 16,
                    textAlign: "center",
                    marginBottom: 18,
                  }}
                >
                  Out of Stock
                </div>
              )}

              <button
                onClick={shareProduct}
                style={{
                  width: "100%",
                  padding: "16px 18px",
                  minHeight: 54,
                  borderRadius: 10,
                  border:
                    "1px solid rgba(201,144,122,0.35)",
                  background: "#fff",
                  color: "var(--forest)",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Share this Product
              </button>
            </section>
          </div>
        </div>
      </main>

      {isMobile && product.stock > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            padding: "12px 16px",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            zIndex: 1200,
            display: "flex",
            gap: 12,
            alignItems: "center",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "var(--forest)",
              }}
            >
              ₹{" "}
              {Number(product.price || 0).toLocaleString(
                "en-IN"
              )}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              {product.stock} in stock
            </div>
          </div>

          <button
            onClick={addToCart}
            disabled={adding}
            style={{
              flex: 1,
              minHeight: 52,
              borderRadius: 12,
              background: "var(--forest)",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      )}
    </>
  );
}