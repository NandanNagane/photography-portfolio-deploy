import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-tight">
            About <span className="font-semibold italic">Me</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light">
            Photographer & Visual Storyteller
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/profile.png"
                  alt="Shri - Photographer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl -z-10" />
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
                Hi, I'm <span className="font-semibold">Shri</span>
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  I love capturing candid moments, vibrant landscapes, and
                  memorable events. My passion for photography is matched only
                  by my desire to create unique visual stories for every client.
                </p>
                <p>
                  With over a decade of experience behind the lens, I've had the
                  privilege of documenting countless special moments, from
                  intimate portraits to grand celebrations. My approach combines
                  technical expertise with an artistic eye, ensuring every shot
                  tells its own compelling story.
                </p>
                <p>
                  Whether it's the subtle play of light in a landscape, the raw
                  emotion in a portrait, or the energy of a live event, I strive
                  to capture authenticity in every frame. Photography isn't just
                  my profession—it's my way of seeing and celebrating the world.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-semibold text-gray-900">10+</div>
                  <div className="text-sm text-gray-600 mt-1">Years Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600 mt-1">Projects</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600 mt-1">Satisfaction</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white"
          >
            <Quote className="w-12 h-12 text-white/20 mb-6" />
            <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-6 italic">
              "Shri's photos truly capture the essence of every subject. The
              attention to detail and ability to make you feel comfortable in
              front of the camera is unmatched. Every shot feels like a work of
              art."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20" />
              <div>
                <div className="font-medium">Sarah Johnson</div>
                <div className="text-sm text-white/70">Wedding Client</div>
              </div>
            </div>
          </motion.div>

          {/* Services/Specialties */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <h3 className="text-3xl font-light text-gray-900 mb-8 text-center tracking-tight">
              What I <span className="font-semibold italic">Specialize In</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Portrait Photography",
                  description:
                    "Capturing the unique personality and character of each individual",
                },
                {
                  title: "Nature & Landscape",
                  description:
                    "Showcasing the beauty and grandeur of the natural world",
                },
                {
                  title: "Event Photography",
                  description:
                    "Documenting special moments and celebrations with artistry",
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}