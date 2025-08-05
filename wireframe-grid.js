// 3D Wireframe Grid Background for the Snake Game
class WireframeGrid {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration options with defaults - optimized for performance
        this.options = {
            gridSize: options.gridSize || 40, // Larger grid size means fewer lines to draw
            gridColor: options.gridColor || 'rgba(0, 255, 128, 0.15)',
            gridLineWidth: options.gridLineWidth || 0.5,
            perspective: options.perspective || 5,
            rotationSpeed: options.rotationSpeed || 0.0003, // Slightly slower rotation
            depth: options.depth || 2, // Reduced depth for fewer lines
            fadeDistance: options.fadeDistance || 0.8,
            pulseRate: options.pulseRate || 0.001,
            pulseMin: options.pulseMin || 0.1,
            pulseMax: options.pulseMax || 0.2,
            hueShift: options.hueShift || false,
            baseHue: options.baseHue || 140, // Base hue for green
            hueRange: options.hueRange || 40,
            hueSpeed: options.hueSpeed || 0.1
        };
        
        // Grid state
        this.angle = 0;
        this.pulse = 0;
        this.pulseDirection = 1;
        this.currentHue = this.options.baseHue;
        this.targetRotationSpeed = this.options.rotationSpeed;
        this.currentRotationSpeed = this.options.rotationSpeed;
        this.boostFactor = 1;
        this.boostDecay = 0.95;
        
        // Initialize
        this.init();
        
        // Bind event methods
        this.onFoodEaten = this.onFoodEaten.bind(this);
        this.onGameOver = this.onGameOver.bind(this);
    }
    
    init() {
        // Calculate grid dimensions based on canvas size
        this.gridWidth = Math.ceil(this.canvas.width / this.options.gridSize) + 2;
        this.gridHeight = Math.ceil(this.canvas.height / this.options.gridSize) + 2;
    }
    
    update() {
        // Smooth rotation speed changes
        this.currentRotationSpeed = this.currentRotationSpeed * 0.95 + this.targetRotationSpeed * 0.05;
        
        // Update rotation angle
        this.angle += this.currentRotationSpeed * this.boostFactor;
        
        // Decay boost factor
        if (this.boostFactor > 1) {
            this.boostFactor *= this.boostDecay;
            if (this.boostFactor < 1.01) this.boostFactor = 1;
        }
        
        // Update pulse effect
        if (this.pulseDirection > 0) {
            this.pulse += this.options.pulseRate * this.boostFactor;
            if (this.pulse >= this.options.pulseMax) {
                this.pulseDirection = -1;
            }
        } else {
            this.pulse -= this.options.pulseRate * this.boostFactor;
            if (this.pulse <= this.options.pulseMin) {
                this.pulseDirection = 1;
            }
        }
        
        // Update hue if enabled
        if (this.options.hueShift) {
            this.currentHue = (this.currentHue + this.options.hueSpeed) % 360;
        }
    }
    
    draw() {
        this.update();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set up transformation
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        
        // Draw the 3D grid
        this.drawGrid();
        
        // Restore context
        this.ctx.restore();
    }
    
    drawGrid() {
        const halfWidth = this.gridWidth / 2;
        const halfHeight = this.gridHeight / 2;
        
        // Calculate sin and cos values for rotation
        const sinAngle = Math.sin(this.angle);
        const cosAngle = Math.cos(this.angle);
        
        // Draw horizontal lines
        for (let z = -this.options.depth; z <= 0; z++) {
            // Calculate opacity based on depth
            const opacity = (1 + z / this.options.depth) * this.options.fadeDistance + this.pulse;
            
            // Use hue shifting if enabled
            let strokeStyle;
            if (this.options.hueShift) {
                // Calculate hue based on depth and current hue
                const hue = (this.currentHue + z * this.options.hueRange / this.options.depth) % 360;
                strokeStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
            } else {
                strokeStyle = this.options.gridColor.replace('0.15', opacity);
            }
            
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = this.options.gridLineWidth * (1 + z / this.options.depth);
            
            for (let y = -halfHeight; y <= halfHeight; y++) {
                this.ctx.beginPath();
                
                for (let x = -halfWidth; x <= halfWidth; x++) {
                    // Apply perspective and rotation
                    const scale = this.options.perspective / (this.options.perspective - z);
                    const rotX = (x * cosAngle - y * sinAngle) * scale * this.options.gridSize;
                    const rotY = (x * sinAngle + y * cosAngle) * scale * this.options.gridSize;
                    
                    if (x === -halfWidth) {
                        this.ctx.moveTo(rotX, rotY);
                    } else {
                        this.ctx.lineTo(rotX, rotY);
                    }
                }
                
                this.ctx.stroke();
            }
            
            // Draw vertical lines
            for (let x = -halfWidth; x <= halfWidth; x++) {
                this.ctx.beginPath();
                
                for (let y = -halfHeight; y <= halfHeight; y++) {
                    // Apply perspective and rotation
                    const scale = this.options.perspective / (this.options.perspective - z);
                    const rotX = (x * cosAngle - y * sinAngle) * scale * this.options.gridSize;
                    const rotY = (x * sinAngle + y * cosAngle) * scale * this.options.gridSize;
                    
                    if (y === -halfHeight) {
                        this.ctx.moveTo(rotX, rotY);
                    } else {
                        this.ctx.lineTo(rotX, rotY);
                    }
                }
                
                this.ctx.stroke();
            }
        }
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.init();
    }
}

// Event handlers for game events
WireframeGrid.prototype.onFoodEaten = function() {
    // Boost grid effects when food is eaten
    this.boostFactor = 2.0;
    
    // Temporarily increase rotation speed
    this.targetRotationSpeed = this.options.rotationSpeed * 2;
    
    // Reset after a short time
    setTimeout(() => {
        this.targetRotationSpeed = this.options.rotationSpeed;
    }, 1000);
};

WireframeGrid.prototype.onGameOver = function() {
    // Dramatic slow down effect
    this.targetRotationSpeed = this.options.rotationSpeed * 0.2;
    
    // Increase pulse for dramatic effect
    this.options.pulseMax = 0.4;
    this.options.pulseMin = 0.2;
    
    // Enable hue shift for game over effect if not already enabled
    this.options.hueShift = true;
    this.options.hueSpeed = 0.5;
    this.options.baseHue = 0; // Start with red
};

// Reset effects
WireframeGrid.prototype.reset = function() {
    this.targetRotationSpeed = this.options.rotationSpeed;
    this.boostFactor = 1;
    this.options.pulseMax = 0.2;
    this.options.pulseMin = 0.1;
    this.options.hueShift = false;
};

// Export the WireframeGrid class
window.WireframeGrid = WireframeGrid;