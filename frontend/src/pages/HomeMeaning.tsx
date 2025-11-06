// import React, { useState } from "react";

// interface Question {
//   sentence: string;
//   options: string[];
//   correctAnswer: number;
// }

// const QUESTIONS: Question[] = [
//   {
//     sentence: "I love eating ____",
//     options: ["pizza", "shoes", "hair", "book"],
//     correctAnswer: 0,
//   },
//   {
//     sentence: "She is ____ a book",
//     options: ["eating", "reading", "drinking", "running"],
//     correctAnswer: 1,
//   },
//   {
//     sentence: "The cat is ____ on the sofa",
//     options: ["flying", "swimming", "sleeping", "cooking"],
//     correctAnswer: 2,
//   },
//   {
//     sentence: "I need to ____ my homework",
//     options: ["eat", "drink", "do", "sleep"],
//     correctAnswer: 2,
//   },
//   {
//     sentence: "He ____ to school every day",
//     options: ["flies", "swims", "walks", "cooks"],
//     correctAnswer: 2,
//   },
// ];

// const HomeMeaning: React.FC = () => {
//   const [currentQuestion, setCurrentQuestion] = useState<number>(0);
//   const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
//   const [showFeedback, setShowFeedback] = useState<boolean>(false);
//   const [isCorrect, setIsCorrect] = useState<boolean>(false);

//   const currentQ = QUESTIONS[currentQuestion];
//   const progress = Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100);

//   const handleSelectAnswer = (index: number) => {
//     if (showFeedback) return;
//     setSelectedAnswer(index);
//   };

//   const handleCheckAnswer = () => {
//     if (selectedAnswer === null) return;
//     const correct = selectedAnswer === currentQ.correctAnswer;
//     setIsCorrect(correct);
//     setShowFeedback(true);
//   };

//   const handleContinue = () => {
//     if (currentQuestion < QUESTIONS.length - 1) {
//       setCurrentQuestion((p) => p + 1);
//       setSelectedAnswer(null);
//       setShowFeedback(false);
//       setIsCorrect(false);
//     } else {
//       alert("학습 완료!");
//     }
//   };

//   const handleClose = () => {
//     if (window.confirm("학습을 종료하시겠습니까?")) {
//       window.history.back();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white flex flex-col">
//       {/* Header */}
//       <div className="border-b-2 border-gray-100">
//         <div className="max-w-4xl mx-auto px-4 py-4">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={handleClose}
//               aria-label="닫기"
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//               type="button"
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             <div className="flex-1">
//               <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-rose-500 transition-all duration-300"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex items-center justify-center px-4 py-8">
//         <div className="w-full max-w-2xl">
//           <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
//             빈칸에 알맞은 단어를 선택하세요
//           </h2>

//           {/* Sentence card */}
//           <div className="mb-8 sm:mb-12">
//             <div className="text-center text-xl sm:text-2xl lg:text-3xl font-medium text-gray-800 p-6 sm:p-8 bg-gray-50 rounded-2xl border-2 border-gray-200">
//               {currentQ.sentence.split("____").map((part, idx, arr) => (
//                 <span key={idx}>
//                   {part}
//                   {idx < arr.length - 1 && (
//                     <span className="inline-block min-w-[140px] border-b-4 border-rose-500 mx-2 pb-1">
//                       {selectedAnswer !== null && showFeedback
//                         ? currentQ.options[selectedAnswer]
//                         : ""}
//                     </span>
//                   )}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Options */}
//           <div className="space-y-3 mb-8">
//             {currentQ.options.map((option, index) => {
//               const isSelected = selectedAnswer === index;
//               const isCorrectAnswer = index === currentQ.correctAnswer;
//               const showCorrect = showFeedback && isCorrectAnswer;
//               const showIncorrect = showFeedback && isSelected && !isCorrect;

//               let baseClass =
//                 "w-full p-4 sm:p-5 rounded-xl border-2 text-left text-base sm:text-lg font-medium transition-all duration-200 ";
//               let stateClass = isSelected
//                 ? "border-rose-500 bg-rose-50 text-rose-700"
//                 : "border-gray-200 hover:border-rose-200 hover:bg-gray-50 text-gray-700";

//               if (showCorrect)
//                 stateClass = "border-green-500 bg-green-50 text-green-700";
//               if (showIncorrect)
//                 stateClass = "border-rose-500 bg-rose-50 text-rose-700";

//               return (
//                 <button
//                   key={index}
//                   type="button"
//                   onClick={() => handleSelectAnswer(index)}
//                   disabled={showFeedback}
//                   className={`${baseClass}${stateClass} ${
//                     showFeedback
//                       ? "cursor-not-allowed"
//                       : "cursor-pointer active:scale-[0.98]"
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
//                       {index + 1}
//                     </span>
//                     <span className="flex-1">{option}</span>

//                     {showCorrect && (
//                       <svg
//                         className="w-6 h-6 text-green-600 flex-shrink-0"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     )}

//                     {showIncorrect && (
//                       <svg
//                         className="w-6 h-6 text-red-600 flex-shrink-0"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>

//           {/* Check button */}
//           {!showFeedback && (
//             <div className="flex justify-center">
//               <button
//                 onClick={handleCheckAnswer}
//                 disabled={selectedAnswer === null}
//                 type="button"
//                 className={`w-full sm:w-auto sm:min-w-[200px] py-4 px-8 rounded-2xl font-bold text-lg transition-all ${
//                   selectedAnswer === null
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-rose-500 text-white hover:bg-rose-600"
//                 }`}
//               >
//                 확인
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Feedback Banner */}
//       {showFeedback && (
//         <div
//           className={`border-t-2 ${
//             isCorrect
//               ? "bg-green-50 border-green-200"
//               : "bg-rose-50 border-rose-200"
//           }`}
//         >
//           <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <div
//                 className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
//                   isCorrect ? "bg-green-100" : "bg-white"
//                 }`}
//               >
//                 {isCorrect ? (
//                   <svg
//                     className="w-7 h-7 text-green-600"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 ) : (
//                   <svg
//                     className="w-7 h-7 text-rose-600"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 )}
//               </div>

//               <div>
//                 <div
//                   className={`text-xl font-bold ${
//                     isCorrect ? "text-green-700" : "text-rose-700"
//                   }`}
//                 >
//                   {isCorrect ? "정답!" : "정답:"}
//                 </div>

//                 {!isCorrect && (
//                   <div className="text-rose-600 font-medium mt-1">
//                     {currentQ.options[currentQ.correctAnswer]}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <button
//               onClick={handleContinue}
//               type="button"
//               className={`px-8 py-3 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${
//                 isCorrect
//                   ? "bg-green-500 hover:bg-green-600"
//                   : "bg-rose-500 hover:bg-rose-600"
//               }`}
//             >
//               계속하기
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomeMeaning;
