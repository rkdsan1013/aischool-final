// src/pages/VoiceRoomDetail.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Phone,
  Users,
  MessageSquare,
  Volume2,
  Clock,
  X,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  isSpeaking: boolean;
  speakingTime: number;
  isMuted: boolean;
}

interface TranscriptItem {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  feedback?: string;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function VoiceRoomDetail(): React.ReactElement {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const recognitionRef = useRef<any>(null);

  // initialize participants and transcript
  useEffect(() => {
    setParticipants([
      {
        id: "1",
        name: "나",
        isSpeaking: false,
        speakingTime: 0,
        isMuted: false,
      },
      {
        id: "2",
        name: "김영희",
        isSpeaking: false,
        speakingTime: 45,
        isMuted: false,
      },
      {
        id: "3",
        name: "이철수",
        isSpeaking: false,
        speakingTime: 32,
        isMuted: false,
      },
      {
        id: "4",
        name: "박민수",
        isSpeaking: false,
        speakingTime: 28,
        isMuted: false,
      },
    ]);

    setTranscript([
      {
        id: "1",
        speaker: "김영희",
        text: "Hi everyone! How are you doing today?",
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: "2",
        speaker: "나",
        text: "I'm doing great, thanks! How about you?",
        timestamp: new Date(Date.now() - 240000),
        feedback:
          "Great pronunciation! Your intonation is natural. 발음이 정확하고 억양이 자연스러워요.",
      },
      {
        id: "3",
        speaker: "이철수",
        text: "I had a wonderful weekend. I went hiking with my friends.",
        timestamp: new Date(Date.now() - 180000),
      },
      {
        id: "4",
        speaker: "나",
        text: "That sounds amazing! Where did you go hiking?",
        timestamp: new Date(Date.now() - 120000),
        feedback:
          "Good job! Consider using 'That sounds fantastic' for more variety. 다양한 표현을 사용해보세요.",
      },
      {
        id: "5",
        speaker: "박민수",
        text: "I love hiking too! It's such a great way to relax and enjoy nature.",
        timestamp: new Date(Date.now() - 60000),
      },
    ]);

    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize speech recognition and simulated other speakers
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).webkitSpeechRecognition
    ) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === "1" ? { ...p, isSpeaking: true } : p))
        );
      };

      recognition.onend = () => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === "1" ? { ...p, isSpeaking: false } : p))
        );
      };

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        if (event.results[last].isFinal) {
          const newTranscript: TranscriptItem = {
            id: Date.now().toString(),
            speaker: "나",
            text,
            timestamp: new Date(),
            feedback:
              text.length > 20
                ? "Good pronunciation! 발음이 정확해요."
                : undefined,
          };
          setTranscript((prev) => [...prev, newTranscript]);
        }
      };

      recognitionRef.current = recognition;
    }

    // simulate other participants speaking
    const speakingInterval = setInterval(() => {
      const otherParticipants = ["2", "3", "4"];
      const randomParticipant =
        otherParticipants[Math.floor(Math.random() * otherParticipants.length)];

      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id === randomParticipant) {
            return { ...p, isSpeaking: true };
          }
          return p.id !== "1" ? { ...p, isSpeaking: false } : p;
        })
      );

      setTimeout(() => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === randomParticipant ? { ...p, isSpeaking: false } : p
          )
        );
      }, 2000 + Math.random() * 3000);
    }, 5000);

    return () => clearInterval(speakingInterval);
  }, []);

  const toggleMute = () => {
    setIsMuted((s) => !s);
    if (!isMuted && recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (isMuted && recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const toggleConnection = () => {
    if (isConnected) {
      if (recognitionRef.current) recognitionRef.current.stop();
      navigate("/voiceroom");
    } else {
      setIsConnected(true);
      if (recognitionRef.current && !isMuted) recognitionRef.current.start();
    }
  };

  // layout elements built with React.createElement to avoid JSX
  return React.createElement(
    "div",
    {
      className:
        "h-screen flex flex-col bg-white text-gray-900 font-sans overflow-hidden",
    },
    // Header
    React.createElement(
      "div",
      {
        className: "border-b border-gray-200 bg-white shadow-sm flex-shrink-0",
      },
      React.createElement(
        "div",
        { className: "px-3 sm:px-6 py-3" },
        React.createElement(
          "div",
          { className: "flex items-center justify-between gap-2" },
          // Left - Room Info
          React.createElement(
            "div",
            { className: "flex items-center gap-2 min-w-0 flex-1" },
            React.createElement(
              "div",
              {
                className:
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md flex-shrink-0",
              },
              React.createElement(Users, {
                className: "w-4 h-4 sm:w-5 sm:h-5 text-white",
              })
            ),
            React.createElement(
              "div",
              { className: "min-w-0" },
              React.createElement(
                "h1",
                {
                  className:
                    "text-sm sm:text-lg font-bold text-gray-900 truncate",
                },
                "초보자 환영방"
              ),
              React.createElement(
                "p",
                { className: "text-xs text-gray-600" },
                `${participants.length}명`
              )
            )
          ),
          // Right - Controls
          React.createElement(
            "div",
            { className: "flex items-center gap-1.5 sm:gap-2 flex-shrink-0" },
            React.createElement(
              "div",
              {
                className:
                  "hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-200",
              },
              React.createElement(Clock, {
                className: "w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500",
              }),
              React.createElement(
                "span",
                { className: "text-xs sm:text-sm font-medium text-gray-900" },
                formatTime(sessionTime)
              )
            ),
            React.createElement(
              "button",
              {
                onClick: toggleMute,
                className:
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-sm " +
                  (isMuted
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"),
              },
              isMuted
                ? React.createElement(MicOff, {
                    className: "w-4 h-4 sm:w-5 sm:h-5",
                  })
                : React.createElement(Mic, {
                    className: "w-4 h-4 sm:w-5 sm:h-5",
                  })
            ),
            React.createElement(
              "button",
              {
                className:
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all shadow-sm",
              },
              React.createElement(Volume2, {
                className: "w-4 h-4 sm:w-5 sm:h-5",
              })
            ),
            React.createElement(
              "button",
              {
                onClick: toggleConnection,
                className:
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 flex items-center justify-center transition-all shadow-md active:scale-95 text-white",
              },
              React.createElement(Phone, {
                className: `w-4 h-4 sm:w-5 sm:h-5 ${
                  isConnected ? "rotate-135" : ""
                } transition-transform`,
              })
            ),
            React.createElement(
              "button",
              {
                onClick: () => navigate("/voiceroom"),
                className:
                  "p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors",
              },
              React.createElement(X, {
                className: "w-4 h-4 sm:w-5 sm:h-5 text-gray-600",
              })
            )
          )
        )
      )
    ),
    // Main
    React.createElement(
      "div",
      { className: "flex-1 overflow-hidden" },
      React.createElement(
        "div",
        { className: "px-3 sm:px-6 h-full py-3 sm:py-4" },
        React.createElement(
          "div",
          {
            className:
              "flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-4 h-full",
          },
          // Left column - participants
          React.createElement(
            "div",
            {
              className:
                "lg:col-span-1 h-auto lg:h-full lg:overflow-y-auto flex-shrink-0",
            },
            React.createElement(
              "div",
              {
                className:
                  "bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-200 shadow-sm",
              },
              React.createElement(
                "h2",
                {
                  className:
                    "text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 text-gray-900",
                },
                React.createElement(Users, {
                  className: "w-4 h-4 sm:w-5 sm:h-5 text-rose-500",
                }),
                `참가자 (${participants.length})`
              ),
              React.createElement(
                "div",
                {
                  className:
                    "flex lg:grid lg:grid-cols-1 gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-3 px-3 lg:mx-0 lg:px-0",
                },
                participants.map((participant) =>
                  React.createElement(
                    "div",
                    {
                      key: participant.id,
                      className: "flex-shrink-0 w-20 lg:w-full",
                    },
                    React.createElement(
                      "div",
                      {
                        className:
                          "flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-3 p-2 lg:p-4 rounded-lg lg:rounded-xl border bg-gray-50 border-gray-200",
                      },
                      React.createElement(
                        "div",
                        {
                          className:
                            "relative w-12 h-12 lg:w-12 lg:h-12 flex-shrink-0",
                        },
                        participant.isSpeaking
                          ? React.createElement("div", {
                              className:
                                "absolute inset-0 rounded-full ring-4 ring-rose-400 ring-opacity-70 animate-pulse",
                            })
                          : null,
                        React.createElement(
                          "div",
                          {
                            className:
                              "w-full h-full rounded-full flex items-center justify-center font-bold text-base lg:text-lg text-white shadow-md " +
                              (participant.id === "1"
                                ? "bg-rose-500"
                                : "bg-blue-500"),
                          },
                          participant.name.charAt(0)
                        )
                      ),
                      React.createElement(
                        "div",
                        {
                          className: "flex-1 text-center lg:text-left min-w-0",
                        },
                        React.createElement(
                          "div",
                          {
                            className:
                              "flex flex-col lg:flex-row items-center lg:items-center gap-1 lg:gap-2",
                          },
                          React.createElement(
                            "h3",
                            {
                              className:
                                "font-semibold text-xs lg:text-base text-gray-900 truncate",
                            },
                            participant.name
                          ),
                          participant.isMuted
                            ? React.createElement(MicOff, {
                                className:
                                  "w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-400",
                              })
                            : null
                        )
                      )
                    )
                  )
                )
              )
            )
          ),
          // Right column - transcript + feedback
          React.createElement(
            "div",
            { className: "lg:col-span-2 flex-1 overflow-hidden min-h-0" },
            React.createElement(
              "div",
              {
                className:
                  "bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-200 shadow-sm h-full flex flex-col",
              },
              React.createElement(
                "div",
                {
                  className:
                    "flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0",
                },
                React.createElement(
                  "h2",
                  {
                    className:
                      "text-base sm:text-lg font-bold flex items-center gap-2 text-gray-900",
                  },
                  React.createElement(MessageSquare, {
                    className: "w-4 h-4 sm:w-5 sm:h-5 text-rose-500",
                  }),
                  React.createElement(
                    "span",
                    { className: "hidden sm:inline" },
                    "실시간 자막 & AI 피드백"
                  ),
                  React.createElement(
                    "span",
                    { className: "sm:hidden" },
                    "실시간 자막"
                  )
                ),
                React.createElement(
                  "div",
                  {
                    className:
                      "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs sm:text-sm border border-rose-200",
                  },
                  React.createElement("div", {
                    className:
                      "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-500 rounded-full animate-pulse",
                  }),
                  React.createElement(
                    "span",
                    { className: "font-medium" },
                    "LIVE"
                  )
                )
              ),
              React.createElement(
                "div",
                {
                  className:
                    "flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2",
                },
                transcript.map((item) =>
                  React.createElement(
                    "div",
                    {
                      key: item.id,
                      className: `flex ${
                        item.speaker === "나" ? "justify-end" : "justify-start"
                      }`,
                    },
                    React.createElement(
                      "div",
                      {
                        className: `max-w-[85%] sm:max-w-[75%] ${
                          item.speaker === "나" ? "items-end" : "items-start"
                        } flex flex-col gap-1`,
                      },
                      React.createElement(
                        "div",
                        {
                          className: `flex items-center gap-1.5 sm:gap-2 px-2 ${
                            item.speaker === "나" ? "flex-row-reverse" : ""
                          }`,
                        },
                        React.createElement(
                          "span",
                          { className: "text-xs font-medium text-gray-600" },
                          item.speaker
                        ),
                        React.createElement(
                          "span",
                          { className: "text-xs text-gray-400" },
                          item.timestamp.toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        )
                      ),
                      React.createElement(
                        "div",
                        {
                          className:
                            `px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base ` +
                            (item.speaker === "나"
                              ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-900 rounded-bl-sm"),
                        },
                        React.createElement(
                          "p",
                          { className: "leading-relaxed" },
                          item.text
                        )
                      ),
                      item.feedback && item.speaker === "나"
                        ? React.createElement(
                            "div",
                            {
                              className:
                                "flex items-start gap-2 mt-1 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-xl max-w-full",
                            },
                            React.createElement(
                              "div",
                              {
                                className:
                                  "w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0",
                              },
                              React.createElement(
                                "svg",
                                {
                                  className:
                                    "w-2.5 h-2.5 sm:w-3 sm:h-3 text-white",
                                  fill: "none",
                                  viewBox: "0 0 24 24",
                                  stroke: "currentColor",
                                },
                                React.createElement("path", {
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: 2,
                                  d: "M5 13l4 4L19 7",
                                })
                              )
                            ),
                            React.createElement(
                              "p",
                              {
                                className:
                                  "text-xs leading-relaxed text-green-700",
                              },
                              item.feedback
                            )
                          )
                        : null
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}
