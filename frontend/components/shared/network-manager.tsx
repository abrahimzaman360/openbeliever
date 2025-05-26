"use client";
import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Wifi } from "lucide-react";
import { SERVER_URL } from "@/lib/server";

const NetworkConnectivity = ({
  pingUrl = SERVER_URL + "/api/health-checks/ping",
  pingInterval = 5000,
  timeout = 5000,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const checkServerConnection = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(pingUrl, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        if (!isOnline) {
          setIsOnline(true);
          setPopupMessage("Connection Restored");
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 3000);
        }
      } else {
        throw new Error("Server responded with an error");
      }
    } catch (error) {
      if (isOnline) {
        setIsOnline(false);
        setPopupMessage("Disconnected from Server");
        setShowPopup(true);
      }
    }
  }, [isOnline, pingUrl, timeout]);

  useEffect(() => {
    // Initial connection check
    checkServerConnection();

    // Periodic connection checking
    const intervalId = setInterval(checkServerConnection, pingInterval);

    // Browser online/offline event listeners
    const handleOnline = () => checkServerConnection();
    const handleOffline = () => {
      setIsOnline(false);
      setPopupMessage("No Internet Connection");
      setShowPopup(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkServerConnection, pingInterval]);

  if (!showPopup) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-sm ${
        !isOnline ? "bg-black/50" : "pointer-events-none opacity-0"
      } transition-opacity duration-300`}>
      <div
        className={`p-6 rounded-lg shadow-xl transition-all duration-100 ease-in-out ${
          isOnline
            ? "bg-green-100 border-green-300 text-green-800"
            : "bg-red-100 border-red-300 text-red-800"
        }`}>
        <div className="flex items-center space-x-4">
          {isOnline ? (
            <>
              <Wifi className="w-8 h-8 text-green-600" />
              <span className="text-lg font-semibold">{popupMessage}</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <span className="text-lg font-semibold">{popupMessage}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkConnectivity;
