/******************************************************************************
 *                                                                            *
 * Hot Spring Rendering Utils - Renders hot springs as healing water         *
 * features with steam and bubble effects. Players standing in hot springs   *
 * receive healing over time.                                                 *
 *                                                                            *
 ******************************************************************************/

import { DetectedHotSpring } from '../hotSpringDetector';

// --- Constants ---

// Steam particle system
interface SteamParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    opacity: number;
    size: number;
    age: number;
    maxAge: number;
}

// Bubble particle system
interface BubbleParticle {
    x: number;
    y: number;
    vy: number;
    size: number;
    opacity: number;
    age: number;
    maxAge: number;
}

// Particle pools for each hot spring (keyed by hot spring ID)
const steamParticles = new Map<string, SteamParticle[]>();
const bubbleParticles = new Map<string, BubbleParticle[]>();
let lastUpdateTime = Date.now();

// Visual constants (AAA quality - Sea of Stars inspired)
export const HOT_SPRING_BEACH_WIDTH = 20; // Width of beach ring around water

// Steam constants - More particles, slower movement for dreamy effect
const STEAM_SPAWN_RATE = 0.35; // Higher spawn rate for better coverage
const STEAM_PARTICLE_SIZE_MIN = 12;
const STEAM_PARTICLE_SIZE_MAX = 28;
const STEAM_PARTICLE_SPEED_X = 0.15; // Slower drift
const STEAM_PARTICLE_SPEED_Y = -0.35; // Slower rise for dreamy effect
const STEAM_PARTICLE_MAX_AGE = 3500; // Longer lifetime for persistent steam
const STEAM_MAX_PARTICLES = 50; // More particles for better coverage

// Bubble constants - Varied sizes and speeds for natural look
const BUBBLE_SPAWN_RATE = 0.2; // Higher spawn rate for better coverage
const BUBBLE_PARTICLE_SIZE_MIN = 2;
const BUBBLE_PARTICLE_SIZE_MAX = 6;
const BUBBLE_PARTICLE_SPEED_Y_MIN = -0.6;
const BUBBLE_PARTICLE_SPEED_Y_MAX = -1.2;
const BUBBLE_PARTICLE_MAX_AGE = 2000; // Longer lifetime
const BUBBLE_MAX_PARTICLES = 40; // More bubbles for better coverage

// --- Particle System Functions ---

/**
 * Initialize particle system for a hot spring
 */
function initializeParticles(hotSpringId: string): void {
    if (!steamParticles.has(hotSpringId)) {
        steamParticles.set(hotSpringId, []);
    }
    if (!bubbleParticles.has(hotSpringId)) {
        bubbleParticles.set(hotSpringId, []);
    }
}

/**
 * Create a new steam particle (AAA quality - Sea of Stars inspired)
 */
function createSteamParticle(centerX: number, centerY: number, radius: number): SteamParticle {
    // Spawn from random position ACROSS THE ENTIRE hot spring area
    // Bias spawn toward bottom half to ensure coverage as particles rise
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius * 0.95; // Use 95% of radius to cover full area
    const x = centerX + Math.cos(angle) * distance;
    // Spawn more toward bottom (add positive Y offset)
    const yBias = radius * 0.2; // Spawn 20% toward bottom
    const y = centerY + Math.sin(angle) * distance + yBias;

    return {
        x,
        y,
        vx: (Math.random() - 0.5) * STEAM_PARTICLE_SPEED_X * 2, // More horizontal drift
        vy: STEAM_PARTICLE_SPEED_Y + (Math.random() - 0.5) * 0.15,
        opacity: 0.4 + Math.random() * 0.3, // Start more transparent
        size: STEAM_PARTICLE_SIZE_MIN + Math.random() * (STEAM_PARTICLE_SIZE_MAX - STEAM_PARTICLE_SIZE_MIN),
        age: 0,
        maxAge: STEAM_PARTICLE_MAX_AGE + Math.random() * 1000
    };
}

/**
 * Create a new bubble particle (AAA quality - varied speeds)
 */
