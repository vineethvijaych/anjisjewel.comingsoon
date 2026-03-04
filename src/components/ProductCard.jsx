export default function ProductCard({ product, addToCart }) {
  return (
    <div style={{ border: "1px solid gray", padding: 10, margin: 10 }}>
      <img src={product.image} width="150" />
      <h3>{product.name}</h3>
      <p>₹ {product.price}</p>
      <p>Stock: {product.stock}</p>

      <button
        disabled={product.stock === 0}
        onClick={() => addToCart(product.id)}
      >
        Add to Cart
      </button>
    </div>
  );
}