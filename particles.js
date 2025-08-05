// Particle system for the Snake Game background
class ParticleSystem {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration options with defaults
        this.options = {
            particleCount: options.particleCount || 100,
            particleColor: options.particleColor || '#4eff4e',
            particleSize: options.particleSize || { min: 1, max: 3 },
            particleSpeed: options.particleSpeed || { min: 0.1, max: 0.5 },
            connectionDistance: options.connectionDistance || 100,
            connectionColor: options.connectionColor || 'rgba(78, 255, 78, 0.15)',
            backgroundFadeColor: options.backgroundFadeColor || 'rgba(18, 18, 24, 0.2)',
            mouseInteraction: options.mouseInteraction !== undefined ? options.mouseInteraction : true,
            mouseRadius: options.mouseRadius || 150,
            glowIntensity: options.glowIntensity || 0.5,
            pulseRate: options.pulseRate || 0.02,
            colorCycle: options.colorCycle || false,
            colorCycleSpeed: options.colorCycleSpeed || 0.5,
            baseHue: options.baseHue || 120 // Green base hue
        };
        
        // Particles array
        this.particles = [];
        
        // Mouse position for interaction
        this.mouse = {
            x: undefined,
            y: undefined
        };
        
        // System state
        this.pulse = 0;
        this.pulseDirection = 1;
        this.currentHue = this.options.baseHue;
        this.energyLevel = 1; // For game event effects
        
        // Initialize the system
        this.init();
        
        // Set up mouse move listener if interaction is enabled
        if (this.options.mouseInteraction) {
            window.addEventListener('mousemove', (event) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = event.clientX - rect.left;
                this.mouse.y = event.clientY - rect.top;
            });
        }
        
        // Bind event methods
        this.onFoodEaten = this.onFoodEaten.bind(this);
        this.onGameOver = this.onGameOver.bind(this);
    }
    
    init() {
        // Create particles
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push(new Particle(this));
        }
    }
    
    draw() {
        // Update system state
        this.updateSystemState();
        
        // Clear canvas with a fade effect for trails
        this.ctx.fillStyle = this.options.backgroundFadeColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections between particles
        this.drawConnections();
        
        // Update and draw particles
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
            this.particles[i].draw(this.pulse, this.currentHue);
        }
        
        // Request next frame
        requestAnimationFrame(() => this.draw());
    }
    
    updateSystemState() {
        // Update pulse effect
        if (this.pulseDirection > 0) {
            this.pulse += this.options.pulseRate * this.energyLevel;
            if (this.pulse >= 1) {
                this.pulseDirection = -1;
            }
        } else {
            this.pulse -= this.options.pulseRate * this.energyLevel;
            if (this.pulse <= 0) {
                this.pulseDirection = 1;
            }
        }
        
        // Update color cycle if enabled
        if (this.options.colorCycle) {
            this.currentHue = (this.currentHue + this.options.colorCycleSpeed * this.energyLevel) % 360;
        }
        
        // Gradually return energy level to normal
        if (this.energyLevel > 1) {
            this.energyLevel *= 0.98;
            if (this.energyLevel < 1.05) this.energyLevel = 1;
        }
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.connectionDistance) {
                    // Calculate opacity based on distance and pulse
                    const opacity = (1 - (distance / this.options.connectionDistance)) * (0.15 + this.pulse * 0.1);
                    
                    // Use color cycling if enabled
                    let strokeStyle;
                    if (this.options.colorCycle) {
                        strokeStyle = `hsla(${this.currentHue}, 100%, 50%, ${opacity})`;
                    } else {
                        strokeStyle = this.options.connectionColor.replace('0.15', opacity);
                    }
                    
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = strokeStyle;
                    this.ctx.lineWidth = 0.5 + this.pulse * 0.5; // Pulse affects line width
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Reinitialize particles when canvas is resized
        this.particles = [];
        this.init();
    }
}

class Particle {
    constructor(system) {
        this.system = system;
        this.init();
    }
    
