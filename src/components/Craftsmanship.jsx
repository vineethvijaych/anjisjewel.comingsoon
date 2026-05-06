import instaLogo from "../assets/instalogo.avif";

export default function Connect() {
  return (
    <section
      style={{
        padding: "70px 20px",
        background: "#f8f6f2",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        textAlign: "center",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "40px" }}>
        <p
          style={{
            fontSize: "13px",
            color: "#888",
            letterSpacing: "0.1em",
          }}
        >
          Stay Connected
        </p>

        <h2
          style={{
            fontSize: "32px",
            fontWeight: "500",
            marginTop: "8px",
            marginBottom: "10px",
          }}
        >
          Follow Our <em>Journey</em>
        </h2>

        <p
          style={{
            fontSize: "16px",
            color: "#555",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          Discover new arrivals, styling ideas, and behind-the-scenes moments.
          Our Instagram is where our jewellery truly comes to life.
        </p>
      </div>

      {/* INSTAGRAM CARD */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#fff",
          padding: "36px 24px",
          border: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* LOGO */}
        <div style={{ marginBottom: "14px" }}>
          <img
            src={instaLogo}
            alt="Instagram"
            style={{
              width: "42px",
              height: "42px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* USERNAME */}
        <h3
          style={{
            fontSize: "20px",
            marginBottom: "6px",
          }}
        >
          @anjisjewel
        </h3>

        {/* DESCRIPTION */}
        <p
          style={{
            fontSize: "15px",
            color: "#666",
            marginBottom: "22px",
          }}
        >
          Real looks. Real people. Real elegance.
        </p>

        {/* BUTTON */}
        <a
          href="https://instagram.com/anjisjewel"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            padding: "14px 26px",
            background: "#0d2818",
            color: "#fff",
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Follow on Instagram →
        </a>
      </div>
    </section>
  );
}