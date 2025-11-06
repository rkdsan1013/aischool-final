// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// type Question = {
//   korean: string;
//   options: string[];
//   correct: string;
// };

// const vocabularyQuestions: Question[] = [
//   {
//     korean: "사과",
//     options: ["Apple", "Banana", "Orange", "Grape"],
//     correct: "Apple",
//   },
//   { korean: "고양이", options: ["Dog", "Cat", "Bird", "Fish"], correct: "Cat" },
//   { korean: "책", options: ["Pen", "Paper", "Book", "Desk"], correct: "Book" },
//   {
//     korean: "물",
//     options: ["Fire", "Water", "Air", "Earth"],
//     correct: "Water",
//   },
//   {
//     korean: "집",
//     options: ["House", "Car", "School", "Park"],
//     correct: "House",
//   },
//   {
//     korean: "친구",
//     options: ["Enemy", "Friend", "Teacher", "Student"],
//     correct: "Friend",
//   },
//   {
//     korean: "음식",
//     options: ["Drink", "Food", "Snack", "Meal"],
//     correct: "Food",
//   },
//   {
//     korean: "학교",
//     options: ["Hospital", "School", "Library", "Museum"],
//     correct: "School",
//   },
// ];

// const VocabularyTraining: React.FC = () => {
//   const navigate = useNavigate();
//   const [currentQuestion, setCurrentQuestion] = useState<number>(0);
//   const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
//   const [showFeedback, setShowFeedback] = useState<boolean>(false);
//   const [isCorrect, setIsCorrect] = useState<boolean>(false);
//   const [score, setScore] = useState<number>(0);

//   const question = vocabularyQuestions[currentQuestion];
//   const progress = Math.round(
//     ((currentQuestion + 1) / vocabularyQuestions.length) * 100
//   );

//   const handleSelectAnswer = (answer: string) => {
//     if (showFeedback) return;
//     setSelectedAnswer(answer);
//   };

//   const handleAction = () => {
//     if (!showFeedback) {
//       if (!selectedAnswer) return;
//       const correct = selectedAnswer === question.correct;
//       setIsCorrect(correct);
//       setShowFeedback(true);
//       if (correct) setScore((prev) => prev + 1);
//     } else {
//       if (currentQuestion < vocabularyQuestions.length - 1) {
//         setCurrentQuestion((prev) => prev + 1);
//         setSelectedAnswer(null);
//         setShowFeedback(false);
//         setIsCorrect(false);
//       } else {
//         alert(`훈련 완료! 점수: ${score}/${vocabularyQuestions.length}`);
//         navigate("/home");
//       }
//     }
//   };

//   const handleClose = () => {
//     navigate("/home");
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

//       {/* Main Content */}
//       <div className="flex-1 flex items-center justify-center p-6">
//         <div className="w-full max-w-2xl">
//           {/* Title */}
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">
//             단어 훈련
//           </h1>
//           <p className="text-center text-lg text-gray-700 mb-8">
//             한국어 뜻에 맞는 영어 단어를 선택하세요
//           </p>

//           {/* Korean card */}
//           <div className="flex justify-center mb-10">
//             <div className="bg-white border-2 border-gray-200 rounded-3xl px-12 py-8 shadow-sm">
//               <span className="text-5xl sm:text-6xl font-bold text-gray-800">
//                 {question.korean}
//               </span>
//             </div>
//           </div>

//           {/* Options */}
//           <div className="space-y-3 mb-8">
//             {question.options.map((option, idx) => {
//               const isSelected = selectedAnswer === option;
//               const isAnswer = option === question.correct;

//               let optionClass = "border-gray-300 bg-white hover:bg-gray-50";
//               if (showFeedback) {
//                 if (isSelected && isCorrect)
//                   optionClass = "border-green-500 bg-green-50";
//                 else if (isSelected && !isCorrect)
//                   optionClass = "border-rose-500 bg-rose-50";
//                 else if (!isSelected && isAnswer && !isCorrect)
//                   optionClass = "border-green-500 bg-green-50";
//               } else if (isSelected) {
//                 optionClass = "border-sky-400 bg-sky-50";
//               }

