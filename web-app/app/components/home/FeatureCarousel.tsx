import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Card, CardContent } from "~/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Trophy,
  ClipboardPen,
  CalendarClock,
  RefreshCcw,
  Pause,
  Play,
} from "lucide-react";
import { useState, type JSX } from "react";
import React from "react";

interface Feature {
  icon: JSX.Element;
  title: string;
  desc: string;
}

const features = [
  {
    icon: <Users className="h-6 w-6 text-secondary" />,
    title: "Build Your Squad",
    desc: "Use a $100 budget to build a fantasy squad of 13 NBA players.",
  },
  {
    icon: <ClipboardPen className="h-6 w-6 text-secondary" />,
    title: "Weekly Lineups",
    desc: "Set starters, choose captains, and manage your line-up each week.",
  },
  {
    icon: <CalendarClock className="h-6 w-6 text-secondary" />,
    title: "Daily Stats",
    desc: "NBA statistics and fantasy scores updated daily.",
  },
  {
    icon: <Trophy className="h-6 w-6 text-secondary" />,
    title: "Compete Globally",
    desc: "Climb weekly and season-long leaderboards worldwide.",
  },
  {
    icon: <RefreshCcw className="h-6 w-6 text-secondary" />,
    title: "Player Trades",
    desc: "Trade players each week without exceeding your budget.",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-secondary" />,
    title: "Dynamic Prices",
    desc: "Player prices can rise or fall based on form and demand.",
  },
];

export default function FeatureCarousel() {
  const autoplay = React.useRef(Autoplay({ delay: 3500 }));
  const [isPaused, setIsPaused] = useState(false);

  const toggleAutoplay = () => {
    console.log(isPaused);
    if (isPaused) autoplay.current.play();
    else autoplay.current.stop();
    setIsPaused(!isPaused);
    console.log(isPaused);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[autoplay.current]}
        className="max-w-full md:max-w-3xl px-4"
      >
        <CarouselContent>
          {features.map((f, i) => (
            <CarouselItem
              key={i}
              className="basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <div className="p-1">
                <Card key={i} className="">
                  <CardContent className="flex flex-col lg:h-60 justify-center p-6 text-left">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center bg-background">
                      {f.icon}
                    </div>
                    <h3 className="text-xl text-foreground font-semibold mb-2">
                      {f.title}
                    </h3>
                    <p className="text-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Arrows below the carousel */}
        <div className="flex justify-between gap-4 mt-4">
          <button
            onClick={toggleAutoplay}
            className="p-2 rounded-full border bg-background shadow hover:bg-accent transition"
          >
            {isPaused ? (
              <Play className="h-5 w-5" />
            ) : (
              <Pause className="h-5 w-5" />
            )}
          </button>
          <div className="space-x-4">
            <CarouselPrevious className="static translate-y-0 translate-x-0" />
            <CarouselNext className="static translate-y-0 translate-x-0" />
          </div>
          <div></div>
        </div>
      </Carousel>
    </div>
  );
}
