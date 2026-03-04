export default function Craftsmanship() {
  const pillars = [
    { n: "01", icon: "◈", title: "Ethically Sourced", desc: "Every gemstone and metal is traceable to conflict-free origins. We partner only with certified mines and suppliers who share our commitment to responsible luxury." },
    { n: "02", icon: "◉", title: "Handcrafted", desc: "Master artisans with decades of expertise shape each piece by hand. No shortcuts — only the patient, precise work that enduring jewellery demands." },
    { n: "03", icon: "◇", title: "Certified Quality", desc: "Every gemstone is independently graded and certified. Our pieces come with a lifetime authenticity guarantee, because trust is the foundation of true luxury." },
  ];
  return (
    <section id="craft" className="craft">
      <div className="craft-inner">
        <div className="craft-header">
          <p className="section-label">Our Promise</p>
          <h2 className="section-title">Crafted to <em>Perfection</em></h2>
        </div>
        <div className="craft-grid">
          {pillars.map((p) => (
            <div className="craft-item" key={p.n}>
              <div className="craft-number">{p.n}</div>
              <div className="craft-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
