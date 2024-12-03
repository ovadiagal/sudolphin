'use client';

import { Particles } from 'react-tsparticles'; // Import Particles component
import { loadLinksPreset } from 'tsparticles-preset-links'; // Import the links preset

export default function Header() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Parent div with min-height and flex column layout */}
      <div className="flex flex-1 flex-col gap-2 items-center relative z-10">
        {/* Ensure text is above particles */}
        <h1 className="sr-only">Supabase and Next.js Starter Template</h1>
        <div className="bg-white p-8 rounded-lg border relative z-10 text-center mt-64">
          <p className="text-4xl">Welcome to Sudolphin 🐬</p>
          <p className="text-2xl mt-4">Learn something new 🧠</p>
          {process.env.OPENAI_API_KEY ? null : (
            <p className="text-m mt-4">OpenAI key missing 🚨</p>
          )}
        </div>{' '}
        <Particles
          id="tsparticles"
          init={async main => {
            await loadLinksPreset(main); // Load the links preset
          }}
          options={{
            fullScreen: { enable: false }, // Disable full-screen mode
            particles: {
              color: { value: '#000000' },
              number: {
                value: 80,
                density: {
                  enable: true,
                  area: 800, // Corrected property name
                },
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
                direction: 'none',
                random: false,
                straight: false,
                outModes: { default: 'out' }, // Corrected property
              },
              size: {
                value: 3,
                random: true,
                animation: {
                  enable: false, // Corrected property name
                },
              },
            },
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: 'repulse', // Corrected casing
                },
                onClick: {
                  enable: true,
                  mode: 'push', // Corrected casing
                },
                resize: true,
              },
              modes: {
                grab: {
                  distance: 400,
                  links: {
                    opacity: 0.5,
                  },
                },
                bubble: {
                  distance: 400,
                  size: 40,
                  duration: 2,
                  opacity: 2,
                  speed: 3,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
                push: {
                  quantity: 4, // Corrected property name
                },
                remove: {
                  quantity: 2, // Corrected property name
                },
              },
            },
            retina_detect: true,
          }}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      {/* Gradient div moved outside the content container */}
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
