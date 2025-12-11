import React, { useEffect, useRef } from 'react';

// Particle animation configuration
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  distance: number; // Distance from light source
}

interface ParticlesBackgroundProps {
  children: React.ReactNode;
  disableMouseTracking?: boolean;
}

export function ParticlesBackground({ 
  children, 
  disableMouseTracking = false 
}: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Light source position (RIGHT side of the screen)
    const lightSource = {
      x: window.innerWidth * 0.95, // RIGHT corner
      y: window.innerHeight * 0.1  // Top
    };
    
    // Detect if mobile for performance optimization
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Resize canvas to match window size and initialize with proper pixel ratio
    const resize = () => {
      if (canvas) {
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(pixelRatio, pixelRatio);
        
        // Update light source position when window is resized
        lightSource.x = window.innerWidth * 0.95;
        lightSource.y = window.innerHeight * 0.1;
      }
    };
    
    // Calculate distance from light source - removed if not used
    // We'll keep this function definition commented in case it might be needed later
    // const getDistanceFromLight = (x: number, y: number) => {
    //   const dx = x - lightSource.x;
    //   const dy = y - lightSource.y;
    //   return Math.sqrt(dx * dx + dy * dy);
    // };
    
    // Initialize particles with golden hues
    const initParticles = () => {
      const particles: Particle[] = [];
      const particleCount = isMobile
        ? Math.min(60, Math.floor(window.innerWidth * window.innerHeight / 15000))
        : Math.min(150, Math.floor(window.innerWidth * window.innerHeight / 8000));
      
      // Center of light source
      const lightX = window.innerWidth; 
      const lightY = window.innerHeight * 0.5;
      
      for (let i = 0; i < particleCount; i++) {
        // Distribute particles exponentially - concentrated near right edge
        let x, y;
        
        // 70% near light source, 30% elsewhere with bias
        if (Math.random() < 0.7) {
          // Create exponential distribution from light center
          const angle = Math.random() * Math.PI * 2;
          // Very steep exponential curve so particles cluster near edge
          const radius = Math.pow(Math.random(), 3) * (window.innerWidth * 0.5); 
          x = lightX - Math.abs(Math.cos(angle) * radius); // Always to the left of edge
          y = lightY + Math.sin(angle) * radius;
        } else {
          // Random position with bias to right side
          const rightBias = Math.pow(Math.random(), 2);
          x = window.innerWidth * (0.2 + rightBias * 0.8);
          y = Math.random() * window.innerHeight;
        }
        
        // Distance from light source (true distance, not just horizontal)
        const dx = x - lightX;
        const dy = y - lightY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Slower particles, minimal bounce
        const speed = 0.03 + Math.random() * 0.07;
        const angle = Math.random() * Math.PI * 2;
        
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 0.5,
          // Opacity with much more aggressive falloff
          opacity: Math.max(0.05, 1 - Math.pow(distance / (window.innerWidth * 0.3), 0.7)),
          hue: 40 + Math.random() * 20, // Golden hues (40-60)
          distance
        });
      }
      
      particlesRef.current = particles;
    };
    
    // Mouse interaction handlers
    const handleMouseMove = (e: MouseEvent) => {
      if (disableMouseTracking) return;
      
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    
    const handleMouseLeave = () => {
      if (disableMouseTracking) return;
      
      mouseRef.current.active = false;
    };
    
    // Add mouse event listeners only if mouse tracking is enabled
    if (!disableMouseTracking) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Draw a single frame with golden light effect
    const draw = () => {
      if (!canvas || !ctx) return;
      
      // Clear canvas with almost black background
      ctx.fillStyle = 'rgba(3, 3, 8, 1)'; // Very dark background
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      // ========== LIGHTING SYSTEM ==========
      // Create a realistic light source and diffusion that looks like Grok
      
      // Base background - ensure it's completely dark
      const centerX = window.innerWidth;
      const centerY = window.innerHeight * 0.5;
      
      // 1. Intense core light - very thin radial gradient at the right edge
      const coreLight = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, window.innerWidth * 0.15
      );
      
      // Super bright intense core that quickly fades
      coreLight.addColorStop(0, 'rgba(255, 225, 150, 0.9)'); // Very intense center
      coreLight.addColorStop(0.01, 'rgba(255, 220, 140, 0.6)'); // Quick falloff
      coreLight.addColorStop(0.03, 'rgba(245, 204, 127, 0.3)'); // Even more falloff
      coreLight.addColorStop(0.06, 'rgba(245, 204, 127, 0.15)'); 
      coreLight.addColorStop(0.1, 'rgba(245, 204, 127, 0.08)');
      coreLight.addColorStop(0.2, 'rgba(245, 204, 127, 0.03)');
      coreLight.addColorStop(0.4, 'rgba(245, 204, 127, 0.01)');
      coreLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      // Draw the core light - extremely subtle with lots of stops to prevent banding
      ctx.fillStyle = coreLight;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      // 2. Create a very subtle glow - extremely wide with very smooth falloff
      const wideGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, window.innerWidth
      );
      
      // Extremely subtle wide glow
      wideGlow.addColorStop(0, 'rgba(245, 204, 127, 0.1)');
      wideGlow.addColorStop(0.1, 'rgba(245, 204, 127, 0.05)');
      wideGlow.addColorStop(0.2, 'rgba(245, 204, 127, 0.02)');
      wideGlow.addColorStop(0.4, 'rgba(245, 204, 127, 0.005)');
      wideGlow.addColorStop(0.6, 'rgba(5, 5, 10, 0.1)');
      wideGlow.addColorStop(0.8, 'rgba(3, 3, 8, 0.4)');
      wideGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      // Draw the wide glow with very subtle falloff
      ctx.fillStyle = wideGlow;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      // 3. Add an extremely small, very bright point light exactly at the right edge
      // This creates the illusion of a concentrated light source
      const pointLight = ctx.createRadialGradient(
        window.innerWidth, centerY, 0,
        window.innerWidth, centerY, 40
      );
      pointLight.addColorStop(0, 'rgba(255, 235, 180, 0.95)'); // Extremely bright point
      pointLight.addColorStop(0.5, 'rgba(255, 220, 150, 0.3)');
      pointLight.addColorStop(1, 'rgba(255, 220, 150, 0)');
      
      ctx.fillStyle = pointLight;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      // 4. Add extremely subtle noise texture (real light has noise)
      // This helps break up any potential banding in the gradients
      const noiseCount = Math.floor(window.innerWidth * window.innerHeight / 20000);
      
      for (let i = 0; i < noiseCount; i++) {
        // Position noise mostly on the right half with exponential falloff
        const randomX = window.innerWidth - Math.pow(Math.random(), 2) * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;
        
        // Distance from light center affects opacity
        const dx = window.innerWidth - randomX;
        const dy = centerY - randomY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = window.innerWidth * 0.7;
        
        // Extremely subtle noise
        if (dist < maxDist) {
          const opacity = 0.02 * (1 - dist / maxDist);
          const size = Math.random() * 2 + 0.5;
          
          ctx.fillStyle = `rgba(255, 220, 150, ${opacity})`;
          ctx.beginPath();
          ctx.arc(randomX, randomY, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Draw particles and connections
      const particles = particlesRef.current;
      
      // Draw triangles between nearby particles
      for (let i = 0; i < particles.length - 2; i += 3) {
        const p1 = particles[i];
        const p2 = particles[i + 1];
        const p3 = particles[i + 2];
        
        // Skip triangles that are too large or with low opacity
        const side1 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const side2 = Math.hypot(p2.x - p3.x, p2.y - p3.y);
        const side3 = Math.hypot(p3.x - p1.x, p3.y - p1.y);
        
        if (side1 < 150 && side2 < 150 && side3 < 150) {
          // Average opacity based on distance from light
          const avgOpacity = (p1.opacity + p2.opacity + p3.opacity) / 3 * 0.15;
          
          // Create triangle gradient
          const triangleGradient = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
          triangleGradient.addColorStop(0, `hsla(${p1.hue}, 90%, 70%, ${avgOpacity})`);
          triangleGradient.addColorStop(1, `hsla(${p3.hue}, 90%, 50%, ${avgOpacity * 0.5})`);
          
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fillStyle = triangleGradient;
          ctx.fill();
        }
      }
      
      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update position with smooth movement
        p.x += p.vx;
        p.y += p.vy;
        
        // Gentle edge handling - no bouncing, just wrap around
        if (p.x < -50) p.x = window.innerWidth + 50;
        if (p.x > window.innerWidth + 50) p.x = -50;
        if (p.y < -50) p.y = window.innerHeight + 50;
        if (p.y > window.innerHeight + 50) p.y = -50;
        
        // Update distance and opacity based on position
        const dx = p.x - window.innerWidth;
        const dy = p.y - window.innerHeight * 0.5;
        p.distance = Math.sqrt(dx*dx + dy*dy);
        
        // Very steep opacity falloff from source
        const distanceRatio = p.distance / (window.innerWidth * 0.3);
        p.opacity = Math.max(0.02, 1 - Math.pow(distanceRatio, 0.7)) * 0.7;
        
        // Draw particle with glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.opacity})`;
        ctx.fill();
        
        // Only draw glow for particles with good visibility
        if (p.opacity > 0.15) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
          glow.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.opacity * 0.5})`);
          glow.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
        
        // Subtle mouse interaction - gentle attraction (only if mouse tracking is enabled)
        if (!disableMouseTracking && mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 200) {
            const force = 0.0005 * (1 - distance / 200);
            p.vx -= dx * force;
            p.vy -= dy * force;
          }
        }
      }
      
      // Request next frame with throttling for slower devices
      if (isMobile) {
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(draw);
        }, 1000 / 30); // 30fps for mobile
      } else {
        animationRef.current = requestAnimationFrame(draw);
      }
    };
    
    // Setup and start animation
    resize();
    initParticles();
    draw();
    
    // Add event listeners
    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      
      // Only remove mouse event listeners if they were added
      if (!disableMouseTracking) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [disableMouseTracking]); // Add disableMouseTracking to dependencies
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
        style={{ 
          pointerEvents: 'none',
          transform: 'translateZ(0)', // Force GPU acceleration
          position: 'fixed', // FIXED positioning to ensure it stays in place
          zIndex: 0, // Lower z-index to ensure it doesn't capture clicks
        }}
      />
      <div style={{ 
        position: 'relative', 
        zIndex: 5, // Higher z-index for content
        width: '100%',
        height: '100%'
      }}>
        {children}
      </div>
    </div>
  );
} 