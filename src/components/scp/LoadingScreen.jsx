import React from "react";

export default function LoadingScreen({ message = "LOADING DATA" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-2 border border-primary/10 rounded-full" />
        <div className="absolute inset-2 border border-transparent border-b-primary/50 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
      <p className="text-sm font-mono text-muted-foreground tracking-widest cursor-blink">{message}</p>
    </div>
  );
}