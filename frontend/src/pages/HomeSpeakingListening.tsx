// // src/pages/HomeSpeaking_Listening.tsx
// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// type Question = {
//   id: number;
//   type: "speaking" | "listening";
//   english: string;
//   correctAnswer: string;
// };

// const QUESTIONS: Question[] = [
//   {
//     id: 1,
//     type: "speaking",
//     english: "Hello, how are you?",
//     correctAnswer: "hello how are you",
//   },
//   {
//     id: 2,
//     type: "listening",
//     english: "Good morning everyone",
//     correctAnswer: "good morning everyone",
//   },
//   {
//     id: 3,
//     type: "speaking",
//     english: "Thank you very much",
//     correctAnswer: "thank you very much",
//   },
//   {
//     id: 4,
//     type: "listening",
//     english: "Have a nice day",
//     correctAnswer: "have a nice day",
//   },
//   {
//     id: 5,
//     type: "speaking",
//     english: "See you tomorrow",
//     correctAnswer: "see you tomorrow",
//   },
// ];

// function normalizeAnswer(answer: string | null | undefined): string {
//   if (!answer) return "";
//   return answer
//     .toLowerCase()
//     .replace(/[.,!?;:()"']/g, "")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// const HomeSpeakingListening: React.FC = () => {
//   const navigate = useNavigate();
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const [userAnswer, setUserAnswer] = useState<string>("");
//   const [recognizedText, setRecognizedText] = useState<string | null>(null);
//   const [showFeedback, setShowFeedback] = useState<boolean>(false);
//   const [isCorrect, setIsCorrect] = useState<boolean>(false);
//   const [isRecording, setIsRecording] = useState<boolean>(false);
//   const [isPlaying, setIsPlaying] = useState<boolean>(false);

//   const recognitionRef = useRef<any | null>(null);
//   const mountedRef = useRef<boolean>(true);

//   const question = QUESTIONS[currentIndex];
//   const progress = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);

//   useEffect(() => {
//     mountedRef.current = true;
//     return () => {
//       mountedRef.current = false;
//       if (recognitionRef.current) {
//         try {
//           recognitionRef.current.onresult = null;
//           recognitionRef.current.onend = null;
//           recognitionRef.current.onerror = null;
//           recognitionRef.current.stop();
//         } catch {
//           /* ignore */
//         }
//         recognitionRef.current = null;
//       }
//       if ("speechSynthesis" in window) {
//         window.speechSynthesis.cancel();
//       }
//     };
//   }, []);

//   const handlePlayAudio = (): void => {
//     if (!("speechSynthesis" in window)) {
//       alert("음성 재생이 지원되지 않는 브라우저입니다.");
//       return;
//     }

//     try {
//       setIsPlaying(true);
//       const utterance = new SpeechSynthesisUtterance(question.english);
//       utterance.lang = "en-US";
//       utterance.rate = 0.9;
//       utterance.onend = () => {
//         if (mountedRef.current) setIsPlaying(false);
//       };
//       utterance.onerror = () => {
//         if (mountedRef.current) setIsPlaying(false);
//       };
//       window.speechSynthesis.cancel();
//       window.speechSynthesis.speak(utterance);
//     } catch (err) {
//       setIsPlaying(false);
//       console.error(err);
//       alert("음성 재생 중 오류가 발생했습니다.");
//     }
//   };

//   const supportsSpeechRecognition = (): boolean =>
//     typeof (window as any).SpeechRecognition !== "undefined" ||
//     typeof (window as any).webkitSpeechRecognition !== "undefined";

//   const getSpeechRecognitionConstructor = (): any | null => {
//     const w = window as any;
//     return w.SpeechRecognition || w.webkitSpeechRecognition || null;
//   };

//   const handleStartRecording = (): void => {
//     if (!supportsSpeechRecognition()) {
//       alert("음성 인식이 지원되지 않는 브라우저입니다.");
//       return;
//     }
//     if (isRecording) return;

//     const SR = getSpeechRecognitionConstructor();
//     if (!SR) {
//       alert("음성 인식 생성자에 접근할 수 없습니다.");
//       return;
//     }

//     try {
//       const recognition = new SR();
//       recognition.lang = "en-US";
//       recognition.continuous = false;
//       recognition.interimResults = false;
//       recognition.maxAlternatives = 1;

