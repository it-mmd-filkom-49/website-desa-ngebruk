import { useEffect, useState } from "react";
import { useWeather } from "@/hooks/useWeather";
import { useActiveGalleryImages } from "@/hooks/useGallery";
import WeatherOverlay from "./WeatherOverlay";
import SlideIndicator from "./SlideIndicator";
import HeroContent from "./HeroContent";
import ImageSlider from "./ImageSlider";

const useWeatherOverlayClass = () => {
  const getWeatherOverlayClass = (weatherCode: string, description: string): string => {
    if (!weatherCode || !description) return "";

    const codeNum = parseInt(weatherCode);
    const descLower = description.toLowerCase();

    if (codeNum >= 200 && codeNum <= 299) return "weather-overlay-stormy";
    if (descLower.includes("thunderstorm") || descLower.includes("lightning")) return "weather-overlay-stormy";

    if (codeNum >= 500 && codeNum <= 504) return "weather-overlay-heavy-rain";
    if (codeNum >= 300 && codeNum <= 399) return "weather-overlay-drizzle";
    if (codeNum >= 520 && codeNum <= 531) return "weather-overlay-rainy";
    if (descLower.includes("heavy rain") || descLower.includes("torrential")) return "weather-overlay-heavy-rain";
    if (descLower.includes("light rain") || descLower.includes("drizzle")) return "weather-overlay-drizzle";
    if (descLower.includes("moderate rain") || descLower.includes("rain")) return "weather-overlay-rainy";

    if (codeNum >= 600 && codeNum <= 699) return "weather-overlay-snowy";
    if (descLower.includes("snow") || descLower.includes("blizzard")) return "weather-overlay-snowy";

    if (codeNum >= 700 && codeNum <= 799) return "weather-overlay-foggy";
    if (descLower.includes("fog") || descLower.includes("mist") || descLower.includes("haze")) return "weather-overlay-foggy";

    if (codeNum === 800) return "weather-overlay-sunny";
    if (descLower.includes("clear") || descLower.includes("sunny")) return "weather-overlay-sunny";

    if (codeNum === 801) return "weather-overlay-few-clouds";
    if (codeNum === 802) return "weather-overlay-scattered-clouds";
    if (codeNum === 803) return "weather-overlay-broken-clouds";
    if (codeNum === 804) return "weather-overlay-overcast";
    if (descLower.includes("overcast")) return "weather-overlay-overcast";
    if (descLower.includes("cloud")) return "weather-overlay-scattered-clouds";

    return "weather-overlay-few-clouds";
  };

  return { getWeatherOverlayClass };
};

const useImageSlider = (images: string[], galleryLoading: boolean) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isManualControl, setIsManualControl] = useState(false);

  useEffect(() => {
    if (!galleryLoading && images.length > 0) {
      const randomIndex = Math.floor(Math.random() * images.length);
      setCurrentImageIndex(randomIndex);
    }
  }, [galleryLoading, images.length]);

  useEffect(() => {
    if (isManualControl || images.length === 0) return;

    const slideInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);

    return () => clearInterval(slideInterval);
  }, [images.length, isManualControl]);

  useEffect(() => {
    if (!isManualControl) return;

    const resetTimer = setTimeout(() => {
      setIsManualControl(false);
    }, 16000);

    return () => clearTimeout(resetTimer);
  }, [isManualControl, currentImageIndex]);

  const handleManualSlide = (index: number) => {
    setCurrentImageIndex(index);
    setIsManualControl(true);
  };

  return { currentImageIndex, handleManualSlide };
};

const useWeatherVisibility = (weather: any, mounted: boolean, weatherLoading: boolean) => {
  const [weatherVisible, setWeatherVisible] = useState(false);

  useEffect(() => {
    if (weather && mounted && !weatherLoading) {
      const weatherTimer = setTimeout(() => {
        setWeatherVisible(true);
      }, 500);
      return () => clearTimeout(weatherTimer);
    }
  }, [weather, mounted, weatherLoading]);

  return { weatherVisible };
};

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  const { weather, loading: weatherLoading } = useWeather();
  const { images: galleryImages, loading: galleryLoading } = useActiveGalleryImages(5);
  const { getWeatherOverlayClass } = useWeatherOverlayClass();
  const { weatherVisible } = useWeatherVisibility(weather, mounted, weatherLoading);

  const fallbackImages = ["/kantor_desa.jpg", "/stasiun_ngebruk.JPG", "/pasar_ngebruk.png", "/kampung_gatot.png", "/koka_caffee.png"];

  const images = galleryImages.length > 0 ? galleryImages.map((img) => img.imageUrl) : fallbackImages;
  const { currentImageIndex, handleManualSlide } = useImageSlider(images, galleryLoading);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <ImageSlider images={images} currentImageIndex={currentImageIndex} fallbackImages={fallbackImages} />

      <div className="absolute inset-0 bg-black/70"></div>

      <WeatherOverlay weather={weather} weatherVisible={weatherVisible} onWeatherOverlayClass={getWeatherOverlayClass} />

      <HeroContent mounted={mounted} />

      <SlideIndicator images={images} currentImageIndex={currentImageIndex} onSlideChange={handleManualSlide} />
    </section>
  );
};

export default HeroSection;

