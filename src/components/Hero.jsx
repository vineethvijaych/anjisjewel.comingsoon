import logo from "../assets/ChatGPT Image May 17, 2026, 07_35_46 PM (1).png";

export default function Hero() {
  return (
    <section
      className="hero"
      style={{
        minHeight: "135vh",
        position: "relative",

        /* prevent clipping */
        overflow: "visible",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        

        paddingBottom: "120px",
      }}
    >
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      <div
        className="hero-content"
        style={{
          width: "100%",
          maxWidth: "1400px",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",

          margin: "0 auto",

          paddingTop: "200px",
          paddingBottom: "80px",
          paddingLeft: "20px",
          paddingRight: "20px",

          position: "relative",
          zIndex: 2,
        }}
      >
        {/* LOGO */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            
          }}
        >
          <img
            src={logo}
            alt="Anjisjewel"
            style={{
              width: "min(500px, 90vw)",
              maxWidth: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
              paddingBottom: "80px"
              
            }}
          />
        </div>

        {/* LABEL */}
        <p
          className="hero-label"
          style={{
            marginTop: "0",
            marginBottom: "25px",
          }}
        >
          Exclusive Collection
        </p>

        {/* TITLE */}
        <h1
          style={{
            margin: "0",
            lineHeight: "0.95",
            fontSize: "clamp(3rem, 7vw, 6.5rem)",
            maxWidth: "900px",
          }}
        >
          Where <em>Elegance</em>
          <br />
          Meets Artistry
        </h1>

        {/* SUBTEXT */}
        <p
          className="hero-sub"
          style={{
            marginTop: "25px",
            marginBottom: "35px",
            maxWidth: "700px",
          }}
        >
          Timeless luxury · Master craftsmanship · Ethically sourced
        </p>

        {/* BUTTON */}
        <div
          className="hero-cta"
          style={{
            
            
        
          }}
        >
          <a href="#products" className="btn-primary">
            <span>Explore Collection</span>
          </a>
        </div>
      </div>

      {/* SCROLL */}
      <div
        className="hero-scroll"
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
        }}
      >
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  );
}