import { VideoGenParams } from '@/types';

export async function renderVideoSynthesis(
  params: VideoGenParams,
  onProgress: (progress: number, stage: string) => void
): Promise<{ videoUrl: string; duration: number; blob: Blob }> {
  return new Promise(async (resolve, reject) => {
    try {
      const width = 1280;
      const height = 720;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      const totalDuration = Math.min(Math.max(params.durationSeconds || 5, 3), 10);
      const fps = params.fps || 30;
      const totalFrames = Math.floor(totalDuration * fps);

      onProgress(5, 'Initializing Neural Video Synthesis Pipeline...');

      // Prepare audio track if requested
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      
      if (params.audioTrack !== 'none') {
        synthesizeAudioTrack(audioCtx, dest, params.audioTrack, totalDuration);
      }

      // Prepare media stream & recorder
      const canvasStream = canvas.captureStream(fps);
      if (params.audioTrack !== 'none' && dest.stream.getAudioTracks().length > 0) {
        canvasStream.addTrack(dest.stream.getAudioTracks()[0]);
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        audioCtx.close();
        onProgress(100, 'Video Render Complete!');
        resolve({ videoUrl, duration: totalDuration, blob: videoBlob });
      };

      recorder.start();

      // Particle system & visual generative parameters
      const particles: Array<{
        x: number;
        y: number;
        z: number;
        size: number;
        speed: number;
        color: string;
        alpha: number;
      }> = [];

      const colorPalette = getColorPaletteForStyle(params.style);

      for (let i = 0; i < 200; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width * 1.5,
          y: (Math.random() - 0.5) * height * 1.5,
          z: Math.random() * 800 + 50,
          size: Math.random() * 4 + 1.5,
          speed: Math.random() * 2 + 1,
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          alpha: Math.random() * 0.7 + 0.3,
        });
      }

      // Generate background image if provided or synthesize dynamic gradient
      let bgImage: HTMLImageElement | null = null;
      if (params.initialImageUrl) {
        bgImage = new Image();
        bgImage.crossOrigin = 'anonymous';
        bgImage.src = params.initialImageUrl;
        await new Promise((res) => {
          if (!bgImage) return res(null);
          bgImage.onload = () => res(null);
          bgImage.onerror = () => res(null);
        });
      }

      let frame = 0;

      function renderFrame() {
        const t = frame / totalFrames; // 0.0 to 1.0
        const progressPercent = Math.floor(10 + t * 85);
        onProgress(progressPercent, `Synthesizing Frame ${frame + 1}/${totalFrames} (${(t * totalDuration).toFixed(1)}s)`);

        ctx!.save();

        // 1. Draw dynamic background
        const grad = ctx!.createLinearGradient(
          0,
          0,
          width * Math.cos(t * Math.PI * 2),
          height * Math.sin(t * Math.PI * 2)
        );
        grad.addColorStop(0, '#060814');
        grad.addColorStop(0.5, '#0d1326');
        grad.addColorStop(1, '#05070f');
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, width, height);

        // 2. Camera Choreography Motion
        applyCameraMotion(ctx!, params.motion, t, width, height);

        // 3. Draw initial image background if available with camera transform
        if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
          ctx!.globalAlpha = 0.85;
          const scale = 1 + t * 0.25;
          const imgW = width * scale;
          const imgH = height * scale;
          ctx!.drawImage(bgImage, (width - imgW) / 2, (height - imgH) / 2, imgW, imgH);
          ctx!.globalAlpha = 1.0;
        }

        // 4. Render 3D Perspective Particle Mesh
        ctx!.save();
        ctx!.translate(width / 2, height / 2);

        // Draw glowing wireframe grid horizon
        ctx!.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx!.lineWidth = 1;
        const horizonY = 80;
        for (let x = -width; x <= width; x += 60) {
          ctx!.beginPath();
          ctx!.moveTo(x, horizonY);
          ctx!.lineTo(x * 3, height);
          ctx!.stroke();
        }
        for (let y = horizonY; y <= height; y += 25) {
          ctx!.beginPath();
          ctx!.moveTo(-width, y);
          ctx!.lineTo(width, y);
          ctx!.stroke();
        }

        // Draw animated particles
        for (const p of particles) {
          const depth = (p.z - (t * totalDuration * 80 * p.speed)) % 800;
          const pz = depth <= 0 ? depth + 800 : depth;
          const k = 400 / pz;
          const px = p.x * k;
          const py = p.y * k + Math.sin(t * Math.PI * 4 + p.x) * 15;
          const pSize = Math.max(1, p.size * k);

          ctx!.beginPath();
          ctx!.arc(px, py, pSize, 0, Math.PI * 2);
          ctx!.fillStyle = p.color;
          ctx!.shadowColor = p.color;
          ctx!.shadowBlur = 8;
          ctx!.globalAlpha = p.alpha * Math.min(1, (800 - pz) / 400);
          ctx!.fill();
        }
        ctx!.restore();

        // 5. Cinematic Vignette & Cyber HUD Overlay
        ctx!.restore(); // restore from camera transform

        drawCinematicOverlay(ctx!, width, height, t, totalDuration, params);

        frame++;

        if (frame < totalFrames) {
          setTimeout(renderFrame, 1000 / fps);
        } else {
          recorder.stop();
        }
      }

      renderFrame();
    } catch (err: any) {
      reject(err);
    }
  });
}

