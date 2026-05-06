export default function ProductCard({ product, addToCart }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        padding: "16px",
        margin: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "all 0.3s ease",
      }}
    >
      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
          background: "#f5f1eb",
        }}
      />

      {/* Name */}
      <h3
        style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#1a1410",
          margin: 0,
        }}
      >
        {product.name}
      </h3>

      {/* Price */}
      <p
        style={{
          fontSize: "14px",
          color: "#a8705c",
          margin: 0,
        }}
      >
        ₹ {product.price}
      </p>

      {/* Stock */}
      <p
        style={{
          fontSize: "11px",
          color: "#7a6f68",
          margin: 0,
        }}
      >
        {product.stock > 0
          ? `${product.stock} in stock`
          : "Out of stock"}
      </p>

      {/* Button */}
      <button
        disabled={product.stock === 0}
        onClick={() => addToCart(product.id)}
        style={{
          marginTop: "8px",
          padding: "12px",
          background: product.stock === 0 ? "#ccc" : "#0d2818",
          color: "#fff",
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          border: "none",
          cursor: product.stock === 0 ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
        }}
      >
        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}