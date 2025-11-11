// src/components/Sentence.tsx
import React, { useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy, // 수평 정렬 전략 사용
} from "@dnd-kit/sortable"; // 오타 수정
import { CSS } from "@dnd-kit/utilities"; // 오타 수정
// import { GripVertical, X } from "lucide-react"; // 아이콘이 제거되었으므로 임포트 필요 없음

interface Props {
  question: string;
  options?: string[];
  selectedOrder?: string[];
  onPick?: (part: string) => void;
  onRemove?: (part: string) => void;
  onReorder?: (order: string[]) => void;
  onReset?: () => void;
}

// 드래그 가능한 아이템
function SortablePlacedItem({
  id,
  value,
  onRemove,
}: {
  id: UniqueIdentifier;
  value: string;
  onRemove?: (v: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    zIndex: isDragging ? 40 : undefined,
    userSelect: "none", // 텍스트 선택 방지
    WebkitUserSelect: "none",
  };

  // 드래그가 아닌 실제 클릭 시에만 onRemove 호출
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // e.detail > 0: 실제 마우스 클릭인지 확인
    if (!isDragging && e.detail > 0 && onRemove) {
      onRemove(String(value));
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // DnD 속성과 리스너를 카드 전체에 적용
      {...attributes}
      {...listeners}
      // 클릭 핸들러 추가
      onClick={handleClick}
      className={`flex-shrink-0 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-700 shadow-sm flex items-center select-none cursor-grab active:cursor-grabbing ${
        isDragging ? "shadow-lg scale-[1.03] z-50" : ""
      }`}
      role="listitem"
      aria-label={`선택된 단어 ${value}`}
    >
      {/* 아이콘 제거, 텍스트에 패딩 추가 */}
      <div className="p-3 sm:p-4 text-base font-medium whitespace-pre">
        {value}
      </div>
    </div>
  );
}

// 단어 풀 아이템
function PoolItem({
  value,
  onAdd,
  disabled,
}: {
  value: string;
  onAdd: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onAdd(value)}
      disabled={disabled}
      aria-pressed={disabled}
      className={`flex-shrink-0 items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl transition-all duration-300 whitespace-pre ${
        disabled
          ? "bg-gray-100 text-gray-400 opacity-70 cursor-not-allowed border-2 border-gray-200"
          : "bg-card border-2 border-gray-200 text-foreground text-base font-medium hover:border-rose-400 hover:shadow-md active:scale-95"
      }`}
    >
      {value}
    </button>
  );
}

const Sentence: React.FC<Props> = ({
  question,
  options = [],
  selectedOrder = [],
  onPick,
  onRemove,
  onReorder,
  onReset,
}) => {
  const [placed, setPlaced] = React.useState<string[]>(() =>
    selectedOrder ? selectedOrder.slice() : []
  );
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const mountedRef = useRef(false);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 }, // 터치 드래그 민감도
    }),
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }) // 마우스 드래그 민감도
  );

  useEffect(() => {
    if (!mountedRef.current) {
      setPlaced(selectedOrder ? selectedOrder.slice() : []);
      mountedRef.current = true;
      return;
    }
    setPlaced(selectedOrder ? selectedOrder.slice() : []);
  }, [selectedOrder]);

  const handleAdd = (word: string) => {
    if (placed.includes(word)) return;
    const next = [...placed, word];
    setPlaced(next);
    onPick?.(word);
    onReorder?.(next);
  };

  const handleRemove = (word: string) => {
    const next = placed.filter((p) => p !== word);
    setPlaced(next);
    onRemove?.(word);
    onReorder?.(next);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    const oldIndex = placed.indexOf(activeIdStr);
    const newIndex = placed.indexOf(overIdStr);
    if (oldIndex === -1 || newIndex === -1) return;
    if (oldIndex !== newIndex) {
      const next = arrayMove(placed, oldIndex, newIndex);
      setPlaced(next);
      onReorder?.(next);
    }
  };

  const handleReset = () => {
    setPlaced([]);
    onReset?.();
    onReorder?.([]);
  };

  const pool = options.slice();

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 제목 및 설명 */}
      <div className="text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          문장 배열하기
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          단어들을 올바른 순서로 배열하여 문장을 완성하세요.
        </p>
      </div>

      {/* 문제 카드 */}
      <div className="w-full">
        <div className="bg-card border-2 border-gray-200 rounded-2xl p-5 sm:p-6">
          <span className="text-lg sm:text-xl font-medium text-foreground">
            {question}
          </span>
        </div>
      </div>

      {/* 선택된 순서 (드래그 영역) */}
      <div
        className="bg-card border-2 border-gray-200 rounded-2xl p-4 sm:p-5"
        style={{ touchAction: "none" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-muted-foreground">
            배열된 문장
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-muted-foreground hover:text-rose-500 transition-colors"
          >
            초기화
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={placed}
            strategy={horizontalListSortingStrategy} // 수평 정렬
          >
            <div
              className="min-h-[60px] sm:min-h-[72px] flex flex-wrap gap-2"
              role="list"
            >
              {placed.length === 0 ? (
                <div className="flex items-center h-[60px] sm:h-[72px] text-muted-foreground text-sm">
                  아래의 단어를 선택하거나 드래그하여 문장을 만드세요.
                </div>
              ) : (
                placed.map((part) => (
                  <SortablePlacedItem
                    key={part}
                    id={part}
                    value={part}
                    onRemove={handleRemove}
                  />
                ))
              )}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 160 }}>
            {activeId ? (
              // DragOverlay에서도 아이콘 제거
              <div className="rounded-xl bg-white border-2 border-rose-400 shadow-lg flex items-center select-none scale-[1.03]">
                <div className="p-3 sm:p-4 text-base font-medium text-foreground whitespace-pre">
                  {String(activeId)}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 단어 풀 */}
      <div className="bg-card border-2 border-gray-200 rounded-2xl p-4 sm:p-5">
        <span className="text-sm font-semibold text-muted-foreground mb-3 block">
          단어 목록
        </span>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {pool.map((part, idx) => {
            const disabled = placed.includes(part);
            return (
              <PoolItem
                key={`${part}-${idx}`}
                value={part}
                onAdd={handleAdd}
                disabled={disabled}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sentence;
