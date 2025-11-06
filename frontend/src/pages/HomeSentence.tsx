// // src/pages/HomeSentence.tsx
// import React, { useMemo, useState } from "react";

// // dnd-kit (values)
// import {
//   DndContext,
//   DragOverlay,
//   PointerSensor,
//   MouseSensor,
//   TouchSensor,
//   useSensor,
//   useSensors,
//   closestCenter,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   arrayMove,
//   useSortable,
//   rectSortingStrategy,
// } from "@dnd-kit/sortable";
// import { useDraggable } from "@dnd-kit/core";
// import { CSS } from "@dnd-kit/utilities";

// // dnd-kit (types-only)
// import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

// type Question = { words: string[]; correct: string; translation: string };

// const questions: Question[] = [
//   {
//     words: ["I", "love", "English"],
//     correct: "I love English",
//     translation: "나는 영어를 사랑해요",
//   },
//   {
//     words: ["She", "is", "a", "teacher"],
//     correct: "She is a teacher",
//     translation: "그녀는 선생님이에요",
//   },
//   {
//     words: ["We", "are", "learning", "together"],
//     correct: "We are learning together",
//     translation: "우리는 함께 배우고 있어요",
//   },
//   {
//     words: ["The", "cat", "is", "sleeping"],
//     correct: "The cat is sleeping",
//     translation: "고양이가 자고 있어요",
//   },
//   {
//     words: ["I", "want", "to", "eat", "pizza"],
//     correct: "I want to eat pizza",
//     translation: "나는 피자를 먹고 싶어요",
//   },
// ];

// // Stable id helpers
// const arrangedId = (word: string, i: number) => `arranged-${word}-${i}`;
// const availableId = (word: string, i: number) => `available-${word}-${i}`;

// export default function HomeSentence() {
//   const [currentQuestion, setCurrentQuestion] = useState<number>(0);
//   const [arrangedWords, setArrangedWords] = useState<string[]>([]);
//   const [availableWords, setAvailableWords] = useState<string[]>(
//     [...questions[0].words].sort(() => Math.random() - 0.5)
//   );
//   const [showFeedback, setShowFeedback] = useState<boolean>(false);
//   const [isCorrect, setIsCorrect] = useState<boolean>(false);
//   const [selectedAnswer, setSelectedAnswer] = useState<string>("");

//   // Cross-device sensors
//   const sensors = useSensors(
//     useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
//     useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
//     useSensor(TouchSensor, {
//       activationConstraint: { delay: 120, tolerance: 8 },
//     })
//   );

//   const [activeId, setActiveId] = useState<string | null>(null);

//   const question = questions[currentQuestion];
//   const progress = ((currentQuestion + 1) / questions.length) * 100;

//   const arrangedIds = useMemo(
//     () => arrangedWords.map((w, i) => arrangedId(w, i)),
//     [arrangedWords]
//   );
//   const availableIds = useMemo(
//     () => availableWords.map((w, i) => availableId(w, i)),
//     [availableWords]
//   );

//   const handleCheckAnswer = () => {
//     const userSentence = arrangedWords.join(" ");
//     const correct = userSentence === question.correct;
//     setSelectedAnswer(userSentence);
//     setIsCorrect(correct);
//     setShowFeedback(true);
//   };

//   const handleContinue = () => {
//     if (currentQuestion < questions.length - 1) {
//       const next = currentQuestion + 1;
//       setCurrentQuestion(next);
//       setArrangedWords([]);
//       setAvailableWords(
//         [...questions[next].words].sort(() => Math.random() - 0.5)
//       );
//       setShowFeedback(false);
//       setIsCorrect(false);
//       setSelectedAnswer("");
//       setActiveId(null);
//     } else {
//       alert("훈련 완료!");
//     }
//   };

//   const onDragStart = (event: DragStartEvent) => {
//     setActiveId(String(event.active.id));
//   };

//   const onDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     const activeIdStr = String(active.id);
//     const overIdStr = over ? String(over.id) : null;

//     setActiveId(null);
//     if (!overIdStr) return;

//     const isFromAvailable = activeIdStr.startsWith("available-");
//     const droppedInArranged =
//       overIdStr === "arranged-container" || overIdStr.startsWith("arranged-");

