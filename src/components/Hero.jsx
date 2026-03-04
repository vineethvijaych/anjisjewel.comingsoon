export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      <div className="hero-content">
        <p className="hero-label">Exclusive Collection 2025</p>
        <h1>
          Where <em>Elegance</em><br />Meets Artistry
        </h1>
        <p className="hero-sub">Timeless luxury · Master craftsmanship · Ethically sourced</p>
        <div className="hero-cta">
          <a href="#products" className="btn-primary">
            <span>Explore Collection</span>
          </a>
          <a href="#craft" className="btn-ghost">Our Story</a>
        </div>
      </div>

      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  );
}
