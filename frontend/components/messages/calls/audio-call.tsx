"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  MessageSquare,
  X,
  Phone,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CallMessageSidebar from "../call-message-sidebar";
import { SERVER_URL } from "@/lib/server";

interface AudioCallProps {
  user: User;
  onEndCall: () => void;
}

export default function AudioCall({ user, onEndCall }: AudioCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(30).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Start timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format call duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Simulate audio visualization
  useEffect(() => {
    const setupAudioContext = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Create audio context
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        // Create analyser node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        // Create data array for frequency data
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        dataArrayRef.current = dataArray;

        // Connect stream to analyser
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        // Start visualization loop
        visualize();
      } catch (err) {
        console.error("Error accessing audio:", err);
      }
    };

    const visualize = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Map frequency data to audio levels (0-100)
      const newLevels = Array.from({ length: 30 }, (_, i) => {
        // For demo purposes, we'll use a combination of real data and random values
        const realValue = dataArrayRef.current
          ? dataArrayRef.current[i % dataArrayRef.current.length]
          : 0;
        const randomValue = Math.random() * 50;
        return Math.min(
          100,
          Math.max(5, (realValue / 255) * 100 + randomValue * 0.2)
        );
      });

      setAudioLevels(newLevels);

      // Continue visualization loop
      requestAnimationFrame(visualize);
    };

    setupAudioContext();

    return () => {
      // Clean up audio context when component unmounts
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOff((prev) => !prev);
  };

  return (
    <div className="flex h-full bg-gradient-to-b from-primary/20 to-background relative overflow-hidden">
      {/* Main audio call area */}
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center p-4",
          showMessages ? "md:mr-80" : ""
        )}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
          <p className="text-muted-foreground">
            {formatDuration(callDuration)}
          </p>
        </div>

        {/* User avatars */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-2">
              <AvatarFallback className="text-2xl">You</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">You</span>
          </div>

          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-2">
              <AvatarImage
                src={`${SERVER_URL}${user.avatar}`}
                alt={user.name}
              />
              <AvatarFallback className="text-2xl">
                {user.name!.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        </div>

        {/* Audio visualization */}
        <div className="w-full max-w-md h-16 flex items-end justify-center gap-1 mb-8">
          {audioLevels.map((level, index) => (
            <div
              key={index}
              className="w-2 bg-primary rounded-t"
              style={{
                height: `${level}%`,
                opacity: isMuted ? 0.3 : 1,
                transition: "height 0.1s ease-in-out",
              }}
            />
          ))}
        </div>

        {/* Call controls */}
        <div className="flex justify-center items-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="rounded-full h-14 w-14 shadow-md"
            onClick={toggleMute}>
            {isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-16 w-16 shadow-md"
            onClick={onEndCall}>
            <Phone className="h-7 w-7 rotate-135" />
          </Button>

          <Button
            variant={isSpeakerOff ? "destructive" : "secondary"}
            size="icon"
            className="rounded-full h-14 w-14 shadow-md"
            onClick={toggleSpeaker}>
            {isSpeakerOff ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Message toggle button (desktop) */}
        <Button
          variant={showMessages ? "default" : "outline"}
          className="absolute right-4 top-4 hidden md:flex"
          onClick={() => setShowMessages(!showMessages)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          {showMessages ? "Hide Chat" : "Show Chat"}
        </Button>
      </div>

      {/* Message sidebar - only visible when toggled */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full md:w-80 bg-background border-l border-border transition-transform z-10",
          showMessages ? "translate-x-0" : "translate-x-full"
        )}>
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-medium">Chat with {user.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMessages(false)}
            className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMessages(false)}
            className="hidden md:flex">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <CallMessageSidebar user={user} />
      </div>

      {/* Mobile toggle for message sidebar */}
      {!showMessages && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 bottom-24 md:hidden rounded-full h-12 w-12 shadow-lg"
          onClick={() => setShowMessages(true)}>
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