    init() {
        // Random position
        this.x = Math.random() * this.system.canvas.width;
        this.y = Math.random() * this.system.canvas.height;
        
        // Random size
        this.size = Math.random() * 
            (this.system.options.particleSize.max - this.system.options.particleSize.min) + 
            this.system.options.particleSize.min;
        
        // Random velocity
        this.vx = (Math.random() - 0.5) * 
            (this.system.options.particleSpeed.max - this.system.options.particleSpeed.min) + 
            this.system.options.particleSpeed.min;
        this.vy = (Math.random() - 0.5) * 
            (this.system.options.particleSpeed.max - this.system.options.particleSpeed.min) + 
            this.system.options.particleSpeed.min;
        
        // Random opacity and color
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = this.system.options.particleColor;
        
        // Pulse effect
        this.pulse = {
            increasing: Math.random() > 0.5,
            rate: Math.random() * 0.02 + 0.005
        };
    }
    
    update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > this.system.canvas.width) {
            this.vx = -this.vx;
        }
        
        if (this.y < 0 || this.y > this.system.canvas.height) {
            this.vy = -this.vy;
        }
        
        // Pulse opacity
        if (this.pulse.increasing) {
            this.opacity += this.pulse.rate;
            if (this.opacity >= 0.7) {
                this.pulse.increasing = false;
            }
        } else {
            this.opacity -= this.pulse.rate;
            if (this.opacity <= 0.2) {
                this.pulse.increasing = true;
            }
        }
        
        // Mouse interaction
        if (this.system.options.mouseInteraction && 
            this.system.mouse.x !== undefined && 
            this.system.mouse.y !== undefined) {
            
            const dx = this.x - this.system.mouse.x;
            const dy = this.y - this.system.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.system.options.mouseRadius) {
                // Calculate force (inverse of distance)
                const force = (this.system.options.mouseRadius - distance) / this.system.options.mouseRadius;
                
                // Apply force to velocity
                this.vx += dx * force * 0.02;
                this.vy += dy * force * 0.02;
                
                // Limit velocity
                const maxVel = this.system.options.particleSpeed.max * 2;
                this.vx = Math.min(Math.max(this.vx, -maxVel), maxVel);
                this.vy = Math.min(Math.max(this.vy, -maxVel), maxVel);
            }
        }
    }
    
    draw(systemPulse = 0, hue = null) {
        // Apply system pulse to particle size and glow
        const pulseSize = this.size * (1 + systemPulse * 0.3);
        const glowIntensity = 5 + systemPulse * 5 * this.system.options.glowIntensity;
        
        // Use color cycling if enabled
        let fillColor;
        if (hue !== null && this.system.options.colorCycle) {
            // Individual particle hue variation
            const particleHue = (hue + this.size * 30) % 360;
            fillColor = `hsla(${particleHue}, 100%, 50%, ${this.opacity})`;
        } else {
            fillColor = this.color.replace(')', `, ${this.opacity})`);
        }
        
        // Draw particle with enhanced glow effect
        this.system.ctx.beginPath();
        this.system.ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        this.system.ctx.fillStyle = fillColor;
        this.system.ctx.shadowColor = hue !== null && this.system.options.colorCycle ? 
            `hsl(${hue}, 100%, 50%)` : this.color;
        this.system.ctx.shadowBlur = glowIntensity;
        this.system.ctx.fill();
        this.system.ctx.shadowBlur = 0;
    }
}

// Event handlers for game events
ParticleSystem.prototype.onFoodEaten = function() {
    // Boost particle effects when food is eaten
    this.energyLevel = 2.0;
    
    // Temporarily increase connection distance
    const originalDistance = this.options.connectionDistance;
    this.options.connectionDistance *= 1.5;
    
    // Reset after a short time
    setTimeout(() => {
        this.options.connectionDistance = originalDistance;
    }, 1000);
};

ParticleSystem.prototype.onGameOver = function() {
    // Dramatic effect for game over
    this.options.colorCycle = true;
    this.options.colorCycleSpeed = 2;
    this.energyLevel = 0.5; // Slow down
};

// Reset effects
ParticleSystem.prototype.reset = function() {
    this.energyLevel = 1;
    this.options.colorCycle = false;
    this.currentHue = this.options.baseHue;
};

// Export the ParticleSystem class
window.ParticleSystem = ParticleSystem;