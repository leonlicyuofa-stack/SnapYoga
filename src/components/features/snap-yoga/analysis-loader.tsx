"use client";
import { useEffect, useRef } from 'react';

export function AnalysisLoader() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);

    let drawing = true;
    const DURATION = 2200; // ms for each draw or erase pass

    function cycle() {
      const p = pathRef.current;
      if (!p) return;
      p.style.transition = `stroke-dashoffset ${DURATION}ms cubic-bezier(0.45,0,0.25,1)`;
      p.style.strokeDashoffset = drawing ? '0' : String(len);
      drawing = !drawing;
    }

    // start first pass after a tick so the initial state is applied
    const startTimer = setTimeout(cycle, 50);
    const interval = setInterval(cycle, DURATION + 200);

    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{
      width: '100%',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      gap: 28,
      background: 'transparent',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <svg viewBox="0 0 400 400" width="280" height="280">
        <path
          ref={pathRef}
          d="M195.801 66.736 C 156.363 68.758,123.505 97.871,115.253 138.101 C 114.402 142.248,114.048 145.249,113.516 152.832 L 113.379 154.785 89.838 154.817 C 63.743 154.853,65.319 154.777,62.402 156.145 C 47.072 163.333,37.182 198.553,40.929 232.617 C 43.717 257.956,53.255 277.001,64.746 280.174 C 66.330 280.611,73.241 280.822,73.245 280.433 C 73.247 280.244,73.299 280.253,73.440 280.469 C 73.651 280.790,74.105 280.367,73.901 280.039 C 73.724 279.752,73.972 279.879,74.244 280.213 C 74.426 280.438,74.433 280.497,74.268 280.397 C 74.133 280.316,74.023 280.343,74.023 280.457 C 74.023 280.571,74.155 280.664,74.316 280.664 C 74.478 280.664,74.609 280.559,74.609 280.430 C 74.609 280.248,74.662 280.248,74.844 280.430 C 75.148 280.734,329.312 280.767,332.227 280.463 C 345.605 279.067,356.028 260.176,359.164 231.641 C 362.727 199.209,352.897 164.209,338.073 156.547 C 334.593 154.749,336.023 154.852,313.794 154.798 C 303.038 154.772,292.502 154.736,290.381 154.719 L 286.523 154.688 286.521 153.076 C 286.515 148.103,285.433 140.377,283.861 134.082 C 273.507 92.619,236.906 64.627,195.801 66.736 M205.176 85.552 C 230.189 87.653,251.749 103.621,262.010 127.643 C 265.562 135.959,267.950 147.513,267.591 154.642 C 267.578 154.900,134.531 155.003,133.028 154.746 L 132.364 154.633 132.492 151.959 C 134.358 112.867,167.699 82.405,205.176 85.552 M139.323 164.063 L 139.439 164.746 139.089 164.063 C 138.897 163.687,138.778 163.305,138.825 163.215 C 138.968 162.944,139.199 163.337,139.323 164.063 M140.024 165.186 C 140.014 165.392,139.969 165.430,139.909 165.282 C 139.855 165.147,139.730 165.086,139.632 165.147 C 139.534 165.208,139.453 165.164,139.453 165.051 C 139.453 164.937,139.585 164.844,139.746 164.844 C 139.907 164.844,140.032 164.998,140.024 165.186 M153.483 299.329 C 139.292 301.897,134.409 319.845,145.371 329.145 C 156.605 338.675,173.568 330.876,173.626 316.154 C 173.668 305.626,163.877 297.449,153.483 299.329 M240.949 299.215 C 226.912 301.769,221.536 318.326,231.530 328.223 C 245.806 342.360,268.458 324.653,258.232 307.350 C 254.825 301.584,247.326 298.054,240.949 299.215"
          fill="none"
          stroke="rgba(193,154,107,0.85)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 18, fontStyle: 'italic',
        color: 'rgba(255,240,215,0.70)', letterSpacing: '0.05em',
      }}>
        Analyzing your pose…
      </p>
    </div>
  );
}
