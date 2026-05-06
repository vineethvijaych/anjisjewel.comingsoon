export default function Support() {
  return (
    <section
      style={{
        padding: "60px 20px",
        background: "#ffffff",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        textAlign: "center",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <p
          style={{
            fontSize: "13px",
            color: "#888",
            letterSpacing: "0.1em",
          }}
        >
          Need Help?
        </p>

        <h2
          style={{
            fontSize: "28px",
            fontWeight: "500",
            marginTop: "8px",
            marginBottom: "10px",
          }}
        >
          We’re Here for You
        </h2>

        <p
          style={{
            fontSize: "15px",
            color: "#555",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          If you have any questions about our products, orders, or anything else,
          feel free to reach out. We’ll get back to you as soon as possible.
        </p>
      </div>

      {/* CARD */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "#f8f6f2",
          padding: "30px 20px",
          border: "1px solid #eee",
        }}
      >
        <div style={{ fontSize: "28px", marginBottom: "10px" }}>✉</div>

        <h3
          style={{
            fontSize: "18px",
            marginBottom: "8px",
          }}
        >
          Email Support
        </h3>

        <p
          style={{
            fontSize: "14px",
            color: "#666",
            marginBottom: "16px",
          }}
        >
          We usually respond within 24 hours
        </p>

        {/* EMAIL LINK */}
        <a
          href="mailto:support@anjisjewel.com"
          style={{
            display: "block",
            marginBottom: "18px",
            fontSize: "14px",
            color: "#0d2818",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          anjisjewel@gmail.com
        </a>

        {/* BUTTON */}
        <a
          href="mailto:anjisjewel@gmail.com"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "#0d2818",
            color: "#fff",
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Send Email →
        </a>
      </div>
    </section>
  );
}