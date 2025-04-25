'use client'

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Environment, Float, Sparkles, Trail, PointMaterial, useTexture, RoundedBox } from '@react-three/drei'
import { useRef, useState, useMemo, useEffect, Suspense } from 'react'
import { MathUtils, Vector3, Color, AdditiveBlending, Euler } from 'three'
import { EffectComposer, Bloom, Noise, Vignette, DepthOfField } from '@react-three/postprocessing'

// Black hole with accretion disk
function BlackHole({ position = [0, 0, -15] }) {
  const blackHoleRef = useRef()
  const diskRef = useRef()
  const glowRef = useRef()
  const [hover, setHover] = useState(false)
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Slow rotation for the accretion disk
    diskRef.current.rotation.z += 0.001
    
    // Pulsating glow effect
    const pulseScale = 1 + Math.sin(time) * 0.05
    glowRef.current.scale.set(pulseScale * 3, pulseScale * 3, pulseScale * 3)
    
    // Subtle movement of the black hole
    blackHoleRef.current.position.y = Math.sin(time * 0.2) * 0.2
  })
  
  return (
    <group position={position}>
      {/* Black hole center */}
      <mesh 
        ref={blackHoleRef}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial 
          color={hover ? "#5522aa" : "#220044"} 
          transparent
          opacity={0.3}
          blending={AdditiveBlending}
        />
      </mesh>
      
      {/* Accretion disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 1, 2, 128]} />
        <meshStandardMaterial
          color="#ff3300"
          emissive="#ff7700"
          emissiveIntensity={2}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Particle effects around black hole */}
      <Sparkles 
        count={200}
        scale={10}
        size={1}
        speed={0.3}
        color={hover ? "#ff5500" : "#ff2200"}
      />
    </group>
  )
}

// Interactive planet system with moons
function PlanetSystem({ position = [8, 0, 0] }) {
  const planetRef = useRef()
  const ringRef = useRef()
  const moonOrbitRef = useRef()
  const moonRefs = useRef([])
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState(false)
  
  // Moon data
  const moons = useMemo(() => [
    { radius: 0.4, distance: 3, speed: 0.5, color: "#8888ff" },
    { radius: 0.2, distance: 4, speed: 0.3, color: "#aaaaff" },
    { radius: 0.3, distance: 5, speed: 0.2, color: "#ddddff" }
  ], [])
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Planet rotation
    planetRef.current.rotation.y += 0.005
    
    // Ring rotation
    ringRef.current.rotation.z += 0.002
    
    // Planet wobble when selected
    if (selected) {
      planetRef.current.position.y = Math.sin(time * 3) * 0.1
    }
    
    // Moon orbit rotation
    moonOrbitRef.current.rotation.y += 0.005
    
    // Individual moon rotations
    moonRefs.current.forEach((moon, i) => {
      if (moon) {
        moon.rotation.y += 0.01 * (i + 1)
      }
    })
  })
  
  return (
    <group position={position}>
      {/* Planet */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh 
          ref={planetRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => setSelected(!selected)}
          scale={selected ? 1.2 : 1}
        >
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshStandardMaterial
            color={hovered ? "#4488cc" : "#2266aa"}
            metalness={0.4}
            roughness={0.7}
            emissive={selected ? "#4488cc" : "#000000"}
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
      
      {/* Planet rings */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.5, 0.3, 2, 128]} />
        <meshStandardMaterial
          color="#88aacc"
          metalness={0.5}
          roughness={0.6}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Moons system */}
      <group ref={moonOrbitRef}>
        {moons.map((moon, i) => (
          <group key={i} rotation={[0, (Math.PI * 2 / moons.length) * i, 0]}>
            <mesh 
              ref={(el) => (moonRefs.current[i] = el)}
              position={[moon.distance, 0, 0]}
            >
              <sphereGeometry args={[moon.radius, 32, 32]} />
              <meshStandardMaterial 
                color={moon.color}
                roughness={0.6}
              />
            </mesh>
            
            {/* Trails for moons */}
            <Trail 
              width={0.1} 
              color={new Color(moon.color)} 
              length={5} 
              decay={1} 
              attenuation={(width) => width}
            >
              <mesh position={[moon.distance, 0, 0]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color={moon.color} />
              </mesh>
            </Trail>
          </group>
        ))}
      </group>
      
      {/* Atmosphere effect */}
      {selected && (
        <mesh scale={1.7}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial 
            color="#88ccff" 
            transparent 
            opacity={0.1} 
            blending={AdditiveBlending} 
          />
        </mesh>
      )}
    </group>
  )
}