//       recognition.onstart = () => {
//         if (mountedRef.current) setIsRecording(true);
//       };

//       recognition.onresult = (event: any) => {
//         try {
//           const transcript = event.results?.[0]?.[0]?.transcript;
//           if (typeof transcript === "string") {
//             const clean = normalizeAnswer(transcript);
//             if (mountedRef.current) {
//               setRecognizedText(clean);
//               setIsRecording(false);
//             }
//           }
//         } catch (e) {
//           console.error("recognition onresult error", e);
//         }
//       };

//       recognition.onerror = (ev: any) => {
//         console.error("Speech recognition error", ev);
//         if (mountedRef.current) {
//           setIsRecording(false);
//           alert(
//             "음성 인식에 실패했습니다. 마이크 권한을 확인하거나 다시 시도하세요."
//           );
//         }
//       };

//       recognition.onend = () => {
//         if (mountedRef.current) setIsRecording(false);
//       };

//       recognition.start();
//       recognitionRef.current = recognition;
//     } catch (err) {
//       console.error("startRecording err", err);
//       alert("음성 인식 시작 중 오류가 발생했습니다.");
//       setIsRecording(false);
//     }
//   };

//   const handleStopRecognitionIfAny = (): void => {
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.onresult = null;
//         recognitionRef.current.onend = null;
//         recognitionRef.current.onerror = null;
//         recognitionRef.current.stop();
//       } catch {
//         // ignore
//       }
//       recognitionRef.current = null;
//     }
//     if (mountedRef.current) setIsRecording(false);
//   };

//   const handleCheckAnswer = (): void => {
//     const user =
//       question.type === "listening"
//         ? normalizeAnswer(userAnswer)
//         : normalizeAnswer(recognizedText);
//     const correct = normalizeAnswer(question.correctAnswer);
//     const matched = user === correct;
//     setIsCorrect(matched);
//     setShowFeedback(true);
//   };

//   const handleContinue = (): void => {
//     handleStopRecognitionIfAny();
//     if (currentIndex < QUESTIONS.length - 1) {
//       setCurrentIndex((p) => p + 1);
//       setUserAnswer("");
//       setRecognizedText(null);
//       setShowFeedback(false);
//       setIsCorrect(false);
//     } else {
//       navigate("/");
//     }
//   };

//   const handleSkip = (): void => {
//     handleStopRecognitionIfAny();
//     setUserAnswer("");
//     setRecognizedText(null);
//     setShowFeedback(false);
//     setIsCorrect(false);
//     if (currentIndex < QUESTIONS.length - 1) {
//       setCurrentIndex((p) => p + 1);
//     } else {
//       navigate("/");
//     }
//   };

//   const handleClose = (): void => {
//     handleStopRecognitionIfAny();
//     if (confirm("정말 나가시겠습니까?")) {
//       navigate("/");
//     }
//   };

//   const canCheck: boolean =
//     question.type === "listening"
//       ? userAnswer.trim().length > 0
//       : recognizedText !== null && recognizedText.trim().length > 0;

