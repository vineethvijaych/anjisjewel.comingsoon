export default function Support() {
  return (
    <section
      style={{
        padding: "80px 24px",
        background: "#f4f1ec",
        position: "relative",
      }}
    >
      {/* Background subtle texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(201, 160, 124, 0.03) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Decorative Gold Top Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80px",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #c9a07c, #d8b08b, #c9a07c, transparent)",
        }}
      />

      {/* HEADER */}
      <div
        style={{
          marginBottom: "48px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: "400",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c9a07c",
            marginBottom: "16px",
            fontFamily: "Jost, sans-serif",
          }}
        >
          Need Help?
        </p>

        <h2
          style={{
            fontSize: "clamp(32px, 6vw, 44px)",
            fontWeight: "400",
            fontFamily: "'Cormorant Garamond', serif",
            color: "#0d2818",
            margin: "0 0 16px 0",
            letterSpacing: "-0.02em",
          }}
        >
          We're Here for{" "}
          <span style={{ color: "#c9a07c", fontStyle: "italic" }}>You</span>
        </h2>

        <div
          style={{
            width: "60px",
            height: "1px",
            background: "#c9a07c",
            margin: "20px auto 24px auto",
            opacity: 0.4,
          }}
        />

        <p
          style={{
            fontSize: "clamp(15px, 4vw, 17px)",
            color: "#555",
            maxWidth: "560px",
            margin: "0 auto",
            lineHeight: "1.7",
            fontFamily: "Jost, sans-serif",
            fontWeight: "350",
          }}
        >
          If you have any questions about our products, orders, or anything else,
          feel free to reach out. We'll get back to you as soon as possible.
        </p>
      </div>

      {/* EMAIL CARD - Fixed Alignment */}
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          margin: "0 auto",
          background: "#ffffff",
          padding: "48px 32px",
          border: "1px solid rgba(201, 160, 124, 0.25)",
          transition: "all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
          boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 24px 40px -12px rgba(0, 0, 0, 0.12)";
          e.currentTarget.style.borderColor = "#c9a07c";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 12px 24px -10px rgba(0, 0, 0, 0.05)";
          e.currentTarget.style.borderColor = "rgba(201, 160, 124, 0.25)";
        }}
      >
        {/* Top gold accent line inside card */}
        <div
          style={{
            width: "50px",
            height: "1px",
            background: "#c9a07c",
            margin: "0 auto 32px auto",
            opacity: 0.5,
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: "52px",
            marginBottom: "20px",
            display: "inline-block",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ✉️
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "26px",
            fontWeight: "500",
            color: "#0d2818",
            margin: "0 0 12px 0",
          }}
        >
          Email Support
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "14px",
            color: "#888",
            margin: "0 0 24px 0",
            lineHeight: "1.5",
          }}
        >
          We usually respond within 24 hours
        </p>

        {/* Email Link */}
        <a
          href="mailto:anjisjewel@gmail.com"
          style={{
            display: "inline-block",
            fontFamily: "Jost, sans-serif",
            fontSize: "18px",
            color: "#0d2818",
            textDecoration: "none",
            fontWeight: "500",
            marginBottom: "32px",
            borderBottom: "1px solid rgba(201, 160, 124, 0.3)",
            paddingBottom: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#c9a07c";
            e.currentTarget.style.borderBottomColor = "#c9a07c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#0d2818";
            e.currentTarget.style.borderBottomColor = "rgba(201, 160, 124, 0.3)";
          }}
        >
          anjisjewel@gmail.com
        </a>

        {/* Button - Full Width for Better Alignment */}
        <a
          href="mailto:anjisjewel@gmail.com"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "14px 24px",
            background: "#0d2818",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: "500",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textDecoration: "none",
            fontFamily: "Jost, sans-serif",
            border: "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#c9a07c";
            e.currentTarget.style.color = "#0d2818";
            e.currentTarget.style.borderColor = "#c9a07c";
            const arrow = e.currentTarget.querySelector("span");
            if (arrow) arrow.style.transform = "translateX(6px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0d2818";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            const arrow = e.currentTarget.querySelector("span");
            if (arrow) arrow.style.transform = "translateX(0px)";
          }}
        >
          Send Email
          <span style={{ fontSize: "14px", transition: "transform 0.2s ease" }}>→</span>
        </a>

        {/* Bottom gold accent line inside card */}
        <div
          style={{
            width: "50px",
            height: "1px",
            background: "#c9a07c",
            margin: "32px auto 0 auto",
            opacity: 0.3,
          }}
        />
      </div>

      {/* Trust Badge */}
      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              width: "30px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(201, 160, 124, 0.4))",
            }}
          />
          <p
            style={{
              fontFamily: "Jost, sans-serif",
              fontSize: "12px",
              color: "#999",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            Typical response time: 24 hours
          </p>
          <span
            style={{
              width: "30px",
              height: "1px",
              background: "linear-gradient(90deg, rgba(201, 160, 124, 0.4), transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}