//     if (isFromAvailable && droppedInArranged) {
//       // Move from available -> arranged (insert before hovered item or append)
//       const word = extractWordFromAvailableId(activeIdStr, availableWords);
//       if (!word) return;

//       const targetIndex = computeArrangedTargetIndex(overIdStr, arrangedIds);
//       setArrangedWords((prev) => {
//         const p = [...prev];
//         const insertIndex = targetIndex ?? p.length;
//         p.splice(insertIndex, 0, word);
//         return p;
//       });
//       setAvailableWords((prev) => {
//         const idx = prev.indexOf(word);
//         if (idx < 0) return prev;
//         const p = [...prev];
//         p.splice(idx, 1);
//         return p;
//       });
//       return;
//     }

//     if (!isFromAvailable && droppedInArranged) {
//       // Reorder within arranged — use indices from arrangedIds directly
//       const oldIndex = arrangedIds.indexOf(activeIdStr);
//       const newIndex =
//         computeArrangedTargetIndex(overIdStr, arrangedIds) ?? oldIndex;
//       if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
//         setArrangedWords((prev) => arrayMove(prev, oldIndex, newIndex));
//       }
//       return;
//     }

//     if (!isFromAvailable && overIdStr.startsWith("available-")) {
//       // Move from arranged -> available
//       const oldIndex = arrangedIds.indexOf(activeIdStr);
//       if (oldIndex === -1) return;
//       const word = arrangedWords[oldIndex];
//       setAvailableWords((prev) => [...prev, word]);
//       setArrangedWords((prev) => {
//         const p = [...prev];
//         p.splice(oldIndex, 1);
//         return p;
//       });
//     }
//   };

//   // Helpers
//   function extractWordFromAvailableId(id: string, avail: string[]) {
//     // "available-{word}-{index}" -> last token is index
//     const parts = id.split("-");
//     const indexStr = parts[parts.length - 1];
//     const idx = Number(indexStr);
//     if (Number.isNaN(idx)) return null;
//     return avail[idx] ?? null;
//   }

//   // Compute insertion/reorder target index using hovered id against arrangedIds
//   function computeArrangedTargetIndex(overId: string, ids: string[]) {
//     if (overId === "arranged-container") return ids.length;
//     const idx = ids.indexOf(overId);
//     return idx === -1 ? ids.length : idx;
//   }

//   // Sortable chip (arranged area) — entire block draggable, click 제거/추가는 별도 리스트에서
//   function ArrangedChip({
//     id,
//     label,
//     disabled,
//     index,
//   }: {
//     id: string;
//     label: string;
//     disabled: boolean;
//     index: number;
//   }) {
//     const {
//       attributes,
//       listeners,
//       setNodeRef,
//       transform,
//       transition,
//       isDragging,
//     } = useSortable({ id });
//     const style = {
//       transform: CSS.Transform.toString(transform),
//       transition,
//       touchAction: "none" as React.CSSProperties["touchAction"],
//     };

//     return (
//       <div
//         id={`arranged-${index}`}
//         ref={setNodeRef}
//         style={style}
//         className={`px-4 sm:px-6 py-2 sm:py-3 bg-rose-500 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-medium
//         select-none ${
//           disabled
//             ? "opacity-50 cursor-not-allowed"
//             : "cursor-grab active:cursor-grabbing"
//         }
//         ${isDragging ? "ring-2 ring-rose-400" : ""}`}
//         {...attributes}
//         {...(!disabled ? listeners : {})}
//         onClick={() => {
//           if (showFeedback) return;
//           // 클릭 시 제거 (요구사항 유지)
//           setAvailableWords((prev) => [...prev, label]);
//           setArrangedWords((prev) => {
//             const p = [...prev];
//             p.splice(index, 1);
//             return p;
//           });
//         }}
//       >
//         {label}
//       </div>
//     );
//   }

//   // Draggable chip for available area — entire block draggable, 클릭 시 추가
//   function AvailableChip({
//     id,
//     label,
//     disabled,
//     index,
//   }: {
//     id: string;
//     label: string;
//     disabled: boolean;
//     index: number;
//   }) {
//     const { attributes, listeners, setNodeRef, transform, isDragging } =
//       useDraggable({ id });
//     const style = {
//       transform: CSS.Transform.toString(transform),
//       touchAction: "none" as React.CSSProperties["touchAction"],
//     };

