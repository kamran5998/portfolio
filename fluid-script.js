// Liquid Fluid Simulation
let canvas, ctx;
let mouse = { x: 0, y: 0 };
let waves = [];

class FluidWave {
    constructor(x, y, radius = 80) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.maxRadius = radius * 4;
        this.speed = 3;
        this.opacity = 0.7;
        this.color = `hsl(${180 + Math.random() * 180}, 80%, 60%)`;
    }
    
    update() {
        this.radius += this.speed;
        this.opacity -= 0.01;
        
        if (this.radius > this.maxRadius) {
            this.opacity -= 0.02;
        }
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Create gradient for liquid effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, `hsla(${180 + Math.random() * 180}, 80%, 60%, 0.4)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    isDead() {
        return this.opacity <= 0;
    }
}

class FluidDrop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = Math.random() * 80 + 40;
        this.speed = Math.random() * 2 + 1;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.005;
        this.color = `hsl(${Math.random() * 360}, 80%, 70%)`;
        this.waveOffset = Math.random() * Math.PI * 2;
    }
    
    update() {
        this.radius += this.speed;
        this.life -= this.decay;
        
        if (this.radius > this.maxRadius) {
            this.life -= 0.02;
        }
    }
    
    draw() {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life * 0.6;
        
        // Create liquid wave effect
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const points = 32;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const waveHeight = Math.sin(angle * 4 + this.waveOffset) * 8;
            const r = this.radius + waveHeight;
            const x = this.x + Math.cos(angle) * r;
            const y = this.y + Math.sin(angle) * r;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
        
        // Add inner glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `hsla(${Math.random() * 360}, 80%, 70%, 0.1)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        this.waveOffset += 0.1;
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

function initFluidSimulation() {
    canvas = document.getElementById('fluid-canvas');
    ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // Create fluid drops on mouse movement
        if (Math.random() < 0.3) {
            waves.push(new FluidDrop(mouse.x, mouse.y));
        }
    });
    
    // Click for bigger waves
    document.addEventListener('click', (e) => {
        waves.push(new FluidWave(e.clientX, e.clientY, 120));
        
        // Add multiple drops around click
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 30 + Math.random() * 20;
            const x = e.clientX + Math.cos(angle) * distance;
            const y = e.clientY + Math.sin(angle) * distance;
            waves.push(new FluidDrop(x, y));
        }
    });
    
    function animate() {
        // Keep dark background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw waves
        for (let i = waves.length - 1; i >= 0; i--) {
            waves[i].update();
            waves[i].draw();
            
            if (waves[i].isDead()) {
                waves.splice(i, 1);
            }
        }
        
        // Draw flowing connections between nearby waves
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < waves.length; i++) {
            for (let j = i + 1; j < waves.length; j++) {
                const dx = waves[i].x - waves[j].x;
                const dy = waves[i].y - waves[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150 && waves[i].opacity > 0.2 && waves[j].opacity > 0.2) {
                    ctx.save();
                    ctx.globalAlpha = (waves[i].opacity + waves[j].opacity) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(waves[i].x, waves[i].y);
                    
                    // Create curved connection for fluid effect
                    const midX = (waves[i].x + waves[j].x) / 2;
                    const midY = (waves[i].y + waves[j].y) / 2;
                    const offsetX = (Math.random() - 0.5) * 50;
                    const offsetY = (Math.random() - 0.5) * 50;
                    
                    ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, waves[j].x, waves[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Initialize when page loads
window.addEventListener('load', () => {
    initFluidSimulation();
});