export default function ProductCard({ product, addToCart }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(13,40,24,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "all .35s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow =
          "0 20px 40px rgba(0,0,0,.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          background: "#f8f4ef",
          aspectRatio: "1 / 1",
          overflow: "hidden",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: "24px",
            transition: "transform .5s ease",
          }}
        />
      </div>

      {/* CONTENT */}
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#a8705c",
            fontFamily: "Jost, sans-serif",
          }}
        >
          Fine Jewellery
        </p>

        <h3
          style={{
            margin: 0,
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "30px",
            fontWeight: "500",
            color: "#0d2818",
            lineHeight: "1.1",
          }}
        >
          {product.name}
        </h3>

        <div
          style={{
            width: "40px",
            height: "1px",
            background: "#c9a07c",
          }}
        />

        <p
          style={{
            margin: 0,
            fontSize: "18px",
            color: "#0d2818",
            fontWeight: "500",
            fontFamily: "Jost, sans-serif",
          }}
        >
          ₹ {product.price}
        </p>

        <p
          style={{
            margin: 0,
            fontSize: "12px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color:
              product.stock > 0
                ? "#56705c"
                : "#b94b4b",
            fontFamily: "Jost, sans-serif",
          }}
        >
          {product.stock > 0
            ? `${product.stock} Available`
            : "Sold Out"}
        </p>

        <button
          disabled={product.stock === 0}
          onClick={() => addToCart(product.id)}
          style={{
            marginTop: "12px",

            padding: "16px",

            background:
              product.stock === 0
                ? "#d8d2ca"
                : "#0d2818",

            color:
              product.stock === 0
                ? "#6d6a66"
                : "#fff",

            border: "none",

            fontSize: "11px",
            letterSpacing: "2px",
            textTransform: "uppercase",

            cursor:
              product.stock === 0
                ? "not-allowed"
                : "pointer",

            transition: ".3s ease",
          }}
        >
          {product.stock === 0
            ? "Sold Out"
            : "Add To Cart"}
        </button>
      </div>
    </div>
  );
}