//     return (
//       <div
//         id={`available-${index}`}
//         ref={setNodeRef}
//         style={style}
//         className={`px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl sm:rounded-2xl text-base sm:text-lg font-medium
//         select-none ${
//           disabled
//             ? "opacity-50 cursor-not-allowed"
//             : "hover:border-rose-200 hover:shadow-lg cursor-grab active:cursor-grabbing"
//         }
//         ${isDragging ? "ring-2 ring-rose-400" : ""}`}
//         {...attributes}
//         {...(!disabled ? listeners : {})}
//         onClick={() => {
//           if (showFeedback) return;
//           // 클릭 시 추가 (요구사항 유지)
//           setArrangedWords((prev) => [...prev, label]);
//           setAvailableWords((prev) => {
//             const p = [...prev];
//             const idx = p.indexOf(label);
//             if (idx >= 0) p.splice(idx, 1);
//             return p;
//           });
//         }}
//       >
//         {label}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <div className="border-b-2 border-gray-100">
//         <div className="max-w-4xl mx-auto px-4 py-4">
//           <div className="flex items-center gap-4">
//             <button
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//               aria-label="닫기"
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

//       {/* Content */}
//       <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
//         {/* Question */}
//         <div className="mb-8 sm:mb-12">
//           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">
//             다음 문장을 영어로 배열하세요
//           </h2>
//           <p className="text-xl sm:text-2xl text-gray-700 text-center">
//             {question.translation}
//           </p>
//         </div>

//         <DndContext
//           sensors={sensors}
//           collisionDetection={closestCenter}
//           onDragStart={onDragStart}
//           onDragEnd={onDragEnd}
//         >
//           {/* Arranged (sortable) */}
//           <div className="mb-6" style={{ touchAction: "none" }}>
//             <SortableContext items={arrangedIds} strategy={rectSortingStrategy}>
//               <div
//                 id="arranged-container"
//                 className="min-h-[120px] sm:min-h-[140px] p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl bg-gray-50"
//               >
//                 {arrangedWords.length === 0 ? (
//                   <p className="text-gray-400 text-center text-sm sm:text-base">
//                     단어를 드래그하거나 탭하여 문장을 만드세요
//                   </p>
//                 ) : (
//                   <div className="flex flex-wrap gap-2 sm:gap-3">
//                     {arrangedWords.map((w, i) => (
//                       <ArrangedChip
//                         key={arrangedId(w, i)}
//                         id={arrangedId(w, i)}
//                         label={w}
//                         disabled={showFeedback}
//                         index={i}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </SortableContext>
//           </div>

//           {/* Available (draggable into arranged) */}
//           <div className="mb-6" style={{ touchAction: "none" }}>
//             <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
//               {availableWords.map((w, i) => (
//                 <AvailableChip
//                   key={availableId(w, i)}
//                   id={availableId(w, i)}
//                   label={w}
//                   disabled={showFeedback}
//                   index={i}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Overlay */}
//           <DragOverlay>
//             {activeId ? (
//               <div className="px-4 sm:px-6 py-2 sm:py-3 bg-rose-500 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-medium shadow-xl">
//                 {activeId.startsWith("available-")
//                   ? extractWordFromAvailableId(activeId, availableWords)
//                   : (() => {
//                       const idx = arrangedIds.indexOf(activeId);
//                       return idx === -1 ? "" : arrangedWords[idx];
//                     })()}
//               </div>
//             ) : null}
//           </DragOverlay>
//         </DndContext>

//         {/* Check Button */}
//         {!showFeedback && (
//           <div className="flex justify-center mb-6">
//             <button
//               onClick={handleCheckAnswer}
//               disabled={arrangedWords.length === 0}
//               className="px-8 sm:px-12 py-3 sm:py-4 bg-rose-500 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-rose-600 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
//             >
//               확인
//             </button>
//           </div>
//         )}
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
//                 className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full ${
//                   isCorrect ? "bg-green-500" : "bg-rose-500"
//                 } flex items-center justify-center`}
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
//                       {question.correct}
//                     </p>
//                     {selectedAnswer && (
//                       <p className="text-sm sm:text-base text-gray-500">
//                         내 답변:{" "}
//                         <span className="font-medium">{selectedAnswer}</span>
//                       </p>
//                     )}
//                   </>
//                 )}
//               </div>

//               <button
//                 onClick={handleContinue}
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
// }
