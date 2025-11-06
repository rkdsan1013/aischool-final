// // src/pages/WritingPage.tsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// type Question = {
//   korean: string;
//   correctAnswers: string[];
//   primaryAnswer: string;
// };

// const questions: Question[] = [
//   {
//     korean: "오늘은 날씨가 추워요!",
//     correctAnswers: [
//       "it is cold today",
//       "it's cold today",
//       "today is cold",
//       "the weather is cold today",
//       "today's weather is cold",
//     ],
//     primaryAnswer: "It's cold today!",
//   },
//   {
//     korean: "나는 영어를 공부하고 있어요.",
//     correctAnswers: [
//       "i am studying english",
//       "i'm studying english",
//       "i am learning english",
//       "i'm learning english",
//       "i study english",
//     ],
//     primaryAnswer: "I'm studying English.",
//   },
//   {
//     korean: "저는 커피를 좋아해요.",
//     correctAnswers: [
//       "i like coffee",
//       "i love coffee",
//       "i enjoy coffee",
//       "i like drinking coffee",
//     ],
//     primaryAnswer: "I like coffee.",
//   },
//   {
//     korean: "그녀는 학생입니다.",
//     correctAnswers: ["she is a student", "she's a student"],
//     primaryAnswer: "She is a student.",
//   },
//   {
//     korean: "우리는 친구예요.",
//     correctAnswers: ["we are friends", "we're friends"],
//     primaryAnswer: "We are friends.",
//   },
// ];

// export default function WritingPage(): React.ReactElement {
//   const navigate = useNavigate();
//   const [currentQuestion, setCurrentQuestion] = useState<number>(0);
//   const [userAnswer, setUserAnswer] = useState<string>("");
//   const [showFeedback, setShowFeedback] = useState<boolean>(false);
//   const [isCorrect, setIsCorrect] = useState<boolean>(false);
//   const [alternativeAnswer, setAlternativeAnswer] = useState<string>("");

//   const question = questions[currentQuestion];
//   const progress = ((currentQuestion + 1) / questions.length) * 100;

//   const normalizeText = (text: string) =>
//     text
//       .toLowerCase()
//       .replace(/[.,!?;:'"]/g, "")
//       .replace(/\s+/g, " ")
//       .trim();

//   const handleCheckAnswer = () => {
//     const normalized = normalizeText(userAnswer);
//     const correct = question.correctAnswers.some(
//       (answer) => normalizeText(answer) === normalized
//     );

//     setIsCorrect(correct);
//     setShowFeedback(true);

//     if (
//       correct &&
//       normalizeText(userAnswer) !== normalizeText(question.primaryAnswer)
//     ) {
//       setAlternativeAnswer(question.primaryAnswer);
//     } else {
//       setAlternativeAnswer("");
//     }
//   };

//   const handleNext = () => {
//     if (currentQuestion < questions.length - 1) {
//       setCurrentQuestion((prev) => prev + 1);
//       setUserAnswer("");
//       setShowFeedback(false);
//       setIsCorrect(false);
//       setAlternativeAnswer("");
//     } else {
//       navigate("/");
//     }
//   };

//   // Header
//   const header = React.createElement(
//     "div",
//     { className: "border-b-2 border-gray-100" },
//     React.createElement(
//       "div",
//       { className: "max-w-4xl mx-auto px-4 sm:px-6 py-4" },
//       React.createElement(
//         "div",
//         { className: "flex items-center gap-3 sm:gap-4" },
//         // Close button
//         React.createElement(
//           "button",
//           {
//             type: "button",
//             onClick: () => navigate("/"),
//             className:
//               "flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors",
//             "aria-label": "닫기",
//           },
//           React.createElement(
//             "svg",
//             {
//               className: "w-5 h-5 sm:w-6 sm:h-6 text-gray-600",
//               fill: "none",
//               viewBox: "0 0 24 24",
//               stroke: "currentColor",
//             },
//             React.createElement("path", {
//               strokeLinecap: "round",
//               strokeLinejoin: "round",
//               strokeWidth: 2,
//               d: "M6 18L18 6M6 6l12 12",
//             })
//           )
//         ),
//         // Progress bar
//         React.createElement(
//           "div",
//           {
//             className:
//               "flex-1 h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden",
//             role: "progressbar",
//             "aria-valuemin": 0,
//             "aria-valuemax": 100,
//             "aria-valuenow": Math.round(progress),
//           },
//           React.createElement("div", {
//             className:
//               "h-full bg-rose-500 transition-all duration-300 ease-out",
//             style: { width: `${progress}%` },
//           })
//         )
//       )
//     )
//   );

