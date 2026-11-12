import React, { useEffect, useRef, useState } from "react";

function Counter() {
  // ==========================================
  // STATES
  // ==========================================

  const [count, setCount] = useState(10);

  const [launched, setLaunched] = useState(false);
  const [rocketLaunched, setRocketLaunched] = useState(false);

  const [altitude, setAltitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [temperature, setTemperature] = useState(25);

  const [stage, setStage] = useState("READY");
  const [missionTime, setMissionTime] = useState(0);

  const [shake, setShake] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);

  // Used to stop countdown timer
  const countdownRef = useRef(null);

  // ==========================================
  // SOUND SYSTEM
  // ==========================================

  const playBeep = (frequency = 700, duration = 0.15) => {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    const audio = new AudioContext();

    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "square";

    gain.gain.setValueAtTime(0.15, audio.currentTime);

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audio.currentTime + duration
    );

    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  };

  // ==========================================
  // LIFTOFF SOUND
  // ==========================================

  const playLaunchSound = () => {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    const audio = new AudioContext();

    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.type = "sawtooth";

    oscillator.frequency.setValueAtTime(
      80,
      audio.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      700,
      audio.currentTime + 2
    );

    gain.gain.setValueAtTime(
      0.3,
      audio.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audio.currentTime + 2
    );

    oscillator.start();
    oscillator.stop(audio.currentTime + 2);
  };

  // ==========================================
  // SUCCESS SOUND
  // ==========================================

  const playSuccessSound = () => {
    playBeep(700, 0.2);

    setTimeout(() => {
      playBeep(900, 0.2);
    }, 200);

    setTimeout(() => {
      playBeep(1200, 0.4);
    }, 400);
  };

  // ==========================================
  // LAUNCH ROCKET
  // ==========================================

  const launchRocket = () => {
    if (launched || missionComplete) return;

    // Stop countdown if running
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    setCount(0);
    setLaunched(true);
    setRocketLaunched(true);
    setStage("🚀 LIFTOFF");

    // Play launch sound
    playLaunchSound();
  };

  // ==========================================
  // AUTOMATIC COUNTDOWN
  // ==========================================

  const startMission = () => {
    if (launched || missionComplete) return;

    // Prevent multiple timers
    if (countdownRef.current) return;

    setStage("COUNTDOWN");

    let current = count;

    // If user somehow starts at 0
    if (current === 0) {
      launchRocket();
      return;
    }

    countdownRef.current = setInterval(() => {
      current--;

      setCount(current);

      // Countdown sound
      if (current > 0) {
        playBeep(
          current <= 3 ? 900 : 600,
          current <= 3 ? 0.25 : 0.12
        );
      }

      // Reach zero
      if (current === 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;

        launchRocket();
      }
    }, 1000);
  };

  // ==========================================
  // MANUAL DECREMENT
  // ==========================================

  const decrement = () => {
    if (launched || missionComplete) return;

    const nextCount = Math.max(count - 1, 0);

    setCount(nextCount);

    // Sound for manual countdown
    if (nextCount > 0) {
      playBeep(
        nextCount <= 3 ? 900 : 600,
        0.15
      );
    }

    // IMPORTANT:
    // If manually going from 1 -> 0,
    // launch the rocket.
    if (nextCount === 0) {
      setTimeout(() => {
        launchRocket();
      }, 100);
    }
  };

  // ==========================================
  // MANUAL INCREMENT
  // ==========================================

  const increment = () => {
    if (launched || missionComplete) return;

    setCount((prev) => prev + 1);

    playBeep(500, 0.1);
  };

  // ==========================================
  // TELEMETRY
  // ==========================================

  useEffect(() => {
    if (!launched) return;

    const telemetry = setInterval(() => {
      setMissionTime((prev) => prev + 1);

      setAltitude((prev) =>
        Math.min(
          prev + Math.floor(Math.random() * 500 + 300),
          100000
        )
      );

      setSpeed((prev) =>
        Math.min(
          prev + Math.floor(Math.random() * 100 + 50),
          28000
        )
      );

      setFuel((prev) =>
        Math.max(prev - 1, 0)
      );

      setTemperature((prev) =>
        Math.min(
          prev + Math.floor(Math.random() * 8 + 2),
          1200
        )
      );
    }, 1000);

    return () => clearInterval(telemetry);
  }, [launched]);

  // ==========================================
  // MISSION STAGES
  // ==========================================

  useEffect(() => {
    if (!launched) return;

    if (missionTime < 3) {
      setStage("🚀 LIFTOFF");
    } else if (missionTime < 7) {
      setStage("🔥 ASCENT");
    } else if (missionTime < 11) {
      setStage("⚡ MAX-Q");
    } else if (missionTime < 15) {
      setStage("🔗 STAGE SEPARATION");
    } else if (missionTime < 20) {
      setStage("🌌 ORBIT INSERTION");
    } else {
      setStage("🛰️ ORBIT ACHIEVED");

      if (!missionComplete) {
        setMissionComplete(true);
        playSuccessSound();
      }
    }
  }, [missionTime, launched, missionComplete]);

  // ==========================================
  // SCREEN SHAKE
  // ==========================================

  useEffect(() => {
    if (!launched) return;

    const shakeInterval = setInterval(() => {
      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 200);
    }, 800);

    return () => clearInterval(shakeInterval);
  }, [launched]);

  // ==========================================
  // RESET
  // ==========================================

  const resetMission = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    setCount(10);

    setLaunched(false);
    setRocketLaunched(false);

    setAltitude(0);
    setSpeed(0);
    setFuel(100);
    setTemperature(25);

    setStage("READY");
    setMissionTime(0);

    setShake(false);
    setMissionComplete(false);
  };

  // ==========================================
  // MESSAGE
  // ==========================================

  let message = "🛰️ SYSTEM CHECK";
  let messageColor = "#ffffff";

  if (count >= 4 && !launched) {
    message = "🛰️ SYSTEM CHECK";
    messageColor = "#ffffff";
  }

  if (count === 3) {
    message = "🔴 IGNITION SEQUENCE";
    messageColor = "#ff1744";
  }

  if (count === 2) {
    message = "🟡 ENGINES READY";
    messageColor = "#ffd600";
  }

  if (count === 1) {
    message = "🟢 LIFTOFF IMMINENT";
    messageColor = "#00ff66";
  }

  if (count === 0 && launched) {
    message = "🚀 WE HAVE LIFTOFF!";
    messageColor = "#00e5ff";
  }

  if (missionComplete) {
    message = "🏆 MISSION SUCCESS";
    messageColor = "#00ff66";
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        position: "relative",

        fontFamily: "Arial, sans-serif",
        color: "white",

        background: launched
          ? "radial-gradient(circle at 70% 30%, #003d66, #00111f 60%, #000)"
          : count === 3
          ? "linear-gradient(135deg, #300000, #8b0000)"
          : count === 2
          ? "linear-gradient(135deg, #332700, #806000)"
          : count === 1
          ? "linear-gradient(135deg, #003d20, #001a0d)"
          : "linear-gradient(135deg, #05001f, #16005c, #000)",

        transform: shake
          ? "translate(3px, -2px)"
          : "translate(0)",

        transition:
          "background 0.5s, transform 0.1s",
      }}
    >

      {/* ==================================
          STARS
      ================================== */}

      <div
        style={{
          position: "absolute",
          inset: 0,

          fontSize: "20px",
          opacity: 0.6,

          letterSpacing: "30px",
          lineHeight: "45px",

          padding: "20px",

          pointerEvents: "none",
        }}
      >
        ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
        <br />
        ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
        <br />
        ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
        <br />
        ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
        <br />
        ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
      </div>

      {/* ==================================
          MISSION CONTROL
      ================================== */}

      <div
        style={{
          position: "absolute",

          left: "40px",
          top: "50%",

          transform: "translateY(-50%)",

          width: "350px",

          padding: "30px",

          background:
            "rgba(255,255,255,0.1)",

          backdropFilter: "blur(15px)",

          border:
            "1px solid rgba(255,255,255,0.2)",

          borderRadius: "25px",

          boxShadow:
            "0 20px 60px rgba(0,0,0,0.5)",

          zIndex: 20,
        }}
      >

        {/* HEADER */}

        <div
          style={{
            textAlign: "center",

            fontSize: "13px",

            letterSpacing: "4px",

            opacity: 0.8,
          }}
        >
          🚀 MISSION CONTROL
        </div>

        {/* COUNT */}

        <h1
          style={{
            textAlign: "center",

            fontSize: "95px",

            margin: "10px 0",

            color: messageColor,

            textShadow:
              `0 0 30px ${messageColor}`,
          }}
        >
          {count}
        </h1>

        {/* MESSAGE */}

        <h2
          style={{
            textAlign: "center",

            fontSize: "18px",

            color: messageColor,

            minHeight: "25px",
          }}
        >
          {message}
        </h2>

        {/* STATUS */}

        <div
          style={{
            marginTop: "20px",

            padding: "12px",

            borderRadius: "12px",

            background:
              "rgba(0,0,0,0.3)",

            textAlign: "center",

            fontWeight: "bold",

            letterSpacing: "1px",
          }}
        >
          STATUS: {stage}
        </div>

        {/* ==================================
            FUEL
        ================================== */}

        <div style={{ marginTop: "20px" }}>

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",
            }}
          >
            <span>⛽ FUEL</span>

            <span>{fuel}%</span>
          </div>

          <div
            style={{
              width: "100%",

              height: "10px",

              marginTop: "6px",

              background:
                "rgba(255,255,255,0.2)",

              borderRadius: "10px",

              overflow: "hidden",
            }}
          >

            <div
              style={{
                width: `${fuel}%`,

                height: "100%",

                background:
                  fuel < 20
                    ? "#ff1744"
                    : "#00e676",

                borderRadius: "10px",

                transition:
                  "width 0.5s",
              }}
            />

          </div>
        </div>

        {/* ==================================
            TELEMETRY
        ================================== */}

        <div
          style={{
            marginTop: "20px",

            display: "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: "12px",
          }}
        >

          <div>
            📡 Altitude
            <br />

            <strong>
              {altitude.toLocaleString()} m
            </strong>
          </div>

          <div>
            💨 Speed
            <br />

            <strong>
              {speed.toLocaleString()} km/h
            </strong>
          </div>

          <div>
            🌡️ Engine
            <br />

            <strong>
              {temperature}°C
            </strong>
          </div>

          <div>
            ⏱️ Mission
            <br />

            <strong>
              {missionTime}s
            </strong>
          </div>

        </div>

        {/* ==================================
            MANUAL CONTROLS
        ================================== */}

        <div
          style={{
            textAlign: "center",

            marginTop: "25px",
          }}
        >

          <button
            onClick={increment}
            disabled={
              launched ||
              missionComplete
            }
            style={{
              padding: "12px 20px",

              margin: "5px",

              border: "none",

              borderRadius: "10px",

              background: "#00e676",

              color: "white",

              fontWeight: "bold",

              fontSize: "18px",

              cursor:
                launched ||
                missionComplete
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            ➕
          </button>

          <button
            onClick={decrement}
            disabled={
              launched ||
              missionComplete
            }
            style={{
              padding: "12px 20px",

              margin: "5px",

              border: "none",

              borderRadius: "10px",

              background: "#ff1744",

              color: "white",

              fontWeight: "bold",

              fontSize: "18px",

              cursor:
                launched ||
                missionComplete
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            ➖
          </button>

        </div>

        {/* ==================================
            START MISSION
        ================================== */}

        <button
          onClick={startMission}
          disabled={
            launched ||
            missionComplete
          }
          style={{
            width: "100%",

            padding: "15px",

            marginTop: "10px",

            border: "none",

            borderRadius: "12px",

            background:
              launched ||
              missionComplete
                ? "#555"
                : "#2979ff",

            color: "white",

            fontSize: "16px",

            fontWeight: "bold",

            cursor:
              launched ||
              missionComplete
                ? "not-allowed"
                : "pointer",

            boxShadow:
              launched
                ? "none"
                : "0 0 20px rgba(41,121,255,0.5)",
          }}
        >
          🚀 START MISSION
        </button>

        {/* ==================================
            RESET
        ================================== */}

        <button
          onClick={resetMission}
          style={{
            width: "100%",

            padding: "12px",

            marginTop: "10px",

            border:
              "1px solid rgba(255,255,255,0.3)",

            borderRadius: "12px",

            background: "transparent",

            color: "white",

            cursor: "pointer",
          }}
        >
          🔄 RESET MISSION
        </button>

      </div>

      {/* ==================================
          ROCKET
      ================================== */}

      <div
        className={
          rocketLaunched
            ? "rocket rocket-launch"
            : "rocket"
        }
        style={{
          position: "absolute",

          left: "68%",

          bottom: "120px",

          transform:
            "translateX(-50%)",

          fontSize: "100px",

          zIndex: 10,

          filter: rocketLaunched
            ? "drop-shadow(0 0 30px #ff9800)"
            : "none",
        }}
      >
        🚀
      </div>

      {/* ==================================
          FLAMES
      ================================== */}

      {!rocketLaunched &&
        count <= 3 && (
          <div
            style={{
              position: "absolute",

              left: "68%",

              bottom: "70px",

              transform:
                "translateX(-50%)",

              fontSize: "50px",

              animation:
                "flamePulse 0.3s infinite alternate",

              zIndex: 9,
            }}
          >
            🔥🔥🔥
          </div>
        )}

      {rocketLaunched && (
        <div
          className="rocket-flames"
          style={{
            position: "absolute",

            left: "68%",

            bottom: "45px",

            transform:
              "translateX(-50%)",

            fontSize: "55px",

            zIndex: 9,
          }}
        >
          🔥🔥🔥🔥
        </div>
      )}

      {/* ==================================
          LAUNCH PAD
      ================================== */}

      <div
        style={{
          position: "absolute",

          bottom: "55px",

          left: "68%",

          transform:
            "translateX(-50%)",

          width: "220px",

          height: "18px",

          background: "#777",

          borderRadius: "10px",

          boxShadow:
            "0 0 25px rgba(255,255,255,0.4)",

          zIndex: 8,
        }}
      />

      {/* ==================================
          SUCCESS PANEL
      ================================== */}

      {missionComplete && (
        <div
          style={{
            position: "absolute",

            right: "50px",

            top: "50%",

            transform:
              "translateY(-50%)",

            padding: "25px",

            width: "280px",

            textAlign: "center",

            borderRadius: "20px",

            background:
              "rgba(0,255,100,0.12)",

            border:
              "1px solid rgba(0,255,100,0.4)",

            boxShadow:
              "0 0 40px rgba(0,255,100,0.2)",

            zIndex: 20,
          }}
        >

          <div
            style={{
              fontSize: "45px",
            }}
          >
            🏆
          </div>

          <h2>
            MISSION SUCCESS
          </h2>

          <p>
            Rocket successfully
            reached orbit.
          </p>

          <p>
            🛰️ Altitude:
            <br />

            <strong>
              {altitude.toLocaleString()} m
            </strong>
          </p>

          <p>
            💨 Speed:
            <br />

            <strong>
              {speed.toLocaleString()} km/h
            </strong>
          </p>

          <p>
            ⏱️ Mission Time:
            <br />

            <strong>
              {missionTime}s
            </strong>
          </p>

        </div>
      )}

      {/* ==================================
          GROUND
      ================================== */}

      <div
        style={{
          position: "absolute",

          bottom: 0,

          left: 0,

          width: "100%",

          height: "35px",

          background: "#050505",

          zIndex: 15,
        }}
      />

      {/* ==================================
          ANIMATIONS
      ================================== */}

      <style>
        {`

          @keyframes rocketLaunch {

            0% {
              bottom: 120px;

              transform:
                translateX(-50%)
                rotate(0deg);
            }

            15% {
              bottom: 180px;

              transform:
                translateX(-50%)
                rotate(-2deg);
            }

            35% {
              bottom: 350px;

              transform:
                translateX(-50%)
                rotate(2deg);
            }

            60% {
              bottom: 600px;

              transform:
                translateX(-50%)
                rotate(-2deg);
            }

            80% {
              bottom: 850px;

              transform:
                translateX(-50%)
                rotate(1deg);
            }

            100% {
              bottom: 120%;

              transform:
                translateX(-50%)
                rotate(0deg);
            }

          }

          .rocket-launch {

            animation:
              rocketLaunch 8s
              cubic-bezier(.25,.8,.25,1)
              forwards;

          }

          @keyframes flamePulse {

            from {
              transform:
                translateX(-50%)
                scale(1);
            }

            to {
              transform:
                translateX(-50%)
                scale(1.25);
            }

          }

          @keyframes rocketFlame {

            from {
              transform:
                translateX(-50%)
                scale(1);
            }

            to {
              transform:
                translateX(-50%)
                scale(1.25);
            }

          }

          .rocket-flames {

            animation:
              rocketFlame
              0.15s
              infinite alternate;

          }

        `}
      </style>

    </div>
  );
}

export default Counter;