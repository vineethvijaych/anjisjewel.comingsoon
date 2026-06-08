import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Products from "../components/Products";
import Craftsmanship from "../components/Craftsmanship";
import Footer from "../components/Footer";
import Support from "../components/Support";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Simulate loading progress for luxury feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Smooth progress animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "#f4f1ec",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeOut 0.4s ease forwards",
        animationDelay: "0.6s",
      }}>
        {/* Animated Logo */}
        <div style={{
          textAlign: "center",
          animation: "pulse 1.5s ease infinite",
        }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(42px, 10vw, 64px)",
            fontWeight: "400",
            color: "#0d2818",
            margin: 0,
            letterSpacing: "-0.02em",
          }}>
            Anjis<span style={{ color: "#c9a07c", fontStyle: "italic" }}>Jewel</span>
          </h1>
          
          {/* Gold Divider */}
          <div style={{
            width: "60px",
            height: "1px",
            background: "#c9a07c",
            margin: "20px auto 24px",
            opacity: 0.5,
          }} />
          
          {/* Loading Bar */}
          <div style={{
            width: "200px",
            height: "1px",
            background: "rgba(201, 160, 124, 0.2)",
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${Math.min(progress, 100)}%`,
              background: "#c9a07c",
              transition: "width 0.1s linear",
            }} />
          </div>
          
          <p style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "#999",
            marginTop: "16px",
            textTransform: "uppercase",
          }}>
            Curating Luxury...
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            0% { opacity: 0.6; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 0.6; transform: scale(0.98); }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; visibility: visible; }
            to { opacity: 0; visibility: hidden; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Preload critical images */}
      <link rel="preload" as="image" href="/hero-image.jpg" />
      
      {/* Fade in animation for content */}
      <div style={{
        animation: "contentFadeIn 0.6s ease-out",
      }}>
        <Hero />
        <Products />
        <Craftsmanship />
        <Support />
        <Footer />
      </div>

      <style>{`
        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Lazy loading image styles */
        img {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        img.loaded {
          opacity: 1;
        }
      `}</style>
    </>
  );
}