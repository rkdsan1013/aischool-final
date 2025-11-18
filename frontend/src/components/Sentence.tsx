import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  pointerWithin,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type UniqueIdentifier,
  type DragOverEvent, // DragOverEvent 추가
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  question: string;
  options?: string[];
  selectedOrder?: string[];
  onPick?: (part: string) => void;
  onRemove?: (part: string) => void;
  onReorder?: (order: string[]) => void;
}

const CARD_TEXT_CLASS =
  "text-base font-medium whitespace-nowrap overflow-hidden";

/**
 * SortablePlacedItem
 */
function SortablePlacedItem({
  id,
  value,
  onRemove,
}: {
  id: UniqueIdentifier;
  value: string;
  onRemove?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // 실시간 재정렬 시 부드러운 이동을 위해 transition 유지
  // 공간은 차지하되 보이지 않게 하여(visibility: hidden)
  // 드래그 중인 아이템(Overlay)이 그 자리에 있는 것처럼 느끼게 함
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    visibility: isDragging ? "hidden" : "visible",
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && e.detail > 0 && onRemove) {
      onRemove(String(id));
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      role="listitem"
      aria-label={`선택된 단어 ${value}`}
      // isDragging일 때 스타일 간소화 (Overlay가 시각적 역할 담당)
      className={`flex-none rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 shadow-sm flex items-center select-none cursor-grab active:cursor-grabbing ${
        isDragging ? "z-50" : ""
      }`}
    >
      <div
        className={`inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 ${CARD_TEXT_CLASS}`}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * PoolItem
 */
function PoolItem({
  value,
  onAdd,
  disabled,
}: {
  value: string;
  onAdd: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onAdd()}
      disabled={disabled}
      aria-pressed={disabled}
      className={`flex-none text-left rounded-2xl transition-all duration-200 inline-flex items-center ${
        disabled ? "cursor-not-allowed" : "hover:shadow-md active:scale-95"
      } ${
        disabled
          ? "bg-gray-100 text-gray-400 border border-gray-200"
          : "bg-white border border-gray-200 text-foreground"
      }`}
    >
      <div
        className={`inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 ${CARD_TEXT_CLASS}`}
      >
        {value}
      </div>
    </button>
  );
}

function mapWordsToIds(
  words: string[],
  uniqueOptions: { id: string; word: string }[]
): string[] {
  if (!words || words.length === 0) {
    return [];
  }
  const idPool = [...uniqueOptions];
  const resultIds: string[] = [];

  for (const word of words) {
    const poolIndex = idPool.findIndex((item) => item.word === word);
    if (poolIndex !== -1) {
      const foundItem = idPool.splice(poolIndex, 1)[0];
      resultIds.push(foundItem.id);
    }
  }
  return resultIds;
}

const Sentence: React.FC<Props> = ({
  question,
  options = [],
  selectedOrder = [],
  onPick,
  onRemove,
  onReorder,
}) => {
  const { uniqueOptions, wordMap } = useMemo(() => {
    const map = new Map<string, string>();
    const optionsWithIds = options.map((word, index) => {
      const id = `${word}-${index}`;
      map.set(id, word);
      return { id, word };
    });
    return { uniqueOptions: optionsWithIds, wordMap: map };
  }, [options]);

  const [placedIds, setPlacedIds] = useState<string[]>(() =>
    mapWordsToIds(selectedOrder, uniqueOptions)
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  useEffect(() => {
    setPlacedIds(mapWordsToIds(selectedOrder, uniqueOptions));
  }, [selectedOrder, uniqueOptions]);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleAdd = (id: string) => {
    if (placedIds.includes(id)) return;
    const nextIds = [...placedIds, id];
    setPlacedIds(nextIds);

    const word = wordMap.get(id);
    if (word) {
      onPick?.(word);
    }
    onReorder?.(nextIds.map((pid) => wordMap.get(pid)!));
  };

  const handleRemove = (id: string) => {
    const nextIds = placedIds.filter((p) => p !== id);
    setPlacedIds(nextIds);

    const word = wordMap.get(id);
    if (word) {
      onRemove?.(word);
    }
    onReorder?.(nextIds.map((pid) => wordMap.get(pid)!));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // --- 💡 변경된 부분: onDragOver 구현 ---
  // 드래그하는 도중에 다른 아이템 위로 지나가면 즉시 순서를 바꿉니다.
  // 이로 인해 가변 너비 아이템들이 즉각적으로 재배치되어 레이아웃 깨짐이 방지됩니다.
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    setPlacedIds((items) => {
      const oldIndex = items.indexOf(activeIdStr);
      const newIndex = items.indexOf(overIdStr);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        return arrayMove(items, oldIndex, newIndex);
      }
      return items;
    });
  };

  const handleDragEnd = () => {
    setActiveId(null);
    // DragOver에서 이미 상태가 업데이트되었으므로
    // 여기서는 최종 순서를 부모에게 알리기만 합니다.
    if (placedIds.length > 0) {
      onReorder?.(placedIds.map((id) => wordMap.get(id)!));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          문장 배열하기
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          단어들을 올바른 순서로 배열하여 문장을 완성하세요.
        </p>
      </div>

      <div className="w-full">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
          <span className="text-lg sm:text-xl font-medium text-foreground">
            {question}
          </span>
        </div>
      </div>

      {/* 배열된 단어 영역 */}
      <div
        className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5"
        style={{ touchAction: "none" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-muted-foreground">
            배열된 문장
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver} // DragOver 이벤트 연결
          onDragEnd={handleDragEnd}
        >
          <div
            className="min-h-[88px] sm:min-h-[88px] flex gap-2 py-2"
            role="list"
            style={{ alignItems: "flex-start", overflow: "visible" }}
          >
            <SortableContext items={placedIds} strategy={rectSortingStrategy}>
              <div
                className="flex items-center gap-2"
                style={{ flexWrap: "wrap", alignItems: "center" }}
              >
                {placedIds.length === 0 ? (
                  <div className="flex items-center h-[56px] sm:h-[56px] text-muted-foreground text-sm px-2">
                    아래의 단어를 선택하거나 드래그하여 문장을 만드세요.
                  </div>
                ) : (
                  placedIds.map((id) => (
                    <SortablePlacedItem
                      key={id}
                      id={id}
                      value={wordMap.get(id)!}
                      onRemove={handleRemove}
                    />
                  ))
                )}
                <div aria-hidden style={{ width: 12 }} />
              </div>
            </SortableContext>
          </div>

          <DragOverlay dropAnimation={{ duration: 160 }}>
            {activeId ? (
              <div className="rounded-2xl bg-white border-2 border-rose-400 shadow-lg flex items-center select-none scale-[1.03]">
                <div
                  className={`inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 ${CARD_TEXT_CLASS}`}
                >
                  {wordMap.get(String(activeId)) ?? ""}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 단어 풀 영역 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {uniqueOptions
            .filter(({ id }) => !placedIds.includes(id))
            .map(({ id, word }) => {
              return (
                <PoolItem key={id} value={word} onAdd={() => handleAdd(id)} />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Sentence;
