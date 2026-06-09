export default function Footer() {
  return (
    <footer
      style={{
        background: "#0d2818", // Forest green
        backgroundImage: "radial-gradient(circle at 10% 20%, rgba(201, 160, 124, 0.03) 0%, transparent 80%)",
        padding: "50px 20px 35px",
        position: "relative",
        borderTop: "1px solid rgba(201, 160, 124, 0.3)",
      }}
    >
      {/* Decorative Gold Top Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(100px, 40%)",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #c9a07c, #d8b08b, #c9a07c, transparent)",
        }}
      />

      {/* Gold Diamond Accent */}
      <div
        style={{
          position: "absolute",
          top: -4,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: "8px",
          height: "8px",
          background: "#c9a07c",
          opacity: 0.8,
        }}
      />

      {/* Main Footer Content - Mobile Responsive */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column", // Mobile default
          justifyContent: "center",
          alignItems: "center",
          gap: "28px",
        }}
        className="footer-content"
      >
        {/* Left Section - Logo */}
        <div
          style={{
            width: "100%",
            textAlign: "center", // Centered on mobile
          }}
          className="footer-logo-wrapper"
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(26px, 6vw, 32px)",
              fontWeight: "400",
              letterSpacing: "0.02em",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#c9a07c";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ color: "#ffffff" }}>AnjisJewel</span>
            <span
              style={{
                color: "#c9a07c",
                fontWeight: "500",
                borderBottom: "1px solid rgba(201, 160, 124, 0.4)",
                paddingBottom: "2px",
              }}
            >
             
            </span>
          </div>
        </div>

        {/* Center Section - Copyright */}
        <div
          style={{
            width: "100%",
            textAlign: "center",
          }}
          className="footer-copyright-wrapper"
        >
          <p
            style={{
              fontFamily: "Jost, sans-serif",
              fontSize: "clamp(11px, 3.5vw, 14px)",
              fontWeight: "350",
              letterSpacing: "0.1em",
              color: "rgba(255, 255, 255, 0.7)",
              margin: 0,
              textTransform: "uppercase",
              lineHeight: "1.6",
            }}
          >
            © {new Date().getFullYear()} AnjisJewel
            <span
              style={{
                display: "inline-block",
                margin: "0 6px",
                color: "#c9a07c",
                fontSize: "10px",
              }}
            >
              ✦
            </span>
            All Rights Reserved
          </p>
        </div>

        {/* Right Section - Credit */}
        <div
          style={{
            width: "100%",
            textAlign: "center",
          }}
          className="footer-credit-wrapper"
        >
          <p
            style={{
              fontFamily: "Jost, sans-serif",
              fontSize: "clamp(11px, 3.5vw, 13px)",
              fontWeight: "350",
              letterSpacing: "0.08em",
              color: "rgba(255, 255, 255, 0.6)",
              margin: 0,
              transition: "color 0.3s ease",
              lineHeight: "1.6",
            }}
          >
            Crafted By{" "}
            <span
              style={{
                color: "#d8b08b",
                fontWeight: "400",
                transition: "color 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#c9a07c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#d8b08b";
              }}
            >
              Vineeth
            </span>
            <span
              style={{
                display: "inline-block",
                margin: "0 6px 0 8px",
                color: "#c9a07c",
                fontSize: "10px",
              }}
            >
              ✦
            </span>
            Est. 2026
          </p>
        </div>
      </div>

      {/* Bottom Decorative Line - Responsive */}
      <div
        style={{
          marginTop: "35px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "min(40px, 15vw)",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(201, 160, 124, 0.4))",
            }}
          />
          <div
            style={{
              width: "4px",
              height: "4px",
              background: "#c9a07c",
              borderRadius: "50%",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              width: "min(40px, 15vw)",
              height: "1px",
              background: "linear-gradient(90deg, rgba(201, 160, 124, 0.4), transparent)",
            }}
          />
        </div>
      </div>

      {/* CSS Media Queries for Responsive Layout */}
      <style>{`
        /* Tablet and up (min-width: 768px) */
        @media (min-width: 768px) {
          .footer-content {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 20px !important;
          }
          
          .footer-logo-wrapper {
            width: auto !important;
            text-align: left !important;
            flex: 1 !important;
          }
          
          .footer-copyright-wrapper {
            width: auto !important;
            text-align: center !important;
            flex: 1 !important;
          }
          
          .footer-credit-wrapper {
            width: auto !important;
            text-align: right !important;
            flex: 1 !important;
          }
        }

        /* Small mobile devices (max-width: 480px) */
        @media (max-width: 480px) {
          footer {
            padding: 40px 16px 30px !important;
          }
          
          .footer-content {
            gap: 20px !important;
          }
          
          .footer-logo-wrapper div {
            font-size: 24px !important;
          }
          
          .footer-copyright-wrapper p,
          .footer-credit-wrapper p {
            letter-spacing: 0.08em !important;
          }
        }

        /* Very small devices (max-width: 360px) */
        @media (max-width: 360px) {
          .footer-copyright-wrapper p span {
            display: block !important;
            margin: 6px 0 !important;
          }
          
          .footer-copyright-wrapper p span:first-of-type {
            margin: 0 4px !important;
          }
          
          .footer-credit-wrapper p span {
            display: inline-block !important;
          }
        }

        @keyframes subtlePulse {
          0% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </footer>
  );
}