// Interactive wormhole
function Wormhole({ position = [-12, 2, -10] }) {
  const wormholeRef = useRef()
  const [active, setActive] = useState(false)
  const ringsRefs = useRef([])
  
  // Generate rings data
  const rings = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      radius: i * 0.2 + 0.5,
      speed: 0.02 / (i + 1),
      initialRotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ]
    })),
  [])
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Animate each ring
    ringsRefs.current.forEach((ring, i) => {
      if (!ring) return
      
      // Create a funnel effect
      const progress = ((time * rings[i].speed) % 1)
      const z = active ? -10 * progress : 0
      ring.position.z = z
      
      // Scale down as they go deeper
      const scale = active ? 1 - progress * 0.5 : 1
      ring.scale.set(scale, scale, 1)
      
      // Rotate rings
      ring.rotation.x += 0.001
      ring.rotation.z += 0.002
      
      // Opacity based on depth
      if (ring.material) {
        ring.material.opacity = active ? 0.7 - progress * 0.5 : 0.5
      }
    })
    
    // Rotate the entire wormhole
    wormholeRef.current.rotation.z += 0.001
  })
  
  return (
    <group 
      ref={wormholeRef} 
      position={position}
      onClick={() => setActive(!active)}
    >
      {/* Wormhole rings */}
      {rings.map((ring, i) => (
        <mesh 
          key={i}
          ref={(el) => (ringsRefs.current[i] = el)}
          rotation={new Euler(...ring.initialRotation)}
        >
          <torusGeometry args={[ring.radius, 0.05, 8, 64]} />
          <meshBasicMaterial 
            color={active ? "#44aaff" : "#2277dd"} 
            transparent
            opacity={0.5}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
      
      {/* Center glow */}
      <pointLight color="#88ccff" intensity={active ? 2 : 0.5} distance={10} />
      <Sparkles 
        count={100}
        scale={active ? 3 : 2}
        size={1}
        speed={active ? 1 : 0.2}
        color="#aaddff"
      />
      
      {/* Instruction text */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {active ? "WORMHOLE ACTIVE" : "CLICK TO ACTIVATE"}
      </Text>
    </group>
  )
}

// Galactic Nebula with particles
function Nebula({ position = [0, -10, -20], color = "#ff44aa" }) {
  const particlesRef = useRef()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Rotate the entire nebula
    particlesRef.current.rotation.y = time * 0.05
    
    // Subtle "breathing" effect
    const scale = 1 + Math.sin(time * 0.2) * 0.1
    particlesRef.current.scale.set(scale, scale, scale)
  })
  
  return (
    <group position={position}>
      <mesh ref={particlesRef}>
        <Sparkles
          count={300}
          scale={20}
          size={2}
          speed={0.1}
          opacity={0.5}
          color={color}
        />
      </mesh>
      
      {/* Central glow */}
      <pointLight color={color} intensity={2} distance={30} />
    </group>
  )
}

// Cosmic dashboard panel
function ControlPanel() {
  const { camera } = useThree()
  const panelRef = useRef()
  const [expanded, setExpanded] = useState(false)
  
  useFrame(() => {
    if (!panelRef.current) return
    
    // Position the panel relative to the camera
    const distance = 2
    panelRef.current.position.set(0, -0.8, -distance)
    panelRef.current.lookAt(camera.position)
    
    // Scale animation when expanded
    const targetScale = expanded ? 1 : 0.5
    panelRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.1)
  })
  
  return (
    <group ref={panelRef}>
      <RoundedBox 
        args={[2, 0.8, 0.1]} 
        radius={0.1}
        onClick={() => setExpanded(!expanded)}
        onPointerOver={(e) => (e.stopPropagation(), document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <meshStandardMaterial 
          color="#111122" 
          metalness={0.8}
          roughness={0.2}
          emissive="#223366"
          emissiveIntensity={0.2}
        />
      </RoundedBox>
      
      <Text
        position={[0, 0.2, 0.06]}
        fontSize={0.1}
        color="#44aaff"
        anchorX="center"
        anchorY="middle"
      >
        COSMIC NAVIGATOR
      </Text>
      
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.07}
        color="#88ddff"
        anchorX="center"
        anchorY="middle"
      >
        {expanded ? "SYSTEMS ONLINE" : "CLICK TO EXPAND"}
      </Text>
      
      {expanded && (
        <>
          <RoundedBox 
            position={[-0.7, -0.2, 0.06]} 
            args={[0.4, 0.2, 0.05]} 
            radius={0.05}
          >
            <meshStandardMaterial color="#335577" emissive="#2244aa" />
          </RoundedBox>
          
          <RoundedBox 
            position={[0, -0.2, 0.06]} 
            args={[0.4, 0.2, 0.05]} 
            radius={0.05}
          >
            <meshStandardMaterial color="#553355" emissive="#772277" />
          </RoundedBox>
          
          <RoundedBox 
            position={[0.7, -0.2, 0.06]} 
            args={[0.4, 0.2, 0.05]} 
            radius={0.05}
          >
            <meshStandardMaterial color="#553322" emissive="#aa5522" />
          </RoundedBox>
        </>
      )}
    </group>
  )
}

// Animated asteroid field
function AsteroidField({ count = 50, radius = 20 }) {
  const asteroidsRef = useRef([])
  
  // Generate asteroid data
  const asteroidData = useMemo(() => 
    Array.from({ length: count }, () => ({
      position: [
        MathUtils.randFloatSpread(radius * 2),
        MathUtils.randFloatSpread(radius * 2),
        MathUtils.randFloatSpread(radius * 2)
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      size: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.01 + 0.002,
      rotationSpeed: Math.random() * 0.01,
      orbit: Math.random() * Math.PI * 2
    })),
  [count, radius])
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    asteroidsRef.current.forEach((asteroid, i) => {
      if (!asteroid) return
      
      const data = asteroidData[i]
      
      // Update orbit position
      const orbitRadius = Math.sqrt(data.position[0]**2 + data.position[2]**2)
      asteroid.position.x = Math.sin(time * data.speed + data.orbit) * orbitRadius
      asteroid.position.z = Math.cos(time * data.speed + data.orbit) * orbitRadius
      
      // Rotate asteroid
      asteroid.rotation.x += data.rotationSpeed
      asteroid.rotation.y += data.rotationSpeed * 0.8
      asteroid.rotation.z += data.rotationSpeed * 0.6
    })
  })
  
  return (
    <group>
      {asteroidData.map((data, i) => (
        <mesh
          key={i}
          ref={(el) => (asteroidsRef.current[i] = el)}
          position={data.position}
          rotation={data.rotation}
        >
          <icosahedronGeometry args={[data.size, 0]} />
          <meshStandardMaterial 
            color="#999999" 
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Pulsating star
function PulsatingStar({ position = [10, 8, -15], color = "#ffff00" }) {
  const starRef = useRef()
  const glowRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Pulsation
    const pulseSpeed = hovered ? 5 : 2
    const pulseScale = 1 + Math.sin(time * pulseSpeed) * 0.2
    starRef.current.scale.set(pulseScale, pulseScale, pulseScale)
    
    // Glow effect
    const glowScale = pulseScale * 2
    glowRef.current.scale.set(glowScale, glowScale, glowScale)
  })
  
  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Star core */}
      <mesh ref={starRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2}
          blending={AdditiveBlending}
        />
      </mesh>
      
      {/* Light source */}
      <pointLight color={color} intensity={2} distance={20} />
      
      {/* Solar flares using sparkles */}
      <Sparkles 
        count={100}
        scale={5}
        size={1}
        speed={0.5}
        color={color}
      />
    </group>
  )
}

// Main scene component
export default function Scene() {
  const [starfieldSpeed, setStarfieldSpeed] = useState(0.5)
  
  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 2, 15], fov: 60 }}>
        <Suspense fallback={null}>
          {/* Environment setup */}
          <color attach="background" args={['#000']} />
          <fog attach="fog" args={['#000', 15, 50]} />
          <ambientLight intensity={0.1} />
          
          {/* Dynamic starfield */}
          <Stars 
            radius={100} 
            depth={50} 
            count={10000} 
            factor={5} 
            saturation={0.5} 
            fade={true} 
            speed={starfieldSpeed} 
          />
          
          {/* Scene elements */}
          <BlackHole />
          <PlanetSystem />
          <Wormhole />
          <Nebula position={[-20, 5, -30]} color="#ff44aa" />
          <Nebula position={[25, -10, -40]} color="#44aaff" />
          <PulsatingStar position={[10, 8, -15]} color="#ffdd00" />
          <PulsatingStar position={[-15, -7, -20]} color="#ffaa44" />
          <AsteroidField count={100} radius={30} />
          
          {/* HUD elements */}
          <ControlPanel />
          
          {/* Visual effects with simpler implementation */}
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={1.5}
            />
            <Noise opacity={0.02} />
            <Vignette darkness={0.5} offset={0.1} />
            <DepthOfField 
              focusDistance={0.01}
              focalLength={0.2}
              bokehScale={3}
            />
          </EffectComposer>
          
          {/* Controls */}
          <OrbitControls 
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={50}
            rotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
      
      {/* Control panel overlay */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '20px', 
        background: 'rgba(0,10,30,0.7)', 
        padding: '10px', 
        borderRadius: '10px',
        color: '#8af',
        fontFamily: 'monospace'
      }}>
        <div>⭐ STARFIELD SPEED</div>
        <input 
          type="range" 
          min={0.1} 
          max={2} 
          step={0.1} 
          value={starfieldSpeed} 
          onChange={(e) => setStarfieldSpeed(parseFloat(e.target.value))}
          style={{ width: '150px' }}
        />
      </div>
      
      {/* Info overlay */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        background: 'rgba(0,10,30,0.7)', 
        padding: '10px', 
        borderRadius: '10px',
        color: '#8af',
        fontFamily: 'monospace'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '5px' }}>COSMIC EXPLORER v2.0</div>
        <div style={{ fontSize: '12px' }}>• Click objects to interact</div>
        <div style={{ fontSize: '12px' }}>• Drag to rotate view</div>
        <div style={{ fontSize: '12px' }}>• Scroll to zoom</div>
      </div>
    </div>
  )
}