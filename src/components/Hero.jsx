import heroImage from "../assets/hero.png"; // CHANGE TO YOUR ACTUAL FILE NAME

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",

        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(4,10,8,.96) 0%,
            rgba(4,10,8,.90) 25%,
            rgba(4,10,8,.72) 45%,
            rgba(4,10,8,.28) 65%,
            rgba(4,10,8,.05) 100%
          ),
          url(${heroImage})
        `,

        backgroundSize: "cover",
        backgroundPosition: "72% center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Luxury glow */}
      <div
        style={{
          position: "absolute",
          left: "-250px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,160,124,.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1500px",
          margin: "0 auto",

          paddingLeft: "8vw",
paddingRight: "6vw",

          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
           maxWidth: "560px",
          }}
        >
          <p
            style={{
              color: "#C9A07C",
              fontSize: "12px",
              letterSpacing: "5px",
              textTransform: "uppercase",
              fontFamily: "Jost, sans-serif",
              marginBottom: "24px",
            }}
          >
            Fine Jewellery House
          </p>

          <h1
            style={{
              margin: 0,

              color: "#F4F1EC",

              fontFamily: "Cormorant Garamond, serif",
              fontWeight: "500",

fontSize: "clamp(3.8rem, 5.5vw, 6rem)",
              lineHeight: "0.92",

              marginBottom: "28px",
            }}
          >
            Crafted To Be
            <br />
            Treasured Forever
          </h1>

          <p
            style={{
              color: "#D7D0C6",

              fontSize: "18px",
              lineHeight: "1.9",

              maxWidth: "520px",

              fontFamily: "Jost, sans-serif",

              marginBottom: "46px",
            }}
          >
            Discover handcrafted jewellery designed with timeless elegance,
            exceptional artistry, and uncompromising attention to detail.
          </p>

          <a
            href="#products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",

              padding: "18px 52px",

              border: "1px solid #C9A07C",

              color: "#F4F1EC",

              background: "rgba(201,160,124,.04)",

              textDecoration: "none",

              textTransform: "uppercase",
              letterSpacing: "3px",

              fontSize: "12px",
              fontFamily: "Jost, sans-serif",

              transition: ".3s ease",
            }}
          >
            Shop Collection
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {

          section {
            background-position: 78% center !important;
          }

          h1 {
            font-size: 4rem !important;
          }

        }

        @media (max-width: 768px) {

          section {
            background-position: 72% center !important;
          }

          h1 {
            font-size: 3.5rem !important;
            line-height: 0.95 !important;
          }

        }

        @media (max-width: 480px) {

          section {
            background-position: 68% center !important;
          }

          h1 {
            font-size: 3rem !important;
          }

        }
      `}</style>
    </section>
  );
}