function applyCameraMotion(
  ctx: CanvasRenderingContext2D,
  motion: VideoGenParams['motion'],
  t: number,
  width: number,
  height: number
) {
  const cx = width / 2;
  const cy = height / 2;

  switch (motion) {
    case 'cinematic-orbit': {
      const angle = (t - 0.5) * 0.15;
      const zoom = 1.0 + Math.sin(t * Math.PI) * 0.12;
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'drone-flythrough': {
      const zoom = 1.0 + t * 0.35;
      const panY = Math.sin(t * Math.PI * 2) * 20;
      ctx.translate(cx, cy + panY);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'zoom-in-dramatic': {
      const zoom = 1.0 + Math.pow(t, 1.8) * 0.45;
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'pan-horizontal': {
      const panX = (t - 0.5) * 120;
      ctx.translate(panX, 0);
      break;
    }
    case 'tilt-upward': {
      const panY = (0.5 - t) * 100;
      ctx.translate(0, panY);
      break;
    }
    case 'glitch-hyperlapse': {
      const shakeX = (Math.random() - 0.5) * 8 * Math.sin(t * 20);
      const shakeY = (Math.random() - 0.5) * 8 * Math.cos(t * 20);
      const zoom = 1.05 + Math.sin(t * Math.PI * 8) * 0.05;
      ctx.translate(cx + shakeX, cy + shakeY);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);
      break;
    }
    default: {
      const zoom = 1.0 + t * 0.15;
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);
      break;
    }
  }
}

function drawCinematicOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  totalDuration: number,
  params: VideoGenParams
) {
  // Vignette
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.3,
    width / 2,
    height / 2,
    width * 0.75
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(3, 5, 12, 0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // Cinematic Letterbox Bars
  const barHeight = 40;
  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, width, barHeight);
  ctx.fillRect(0, height - barHeight, width, barHeight);

  // Top Cyber HUD
  ctx.font = '12px "Space Grotesk", monospace';
  ctx.fillStyle = '#00F0FF';
  ctx.fillText(`AETHERIS // 10S MOTION SYNTHESIS`, 24, 25);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(`MOTION: ${params.motion.toUpperCase()} | TIME: ${(t * totalDuration).toFixed(2)}s / ${totalDuration.toFixed(1)}s`, width - 360, 25);

  // Bottom prompt summary
  ctx.font = '13px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  const promptText = params.prompt.length > 80 ? params.prompt.slice(0, 80) + '...' : params.prompt;
  ctx.fillText(`PROMPT: "${promptText}"`, 24, height - 15);

  // Creator Attribution watermark
  ctx.font = '11px monospace';
  ctx.fillStyle = 'rgba(0, 255, 163, 0.75)';
  ctx.fillText(`AI ARCHITECT: MD. RIAZUL ISLAM RIFAT`, width - 260, height - 15);

  // Glowing timeline progress line
  ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.fillRect(0, height - barHeight - 3, width, 3);
  ctx.fillStyle = '#00FFA3';
  ctx.shadowColor = '#00FFA3';
  ctx.shadowBlur = 6;
  ctx.fillRect(0, height - barHeight - 3, width * t, 3);
  ctx.shadowBlur = 0;
}

function getColorPaletteForStyle(style: string): string[] {
  switch (style?.toLowerCase()) {
    case 'cyberpunk':
      return ['#00F0FF', '#FF007A', '#00FFA3', '#FFE600', '#9D00FF'];
    case 'anime':
      return ['#FF9EAA', '#FFD0D0', '#3AA6B9', '#C1ECE4', '#FFFFFF'];
    case 'cinematic':
      return ['#F5D061', '#E78838', '#1E40AF', '#38BDF8', '#F8FAFC'];
    case 'vaporwave':
      return ['#FF71CE', '#01CDFE', '#05FFA1', '#B967FF', '#FFFB96'];
    default:
      return ['#00F0FF', '#8A2BE2', '#00FFA3', '#3B82F6', '#EC4899'];
  }
}

function synthesizeAudioTrack(
  ctx: AudioContext,
  dest: MediaStreamAudioDestinationNode,
  trackType: string,
  duration: number
) {
  try {
    const baseFreq = trackType === 'cyber-ambient' ? 110 : trackType === 'synthwave-pulse' ? 146.8 : 82.4;
    
    // Synth oscillator 1 (Bass Drone)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + duration);
    
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.01, ctx.currentTime + duration);

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + duration / 2);

    osc1.connect(filter);
    filter.connect(gain1);
    gain1.connect(dest);

    osc1.start();
    osc1.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio synthesis fallback error', e);
  }
}
