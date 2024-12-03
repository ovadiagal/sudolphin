'use client';

import { useCallback } from 'react';
import { Particles } from 'react-tsparticles'; // Import Particles component
import { loadLinksPreset } from 'tsparticles-preset-links'; // Import the links preset
import { Engine } from 'tsparticles-engine';

export default function Header() {
  const particlesInit = useCallback(async (main: Engine) => {
    // Load the links preset
    await loadLinksPreset(main);
  }, []);

  const particlesOptions = {
    fullScreen: { enable: false },
    particles: {
      color: { value: '#000000' },
      number: {
        value: 80,
        density: { enable: true, area: 800 },
      },
      links: {
        enable: true,
        distance: 150,
        color: '#000000',
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
      },
      size: {
        value: 3,
        random: true,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'repulse' },
        onClick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: {
        repulse: { distance: 200, duration: 0.4 },
        push: { quantity: 4 },
      },
    },
    retina_detect: true,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col gap-2 items-center relative z-10">
        <h1 className="sr-only">Supabase and Next.js Starter Template</h1>
        <div className="bg-white p-8 rounded-lg border relative z-10 text-center mt-64">
          <p className="text-4xl">Welcome to Sudolphin 🐬</p>
          <p className="text-2xl mt-4">Learn something new 🧠</p>
        </div>
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
