import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="bg-white dark:bg-dark-card rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="px-6 py-8 sm:p-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-dark-text-primary mb-2">
                About Snapix
              </h1>
              <div className="w-16 h-1 bg-primary-600 dark:bg-primary-400 mx-auto mb-10"></div>
            </motion.div>

            <motion.div 
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-primary-600 dark:prose-headings:text-primary-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p>
                Welcome to <strong>Snapix</strong> — a wallpaper downloading app born out of a deep passion for photography and visual storytelling. I’m <strong>Kunal</strong>, the creator of Snapix and the photographer behind every image you see on this platform.
              </p>

              <h2 className="mt-8">Our Mission</h2>
              <p>
                Photography has always been more than a hobby for me — it's a way of seeing and sharing the world. Through Snapix, I’ve created a space where I can showcase my original photographs and offer them to you as stunning wallpapers for your phone, tablet, or desktop.
              </p>
              <p>
                Every wallpaper on Snapix is carefully selected from my personal photography collection — captured in natural light, unique locations, and real moments. There are no stock images here. Just authentic, high-resolution visuals that bring beauty, emotion, and perspective to your everyday screens.
              </p>
              <p>
                Whether you’re into breathtaking landscapes, urban vibes, serene nature, or abstract art, you’ll find something here to match your mood and style. I believe a wallpaper isn’t just a background — it’s a reflection of who you are, what inspires you, and what you love.
              </p>

              <p className="mt-8 text-gray-600 dark:text-dark-text-secondary">
                Follow my photography journey on Instagram:{" "}
                <a
                  href="https://instagram.com/frame_o_k2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 underline"
                >
                  @frame_o_k2
                </a>
              </p>
              <p>
              Thank you for being here and supporting my work.
              Download.</p>
              <p><b>Personalize. Get Inspired — with Snapix.</b>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