function createBubbleParticle(centerX: number, centerY: number, radius: number): BubbleParticle {
    // Spawn from random position ACROSS THE ENTIRE hot spring area
    // Bias spawn toward bottom half to ensure coverage as bubbles rise
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius * 0.9; // Use 90% of radius to cover full area
    const x = centerX + Math.cos(angle) * distance;
    // Spawn more toward bottom (add positive Y offset)
    const yBias = radius * 0.25; // Spawn 25% toward bottom (bubbles rise faster than steam)
    const y = centerY + Math.sin(angle) * distance + yBias;

    // Varied speeds for natural look
    const speed = BUBBLE_PARTICLE_SPEED_Y_MIN + Math.random() * (BUBBLE_PARTICLE_SPEED_Y_MAX - BUBBLE_PARTICLE_SPEED_Y_MIN);

    return {
        x,
        y,
        vy: speed,
        size: BUBBLE_PARTICLE_SIZE_MIN + Math.random() * (BUBBLE_PARTICLE_SIZE_MAX - BUBBLE_PARTICLE_SIZE_MIN),
        opacity: 0.6 + Math.random() * 0.4,
        age: 0,
        maxAge: BUBBLE_PARTICLE_MAX_AGE + Math.random() * 800
    };
}

/**
 * Update particle systems for a hot spring
 */
function updateParticles(hotSpringId: string, centerX: number, centerY: number, radius: number, deltaTime: number): void {
    initializeParticles(hotSpringId);

    const steam = steamParticles.get(hotSpringId)!;
    const bubbles = bubbleParticles.get(hotSpringId)!;

    let steamParticlesToRecycle = 0;
    let bubbleParticlesToRecycle = 0;

    // Update steam particles (AAA quality - smooth fade and expansion)
    for (let i = steam.length - 1; i >= 0; i--) {
        const particle = steam[i];
        particle.age += deltaTime;
        
        // Check if particle should be recycled (died or drifted too far)
        const distanceFromCenter = Math.sqrt(
            Math.pow(particle.x - centerX, 2) + 
            Math.pow(particle.y - centerY, 2)
        );
        const tooFarAway = distanceFromCenter > radius * 2.5; // Recycle if drifted too far
        
        if (particle.age >= particle.maxAge || tooFarAway) {
            steam.splice(i, 1);
            steamParticlesToRecycle++;
            continue;
        }

        const progress = particle.age / particle.maxAge;
        
        // Movement with slight acceleration upward
        particle.x += particle.vx * (1 + progress * 0.3); // Drift increases over time
        particle.y += particle.vy * (1 - progress * 0.2); // Slow down as it rises
        
        // Smooth fade out with ease-out curve
        const fadeProgress = Math.pow(1 - progress, 2);
        particle.opacity = fadeProgress * 0.5;
        
        // Expand over time for dreamy effect
        particle.size = particle.size * (1 + deltaTime * 0.0003);
    }

    // Update bubble particles (AAA quality - wobble and fade)
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const particle = bubbles[i];
        particle.age += deltaTime;
        
        // Check if particle should be recycled (died or drifted too far)
        const distanceFromCenter = Math.sqrt(
            Math.pow(particle.x - centerX, 2) + 
            Math.pow(particle.y - centerY, 2)
        );
        const tooFarAway = distanceFromCenter > radius * 2; // Recycle if drifted too far
        
        if (particle.age >= particle.maxAge || tooFarAway) {
            bubbles.splice(i, 1);
            bubbleParticlesToRecycle++;
            continue;
        }

        const progress = particle.age / particle.maxAge;
        
        // Add horizontal wobble for natural bubble movement
        const wobble = Math.sin(particle.age * 0.005) * 0.3;
        particle.x += wobble;
        
        // Rise with slight deceleration
        particle.y += particle.vy * (1 - progress * 0.1);
        
        // Smooth fade out
        const fadeProgress = Math.pow(1 - progress, 1.5);
        particle.opacity = fadeProgress * 0.7;
    }

    // Maintain target particle count by spawning to replace recycled particles
    // This ensures consistent particle density
    const steamTarget = Math.min(STEAM_MAX_PARTICLES, steam.length + steamParticlesToRecycle + 1);
    while (steam.length < steamTarget) {
        steam.push(createSteamParticle(centerX, centerY, radius));
    }

    const bubbleTarget = Math.min(BUBBLE_MAX_PARTICLES, bubbles.length + bubbleParticlesToRecycle + 1);
    while (bubbles.length < bubbleTarget) {
        bubbles.push(createBubbleParticle(centerX, centerY, radius));
    }
}

/**
 * Render steam particles (AAA quality - soft gradients)
 */
