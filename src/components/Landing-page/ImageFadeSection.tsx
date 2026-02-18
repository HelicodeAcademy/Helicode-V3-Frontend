import React from "react";

export default function ImageFadeSection() {
  return (
    <section className="relative w-full">
      <div className="max-w-7xl mx-auto border-x p-5.5 lg:p-11">
        <div className="bg-[#F3F3F3] rounded-2xl border border-[#E4E4E4] p-2 shadow-[0_4px_6px_0_rgba(0,0,0,0.06)]">
          {/* The image container */}
          <div className="h-96 aspect16/10 w-full overflow-hidden rounded-xl md:h-125">
            <img
              // src="https://via.placeholder.com/1600x900/1E293B/white?text=Dashboard+Screenshot"
              src="/landingpage/dashboard-preview.png"
              alt="Dashboard Preview"
              className="h-full w-full object-cover object-top"
            />

            {/* Gradient fade overlay - this creates the fade effect */}
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-bfrom-transparentvia-transparentto-white"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 40%, white 90%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
