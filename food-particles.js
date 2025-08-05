// Food particle effect system for the Snake Game
class FoodParticleEffect {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration options with defaults
        this.options = {
            particleCount: options.particleCount || 20,
            particleColors: options.particleColors || ['#ff4d4d', '#ff6b6b', '#ff9999', '#ffcccb'],
            particleSize: options.particleSize || { min: 1, max: 4 },
            particleSpeed: options.particleSpeed || { min: 1, max: 3 },
            particleLife: options.particleLife || { min: 15, max: 30 },
            gravity: options.gravity || 0.1,
            fadeRate: options.fadeRate || 0.02
        };
        
        // Active particle effects
        this.activeEffects = [];
    }
    
    // Create a new particle burst effect at the given position
    createBurst(x, y) {
        const particles = [];
        
        for (let i = 0; i < this.options.particleCount; i++) {
            particles.push({
                x: x,
                y: y,
                size: Math.random() * 
                    (this.options.particleSize.max - this.options.particleSize.min) + 
                    this.options.particleSize.min,
                color: this.options.particleColors[Math.floor(Math.random() * this.options.particleColors.length)],
                vx: (Math.random() - 0.5) * 2 * 
                    (this.options.particleSpeed.max - this.options.particleSpeed.min) + 
                    this.options.particleSpeed.min,
                vy: (Math.random() - 0.5) * 2 * 
                    (this.options.particleSpeed.max - this.options.particleSpeed.min) + 
                    this.options.particleSpeed.min,
                life: Math.random() * 
                    (this.options.particleLife.max - this.options.particleLife.min) + 
                    this.options.particleLife.min,
                maxLife: Math.random() * 
                    (this.options.particleLife.max - this.options.particleLife.min) + 
                    this.options.particleLife.min,
                opacity: 1
            });
        }
        
        this.activeEffects.push({
            particles: particles,
            active: true
        });
    }
    
    // Update and draw all active particle effects
    update() {
        for (let e = 0; e < this.activeEffects.length; e++) {
            const effect = this.activeEffects[e];
            
            if (!effect.active) continue;
            
            let allDead = true;
            
            for (let i = 0; i < effect.particles.length; i++) {
                const p = effect.particles[i];
                
                // Update particle position
                p.x += p.vx;
                p.y += p.vy;
                
                // Apply gravity
                p.vy += this.options.gravity;
                
                // Reduce life
                p.life--;
                
                // Fade out as life decreases
                p.opacity = p.life / p.maxLife;
                
                // Check if particle is still alive
                if (p.life > 0) {
                    allDead = false;
                    
                    // Draw particle with glow effect
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`);
                    this.ctx.shadowColor = p.color;
                    this.ctx.shadowBlur = 5;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
            
            // Remove effect if all particles are dead
            if (allDead) {
                effect.active = false;
            }
        }
        
        // Clean up inactive effects
        this.activeEffects = this.activeEffects.filter(effect => effect.active);
    }
}

// Export the FoodParticleEffect class
window.FoodParticleEffect = FoodParticleEffect;