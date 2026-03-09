"use client";

import { useEffect, useState } from "react";

interface SlideshowImageProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function SlideshowImage({ images, alt, className }: SlideshowImageProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % images.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <img
      src={images[index]}
      alt={alt}
      className={`${className ?? "w-full object-cover"} transition-opacity duration-[400ms] ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}