function renderSteamParticles(ctx: CanvasRenderingContext2D, hotSpringId: string): void {
    const steam = steamParticles.get(hotSpringId);
    if (!steam) return;

    ctx.save();
    
    for (const particle of steam) {
        // Create radial gradient for soft, dreamy steam effect
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
        );
        
        // Soft white center fading to transparent
        gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity * 0.9})`);
        gradient.addColorStop(0.4, `rgba(240, 245, 255, ${particle.opacity * 0.6})`);
        gradient.addColorStop(0.7, `rgba(220, 230, 245, ${particle.opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(200, 220, 240, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

/**
 * Render bubble particles (AAA quality - shiny with highlights)
 */
function renderBubbleParticles(ctx: CanvasRenderingContext2D, hotSpringId: string): void {
    const bubbles = bubbleParticles.get(hotSpringId);
    if (!bubbles) return;

    ctx.save();
    
    for (const particle of bubbles) {
        ctx.globalAlpha = particle.opacity;
        
        // Outer bubble ring (main bubble)
        ctx.strokeStyle = `rgba(180, 220, 255, ${particle.opacity * 0.9})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner shine/highlight (top-left)
        const highlightX = particle.x - particle.size * 0.3;
        const highlightY = particle.y - particle.size * 0.3;
        const highlightSize = particle.size * 0.4;
        
        const highlightGradient = ctx.createRadialGradient(
            highlightX, highlightY, 0,
            highlightX, highlightY, highlightSize
        );
        highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity * 0.8})`);
        highlightGradient.addColorStop(0.6, `rgba(220, 240, 255, ${particle.opacity * 0.4})`);
        highlightGradient.addColorStop(1, 'rgba(200, 230, 255, 0)');
        
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle fill for volume
        const fillGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 0.8
        );
        fillGradient.addColorStop(0, `rgba(200, 230, 255, ${particle.opacity * 0.15})`);
        fillGradient.addColorStop(1, 'rgba(180, 220, 255, 0)');
        
        ctx.fillStyle = fillGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// --- Hot Spring Rendering ---

/**
 * Renders a single hot spring with water, beach, steam, and bubbles
 */
export function renderHotSpring(
    ctx: CanvasRenderingContext2D,
    hotSpring: DetectedHotSpring,
    cameraX: number,
    cameraY: number
): void {
    const now = Date.now();
    const deltaTime = now - lastUpdateTime;
    
    // Update particle systems
    updateParticles(hotSpring.id.toString(), hotSpring.posX, hotSpring.posY, hotSpring.radius, deltaTime);

    // Render ONLY particles - no blue ovals or beach rings
    // The water tiles already exist in the world, we just add effects on top
    
    // 1. Render bubbles (underwater effect)
    renderBubbleParticles(ctx, hotSpring.id.toString());

    // 2. Render steam (above water effect)
    renderSteamParticles(ctx, hotSpring.id.toString());
}

/**
 * Renders all hot springs in the current view
 */
export function renderHotSprings(
    ctx: CanvasRenderingContext2D,
    hotSprings: DetectedHotSpring[],
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number
): void {
    const now = Date.now();
    lastUpdateTime = now;

    // Calculate view bounds with padding for particles
    const padding = 200; // Extra padding for steam particles
    const minX = cameraX - padding;
    const maxX = cameraX + viewWidth + padding;
    const minY = cameraY - padding;
    const maxY = cameraY + viewHeight + padding;

    // Render only hot springs within the view
    for (const hotSpring of hotSprings) {
        // Skip hot springs that are outside the view
        if (hotSpring.posX < minX || hotSpring.posX > maxX || 
            hotSpring.posY < minY || hotSpring.posY > maxY) {
            continue;
        }

        renderHotSpring(ctx, hotSpring, cameraX, cameraY);
    }
}

/**
 * Check if a hot spring is visible on screen
 */
export function isHotSpringVisible(
    hotSpring: DetectedHotSpring,
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number
): boolean {
    const padding = hotSpring.radius + HOT_SPRING_BEACH_WIDTH + 50;
    return hotSpring.posX >= cameraX - padding &&
           hotSpring.posX <= cameraX + viewWidth + padding &&
           hotSpring.posY >= cameraY - padding &&
           hotSpring.posY <= cameraY + viewHeight + padding;
}

/**
 * Clean up particle systems for hot springs that are no longer visible
 */
export function cleanupHotSpringParticles(visibleHotSpringIds: Set<string>): void {
    // Remove particle systems for hot springs that are no longer visible
    for (const id of steamParticles.keys()) {
        if (!visibleHotSpringIds.has(id)) {
            steamParticles.delete(id);
        }
    }
    for (const id of bubbleParticles.keys()) {
        if (!visibleHotSpringIds.has(id)) {
            bubbleParticles.delete(id);
        }
    }
}

