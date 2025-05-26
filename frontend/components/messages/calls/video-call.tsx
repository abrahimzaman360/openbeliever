"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  X,
  Phone,
  ChevronRight,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CallMessageSidebar from "../call-message-sidebar";
import { SERVER_URL } from "@/lib/server";

interface VideoCallProps {
  user: User;
  onEndCall: () => void;
}

export default function VideoCall({ user, onEndCall }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate local video stream with a ref
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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

  // Simulate starting camera when component mounts
  useEffect(() => {
    const videoRef = localVideoRef.current;
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef) {
          videoRef.srcObject = stream;
        }

        // For demo purposes, we'll use the same stream for remote video
        // In a real app, this would come from WebRTC or a similar technology
        setTimeout(() => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        }, 1000);
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    getMedia();

    return () => {
      // Clean up streams when component unmounts
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // Toggle the current state
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoOff((prev) => !prev);

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff; // Toggle the current state
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex h-full bg-black relative overflow-hidden">
      {/* Main video area */}
      <div className={cn("flex-1 relative", showMessages ? "md:mr-80" : "")}>
        {/* Remote user's video (or avatar if video is off) */}
        {isVideoOff ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Avatar className="h-40 w-40">
              <AvatarImage
                src={`${SERVER_URL}${user.avatar}`}
                alt={user.name}
              />
              <AvatarFallback className="text-4xl">
                {user.name!.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Local user's video (picture-in-picture) */}
        <div className="absolute bottom-24 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn("w-full h-full object-cover", isVideoOff && "hidden")}
          />
          {isVideoOff && (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Call info overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{user.name}</span>
            <span className="text-white/70 text-sm">
              • {formatDuration(callDuration)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Call controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-2">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleMute}>
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleVideo}>
              {isVideoOff ? (
                <VideoOff className="h-5 w-5" />
              ) : (
                <Video className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={onEndCall}>
              <Phone className="h-5 w-5 rotate-135" />
            </Button>

            <Button
              variant={showMessages ? "default" : "secondary"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => setShowMessages(!showMessages)}>
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </div>
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