//   // Render using React.createElement to avoid JSX syntax issues in strict TS setups
//   return React.createElement(
//     "div",
//     { className: "min-h-screen bg-white flex flex-col" },
//     // Top bar
//     React.createElement(
//       "div",
//       { className: "flex items-center gap-4 p-4 border-b" },
//       React.createElement(
//         "button",
//         {
//           onClick: handleClose,
//           "aria-label": "닫기",
//           className:
//             "w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors",
//           type: "button",
//         },
//         React.createElement(
//           "svg",
//           {
//             className: "w-5 h-5 text-gray-600",
//             fill: "none",
//             stroke: "currentColor",
//             viewBox: "0 0 24 24",
//           },
//           React.createElement("path", {
//             strokeLinecap: "round",
//             strokeLinejoin: "round",
//             strokeWidth: 2,
//             d: "M6 18L18 6M6 6l12 12",
//           })
//         )
//       ),
//       React.createElement(
//         "div",
//         {
//           className: "flex-1 h-4 bg-gray-200 rounded-full overflow-hidden",
//           role: "progressbar",
//           "aria-valuemin": 0,
//           "aria-valuemax": 100,
//           "aria-valuenow": progress,
//         },
//         React.createElement("div", {
//           className: "h-full bg-green-500 transition-all duration-300",
//           style: { width: `${progress}%` },
//         })
//       )
//     ),
//     // Main area
//     React.createElement(
//       "div",
//       { className: "flex-1 flex items-center justify-center p-6" },
//       React.createElement(
//         "div",
//         { className: "w-full max-w-2xl" },
//         question.type === "speaking"
//           ? React.createElement(
//               React.Fragment,
//               null,
//               React.createElement(
//                 "h1",
//                 {
//                   className:
//                     "text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-12",
//                 },
//                 "다음 문장을 따라 말해보세요"
//               ),
//               React.createElement(
//                 "div",
//                 { className: "flex justify-center mb-8" },
//                 React.createElement(
//                   "div",
//                   {
//                     className:
//                       "bg-white border-2 border-gray-200 rounded-3xl px-12 py-8 shadow-sm",
//                   },
//                   React.createElement(
//                     "span",
//                     {
//                       className: "text-3xl sm:text-4xl font-bold text-gray-800",
//                     },
//                     question.english
//                   )
//                 )
//               ),
//               React.createElement(
//                 "div",
//                 { className: "flex justify-center gap-6 mb-8" },
//                 React.createElement(
//                   "button",
//                   {
//                     type: "button",
//                     onClick: handlePlayAudio,
//                     disabled: isPlaying || showFeedback,
//                     title: "예시 듣기",
//                     className: `p-6 rounded-full transition-all duration-300 ${
//                       isPlaying
//                         ? "bg-blue-500 scale-110 animate-pulse"
//                         : "bg-blue-500 hover:bg-blue-600 active:scale-95"
//                     } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`,
//                   },
//                   React.createElement(
//                     "svg",
//                     {
//                       className: "w-10 h-10 text-white",
//                       fill: "none",
//                       stroke: "currentColor",
//                       viewBox: "0 0 24 24",
//                     },
//                     React.createElement("path", {
//                       strokeLinecap: "round",
//                       strokeLinejoin: "round",
//                       strokeWidth: 2,
//                       d: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
//                     })
//                   )
//                 ),
//                 React.createElement(
//                   "button",
//                   {
//                     type: "button",
//                     onClick: handleStartRecording,
//                     disabled: isRecording || showFeedback,
//                     title: "녹음하기",
//                     className: `p-6 rounded-full transition-all duration-300 ${
//                       isRecording
//                         ? "bg-red-500 scale-110 animate-pulse"
//                         : "bg-rose-500 hover:bg-rose-600 active:scale-95"
//                     } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`,
//                   },
//                   React.createElement(
//                     "svg",
//                     {
//                       className: "w-10 h-10 text-white",
//                       fill: "none",
//                       stroke: "currentColor",
//                       viewBox: "0 0 24 24",
//                     },
//                     React.createElement("path", {
//                       strokeLinecap: "round",
//                       strokeLinejoin: "round",
//                       strokeWidth: 2,
//                       d: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
//                     })
//                   )
//                 )
//               ),
//               recognizedText
//                 ? React.createElement(
//                     "div",
//                     {
//                       className:
//                         "mb-6 p-4 bg-sky-50 border-2 border-sky-200 rounded-2xl",
//                     },
//                     React.createElement(
//                       "p",
//                       { className: "text-center text-gray-700" },
//                       "인식된 내용: ",
//                       React.createElement(
//                         "span",
//                         { className: "font-semibold" },
//                         recognizedText
//                       )
//                     )
//                   )
//                 : null
//             )
//           : React.createElement(
//               React.Fragment,
//               null,
//               React.createElement(
//                 "h1",
//                 {
//                   className:
//                     "text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-12",
//                 },
//                 "들리는 문장을 입력하세요"
//               ),
//               React.createElement(
//                 "div",
//                 { className: "flex justify-center mb-8" },
//                 React.createElement(
//                   "button",
//                   {
//                     type: "button",
//                     onClick: handlePlayAudio,
//                     disabled: isPlaying || showFeedback,
//                     className: `p-8 rounded-full transition-all duration-300 ${
//                       isPlaying
//                         ? "bg-blue-500 scale-110 animate-pulse"
//                         : "bg-blue-500 hover:bg-blue-600 active:scale-95"
//                     } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`,
//                   },
//                   React.createElement(
//                     "svg",
//                     {
//                       className: "w-12 h-12 text-white",
//                       fill: "none",
//                       stroke: "currentColor",
//                       viewBox: "0 0 24 24",
//                     },
//                     React.createElement("path", {
//                       strokeLinecap: "round",
//                       strokeLinejoin: "round",
//                       strokeWidth: 2,
//                       d: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
//                     })
//                   )
//                 )
//               ),
//               React.createElement(
//                 "div",
//                 { className: "mb-8" },
//                 React.createElement("input", {
//                   type: "text",
//                   value: userAnswer,
//                   onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
//                     setUserAnswer(e.target.value),
//                   disabled: showFeedback,
//                   placeholder: "여기에 입력하세요...",
//                   className:
//                     "w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-rose-500 transition-colors disabled:bg-gray-100",
//                 })
//               )
//             ),
//         // Controls (skip/check)
//         !showFeedback
//           ? React.createElement(
//               "div",
//               { className: "flex gap-4 justify-end" },
//               React.createElement(
//                 "button",
//                 {
//                   type: "button",
//                   onClick: handleSkip,
//                   className:
//                     "px-6 sm:px-8 py-3 sm:py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 active:scale-95",
//                 },
//                 "넘어가기"
//               ),
//               React.createElement(
//                 "button",
//                 {
//                   type: "button",
//                   onClick: handleCheckAnswer,
//                   disabled: !canCheck,
//                   className: `px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 active:scale-95 ${
//                     canCheck
//                       ? "bg-rose-500 hover:bg-rose-600 text-white"
//                       : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                   }`,
//                 },
//                 "확인"
//               )
//             )
//           : null
//       )
//     ),
//     // Feedback banner
//     showFeedback
//       ? React.createElement(
//           "div",
//           {
//             className: `border-t-2 p-6 ${
//               isCorrect
//                 ? "bg-green-50 border-green-500"
//                 : "bg-rose-50 border-rose-500"
//             }`,
//           },
//           React.createElement(
//             "div",
//             {
//               className:
//                 "max-w-2xl mx-auto flex items-center justify-between gap-4",
//             },
//             React.createElement(
//               "div",
//               { className: "flex items-center gap-4" },
//               React.createElement(
//                 "div",
//                 {
//                   className: `w-12 h-12 rounded-full flex items-center justify-center ${
//                     isCorrect ? "bg-green-500" : "bg-white"
//                   }`,
//                 },
//                 isCorrect
//                   ? React.createElement(
//                       "svg",
//                       {
//                         className: "w-7 h-7 text-white",
//                         fill: "none",
//                         stroke: "currentColor",
//                         viewBox: "0 0 24 24",
//                       },
//                       React.createElement("path", {
//                         strokeLinecap: "round",
//                         strokeLinejoin: "round",
//                         strokeWidth: 3,
//                         d: "M5 13l4 4L19 7",
//                       })
//                     )
//                   : React.createElement(
//                       "svg",
//                       {
//                         className: "w-7 h-7 text-rose-500",
//                         fill: "none",
//                         stroke: "currentColor",
//                         viewBox: "0 0 24 24",
//                       },
//                       React.createElement("path", {
//                         strokeLinecap: "round",
//                         strokeLinejoin: "round",
//                         strokeWidth: 3,
//                         d: "M6 18L18 6M6 6l12 12",
//                       })
//                     )
//               ),
//               React.createElement(
//                 "div",
//                 null,
//                 React.createElement(
//                   "p",
//                   {
//                     className: `text-xl font-bold ${
//                       isCorrect ? "text-green-700" : "text-rose-600"
//                     }`,
//                   },
//                   isCorrect ? "정답!" : "정답:"
//                 ),
//                 !isCorrect
//                   ? React.createElement(
//                       "p",
//                       { className: "text-rose-600 font-medium" },
//                       question.english
//                     )
//                   : null
//               )
//             ),
//             React.createElement(
//               "button",
//               {
//                 type: "button",
//                 onClick: handleContinue,
//                 className:
//                   "px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all active:scale-95",
//               },
//               "계속하기"
//             )
//           )
//         )
//       : null
//   );
// };

// export default HomeSpeakingListening;
