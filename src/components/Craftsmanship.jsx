import instaLogo from "../assets/instalogo.avif";

export default function Connect() {
  return (
    <section
      style={{
        padding: "100px 24px",
        background: "#ffffff",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Premium Background Texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(201, 160, 124, 0.03) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(8, 18, 12, 0.02) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Decorative Top Gold Line with Diamond Ends */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "120px",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #c9a07c, #d8b08b, #c9a07c, transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -4,
          left: "50%",
          transform: "translateX(-50%)",
          width: "6px",
          height: "6px",
          background: "#c9a07c",
          borderRadius: "50%",
          opacity: 0.6,
        }}
      />

      {/* HEADER with Animation */}
      <div
        style={{
          marginBottom: "56px",
          animation: "fadeInUp 0.8s ease-out",
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
          Stay Connected
        </p>

        <h2
          style={{
            fontSize: "clamp(34px, 6vw, 52px)",
            fontWeight: "400",
            fontFamily: "'Cormorant Garamond', serif",
            color: "#08120c",
            marginTop: "0px",
            marginBottom: "20px",
            letterSpacing: "-0.02em",
            lineHeight: "1.2",
          }}
        >
          Follow Our <em style={{ fontStyle: "italic", fontWeight: "400", color: "#c9a07c" }}>Journey</em>
        </h2>

        <div
          style={{
            width: "60px",
            height: "1px",
            background: "#c9a07c",
            margin: "24px auto 24px auto",
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
            letterSpacing: "0.01em",
          }}
        >
          Discover new arrivals, styling ideas, and behind-the-scenes moments.
          <br />
          <span style={{ color: "#c9a07c", fontWeight: "400" }}>Our Instagram</span> is where our jewellery truly comes to life.
        </p>
      </div>

      {/* MAIN CARD - PREMIUM LUXURY DESIGN */}
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "linear-gradient(135deg, #fefcf8 0%, #faf7f2 100%)",
          padding: "56px 40px",
          boxShadow: "0 30px 50px -20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(201, 160, 124, 0.15) inset",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          transition: "all 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
          position: "relative",
          backdropFilter: "blur(0px)",
          animation: "scaleIn 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px) scale(1.01)";
          e.currentTarget.style.boxShadow = "0 40px 60px -20px rgba(0, 0, 0, 0.18), 0 0 0 1px #c9a07c inset";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0px) scale(1)";
          e.currentTarget.style.boxShadow = "0 30px 50px -20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(201, 160, 124, 0.15) inset";
        }}
      >
        {/* Gold Orbital Rings behind Logo */}
        <div
          style={{
            position: "absolute",
            top: "56px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            border: "1px solid rgba(201, 160, 124, 0.2)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "44px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "134px",
            height: "134px",
            borderRadius: "50%",
            border: "1px solid rgba(201, 160, 124, 0.1)",
            pointerEvents: "none",
          }}
        />

        {/* LOGO with Premium Animation */}
        <div
          style={{
            marginBottom: "28px",
            width: "90px",
            height: "90px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "linear-gradient(145deg, #ffffff, #f8f4ec)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.04), 0 0 0 2px rgba(201, 160, 124, 0.3), inset 0 1px 0 rgba(255,255,255,0.8)",
            transition: "all 0.4s ease",
            position: "relative",
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05) rotate(3deg)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.08), 0 0 0 2px #c9a07c, inset 0 1px 0 rgba(255,255,255,0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.04), 0 0 0 2px rgba(201, 160, 124, 0.3), inset 0 1px 0 rgba(255,255,255,0.8)";
          }}
        >
          <img
            src={instaLogo}
            alt="Instagram"
            style={{
              width: "44px",
              height: "44px",
              objectFit: "contain",
              transition: "transform 0.3s ease",
            }}
          />
        </div>

        {/* USERNAME - CLICKABLE */}
        <a
          href="https://instagram.com/anjisjewel"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: "clamp(22px, 4vw, 30px)",
            marginBottom: "12px",
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: "500",
            color: "#08120c",
            letterSpacing: "-0.01em",
            textDecoration: "none",
            transition: "color 0.3s ease",
            cursor: "pointer",
            borderBottom: "1px dashed rgba(201, 160, 124, 0)",
            paddingBottom: "4px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#c9a07c";
            e.currentTarget.style.borderBottomColor = "#c9a07c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#08120c";
            e.currentTarget.style.borderBottomColor = "rgba(201, 160, 124, 0)";
          }}
        >
          @anjisjewel
        </a>

        {/* DESCRIPTION with gold accent */}
        <p
          style={{
            fontSize: "16px",
            color: "#777",
            marginBottom: "36px",
            fontFamily: "Jost, sans-serif",
            fontWeight: "350",
            letterSpacing: "0.02em",
            position: "relative",
          }}
        >
          Real looks. Real people. <span style={{ color: "#c9a07c" }}>Real elegance.</span>
        </p>

        {/* LUXURY BUTTON WITH ARROW ANIMATION */}
        <a
          href="https://instagram.com/anjisjewel"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "16px 38px",
            background: "transparent",
            color: "#0d2818",
            fontSize: "11px",
            fontWeight: "500",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            textDecoration: "none",
            fontFamily: "Jost, sans-serif",
            transition: "all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
            border: "1.5px solid #c9a07c",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#c9a07c";
            e.currentTarget.style.color = "#08120c";
            e.currentTarget.style.borderColor = "#c9a07c";
            e.currentTarget.style.paddingRight = "45px";
            const arrow = e.currentTarget.querySelector("span");
            if (arrow) arrow.style.transform = "translateX(6px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#0d2818";
            e.currentTarget.style.borderColor = "#c9a07c";
            e.currentTarget.style.paddingRight = "38px";
            const arrow = e.currentTarget.querySelector("span");
            if (arrow) arrow.style.transform = "translateX(0px)";
          }}
        >
          Follow on Instagram
          <span
            style={{
              fontSize: "16px",
              transition: "transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
              display: "inline-block",
            }}
          >
            →
          </span>
        </a>

        {/* Gold Accent Line at bottom of card */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "40px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, #c9a07c, transparent)",
            opacity: 0.3,
          }}
        />
      </div>

      {/* Keyframe Animations - Add to global CSS or keep inline via style tag */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}