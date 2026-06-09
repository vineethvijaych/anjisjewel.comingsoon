import "./MaintenanceOverlay.css";

export default function MaintenanceOverlay() {
  return (
    <div className="maintenance-overlay">
      <div className="maintenance-card">

        <div className="logo">
          ANJISJEWEL
        </div>

        <h1>Under <br /> Maintenance</h1>

        <p>
          We are currently upgrading the website experience.
          <br />
          Please visit again shortly.
        </p>

        <div className="loader">
          <div className="loader-fill"></div>
        </div>

        <span>
          Website update in progress
        </span>

      </div>
    </div>
  );
}