//               return (
//                 <button
//                   key={idx}
//                   type="button"
//                   onClick={() => handleSelectAnswer(option)}
//                   disabled={showFeedback}
//                   className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${optionClass} ${
//                     showFeedback
//                       ? "cursor-not-allowed"
//                       : "cursor-pointer active:scale-[0.98]"
//                   }`}
//                 >
//                   <div className="flex items-center gap-4">
//                     <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-semibold text-sm">
//                       {idx + 1}
//                     </span>
//                     <span className="text-lg font-medium text-gray-800">
//                       {option}
//                     </span>

//                     {showFeedback && isSelected && isCorrect && (
//                       <span className="ml-auto text-green-600 font-bold">
//                         ✓
//                       </span>
//                     )}
//                     {showFeedback && isSelected && !isCorrect && (
//                       <span className="ml-auto text-rose-600 font-bold">✕</span>
//                     )}
//                     {showFeedback && !isSelected && isAnswer && !isCorrect && (
//                       <span className="ml-auto text-green-600 font-bold">
//                         ✓
//                       </span>
//                     )}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>

//           {/* Unified Action Button */}
//           <div className="flex justify-center">
//             <button
//               onClick={handleAction}
//               disabled={!selectedAnswer && !showFeedback}
//               type="button"
//               className={`w-full sm:w-auto sm:min-w-[200px] py-4 px-8 rounded-2xl font-bold text-lg transition-all ${
//                 showFeedback
//                   ? isCorrect
//                     ? "bg-green-500 text-white hover:bg-green-600"
//                     : "bg-rose-500 text-white hover:bg-rose-600"
//                   : selectedAnswer
//                   ? "bg-rose-500 text-white hover:bg-rose-600"
//                   : "bg-gray-200 text-gray-400 cursor-not-allowed"
//               }`}
//             >
//               {showFeedback ? "계속하기" : "확인"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Feedback Banner */}
//       {showFeedback && (
//         <div
//           className={`fixed bottom-0 left-0 right-0 ${
//             isCorrect
//               ? "bg-green-100 border-t-4 border-green-500"
//               : "bg-rose-100 border-t-4 border-rose-500"
//           }`}
//         >
//           <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
//             <div className="flex items-start gap-4">
//               <div
//                 className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
//                   isCorrect ? "bg-green-500" : "bg-rose-500"
//                 }`}
//               >
//                 {isCorrect ? (
//                   <svg
//                     className="w-6 h-6 sm:w-8 sm:h-8 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={3}
//                       d="M5 13l4 4L19 7"
//                     />
//                   </svg>
//                 ) : (
//                   <svg
//                     className="w-6 h-6 sm:w-8 sm:h-8 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={3}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 )}
//               </div>

//               <div className="flex-1">
//                 <h3
//                   className={`text-xl sm:text-2xl font-bold mb-2 ${
//                     isCorrect ? "text-green-700" : "text-rose-700"
//                   }`}
//                 >
//                   {isCorrect ? "정답!" : "정답:"}
//                 </h3>

//                 {!isCorrect && (
//                   <>
//                     <p className="text-base sm:text-lg text-gray-700 mb-1">
//                       정답:{" "}
//                       <span className="font-medium">{question.correct}</span>
//                     </p>
//                   </>
//                 )}
//                 {isCorrect && (
//                   <p className="text-base sm:text-lg text-green-700">
//                     잘했어요! 다음 문제로 넘어갈게요.
//                   </p>
//                 )}
//               </div>

//               <button
//                 onClick={handleAction}
//                 type="button"
//                 className={`flex-shrink-0 px-6 sm:px-8 py-3 sm:py-4 ${
//                   isCorrect
//                     ? "bg-green-500 hover:bg-green-600"
//                     : "bg-rose-500 hover:bg-rose-600"
//                 } text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold active:scale-95 transition-all`}
//               >
//                 계속하기
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VocabularyTraining;
