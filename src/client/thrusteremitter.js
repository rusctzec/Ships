module.exports = {
  alpha: {
    start: 1,
    end: 0,
  },
  scale: {
    start: 0.01,
    end: 0.25,
    minimumScaleMultiplier: 1,
  },
  color: {
    start: "#fa0a0a",
    end: "#fa9005",
  },
  speed: {
    start: 50,
    end: 75,
    minimumSpeedMultiplier: 0.75,
  },
  acceleration: {
    x: 0,
    y: 0,
  },
  maxSpeed: 0,
  startRotation: {
    min: 0,
    max: 300,
  },
  noRotation: false,
  rotationSpeed: {
    min: 0,
    max: 0,
  },
  lifetime: {
    min: 0.001,
    max: 0.15,
  },
  blendMode: "normal",
  frequency: 0.001,
  emitterLifetime: -1,
  maxParticles: 500,
  pos: {
    x: 0,
    y: 0,
  },
  addAtBack: false,
  spawnType: "burst",
  particlesPerWave: 1,
  particleSpacing: 0,
  angleStart: 0,
};
