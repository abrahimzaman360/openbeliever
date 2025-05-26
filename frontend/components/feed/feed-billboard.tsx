"use client";
import Slider from "react-slick";
import { motion } from "motion/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useMemo } from "react";

const banners = [
  {
    title: "Ignite Ideas",
    subtitle: "Spark conversations that matter",
    bgColor: "from-purple-600 to-blue-500",
  },
  {
    title: "Connect Minds",
    subtitle: "Bridge gaps, build understanding",
    bgColor: "from-green-400 to-blue-500",
  },
  {
    title: "Shape Tomorrow",
    subtitle: "Your thoughts, our shared future",
    bgColor: "from-pink-500 to-orange-400",
  },
  {
    title: "Elevate Thinking",
    subtitle: "Rise above, see further",
    bgColor: "from-yellow-400 to-red-500",
  },
];

const AnimatedBackground = () => {
  // Generate fixed positions using a seed-based approach
  const particles = useMemo(() => {
    return Array(70)
      .fill(null)
      .map((_, i) => ({
        width: (i % 15) + 5, // Deterministic width between 5-20
        height: (i % 15) + 5, // Deterministic height between 5-20
        left: `${(i * 1.4) % 100}%`, // Spread particles evenly
        top: `${(i * 1.7) % 100}%`, // Spread particles evenly
      }));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.4, 0.3, 0.1],
      }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut",
      }}>
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: particle.width,
            height: particle.height,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 2 + (i % 3), // Deterministic duration
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
};

const Banner = ({
  title,
  subtitle,
  bgColor,
}: {
  title: string;
  subtitle: string;
  bgColor: string;
}) => (
  <div
    className={`w-full h-[30vh] flex flex-col justify-center items-center bg-gradient-to-br ${bgColor} relative overflow-hidden`}>
    <AnimatedBackground />
    <motion.h2
      className="text-white text-5xl md:text-7xl font-bold mb-4 text-center z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      {title}
    </motion.h2>
    <motion.p
      className="text-white text-xl md:text-3xl text-center z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}>
      {subtitle}
    </motion.p>
  </div>
);

export default function HeroBillboard() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="overflow-hidden rounded-lg mb-2 mx-0 md:mx-2">
      <Slider {...settings}>
        {banners.map((banner, index) => (
          <Banner key={index} {...banner} />
        ))}
      </Slider>
    </div>
  );
}