//   // Question section
//   const questionSection = React.createElement(
//     "div",
//     { className: "text-center space-y-4 sm:space-y-6" },
//     React.createElement(
//       "h2",
//       { className: "text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900" },
//       "다음 문장을 영어로 작성하세요"
//     ),
//     React.createElement(
//       "div",
//       {
//         className:
//           "inline-block px-6 sm:px-8 py-4 sm:py-6 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl",
//       },
//       React.createElement(
//         "p",
//         {
//           className: "text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900",
//         },
//         question.korean
//       )
//     )
//   );

//   // Answer input
//   const answerInput = React.createElement(
//     "div",
//     { className: "space-y-4 sm:space-y-6" },
//     React.createElement("textarea", {
//       value: userAnswer,
//       onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
//         setUserAnswer(e.target.value),
//       placeholder: "여기에 영어로 작성하세요...",
//       disabled: showFeedback,
//       className:
//         "w-full min-h-[120px] sm:min-h-[140px] px-4 sm:px-6 py-4 sm:py-5 text-base sm:text-lg border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all resize-none disabled:bg-gray-50 disabled:text-gray-600",
//     }),
//     !showFeedback
//       ? React.createElement(
//           "button",
//           {
//             type: "button",
//             onClick: handleCheckAnswer,
//             disabled: !userAnswer.trim(),
//             className:
//               "w-full py-4 sm:py-5 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md",
//           },
//           "확인"
//         )
//       : null
//   );

//   // Main content
//   const mainContent = React.createElement(
//     "div",
//     { className: "max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12" },
//     React.createElement(
//       "div",
//       { className: "space-y-8 sm:space-y-12" },
//       questionSection,
//       answerInput
//     )
//   );

//   // Feedback banner
//   const feedbackBanner = showFeedback
//     ? React.createElement(
//         "div",
//         {
//           className:
//             `fixed bottom-0 left-0 right-0 ` +
//             (isCorrect
//               ? "bg-green-50 border-t-4 border-green-500"
//               : "bg-rose-50 border-t-4 border-rose-500"),
//         },
//         React.createElement(
//           "div",
//           { className: "max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" },
//           React.createElement(
//             "div",
//             { className: "flex items-start gap-4 sm:gap-6" },
//             // Icon
//             React.createElement(
//               "div",
//               {
//                 className:
//                   `flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ` +
//                   (isCorrect ? "bg-green-500" : "bg-rose-500"),
//               },
//               isCorrect
//                 ? React.createElement(
//                     "svg",
//                     {
//                       className: "w-7 h-7 sm:w-8 sm:h-8 text-white",
//                       fill: "none",
//                       viewBox: "0 0 24 24",
//                       stroke: "currentColor",
//                     },
//                     React.createElement("path", {
//                       strokeLinecap: "round",
//                       strokeLinejoin: "round",
//                       strokeWidth: 3,
//                       d: "M5 13l4 4L19 7",
//                     })
//                   )
//                 : React.createElement(
//                     "svg",
//                     {
//                       className: "w-7 h-7 sm:w-8 sm:h-8 text-white",
//                       fill: "none",
//                       viewBox: "0 0 24 24",
//                       stroke: "currentColor",
//                     },
//                     React.createElement("path", {
//                       strokeLinecap: "round",
//                       strokeLinejoin: "round",
//                       strokeWidth: 3,
//                       d: "M6 18L18 6M6 6l12 12",
//                     })
//                   )
//             ),
//             // Feedback content
//             React.createElement(
//               "div",
//               { className: "flex-1 min-w-0" },
//               React.createElement(
//                 "h3",
//                 {
//                   className:
//                     `text-xl sm:text-2xl font-bold mb-2 ` +
//                     (isCorrect ? "text-green-700" : "text-rose-700"),
//                 },
//                 isCorrect ? "정답!" : "정답:"
//               ),
//               !isCorrect
//                 ? React.createElement(
//                     "p",
//                     { className: "text-base sm:text-lg text-gray-700 mb-1" },
//                     question.primaryAnswer
//                   )
//                 : null,
//               isCorrect && alternativeAnswer
//                 ? React.createElement(
//                     "p",
//                     { className: "text-base sm:text-lg text-green-700" },
//                     React.createElement(
//                       "span",
//                       { className: "font-semibold" },
//                       alternativeAnswer
//                     ),
//                     " 도 있어요!"
//                   )
//                 : null
//             ),
//             // Continue button
//             React.createElement(
//               "button",
//               {
//                 type: "button",
//                 onClick: handleNext,
//                 className:
//                   `flex-shrink-0 px-6 sm:px-8 py-3 sm:py-4 ` +
//                   (isCorrect
//                     ? "bg-green-500 hover:bg-green-600"
//                     : "bg-rose-500 hover:bg-rose-600") +
//                   " text-white text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md",
//               },
//               "계속하기"
//             )
//           )
//         )
//       )
//     : null;

//   return React.createElement(
//     "div",
//     { className: "min-h-screen bg-white" },
//     header,
//     mainContent,
//     feedbackBanner
//   );
// }
