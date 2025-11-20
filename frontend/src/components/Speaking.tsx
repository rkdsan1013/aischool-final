// frontend/src/components/Speaking.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Mic, Square, Volume2, Loader2 } from "lucide-react";

// --- [Web Speech API 타입 정의] ---
interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: ISpeechRecognitionAlternative;
  length: number;
}

interface ISpeechRecognitionResultList {
  length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onerror: (event: ISpeechRecognitionErrorEvent) => void;
  onspeechend: () => void;
}

interface IWindow extends Window {
  webkitSpeechRecognition?: {
    new (): ISpeechRecognition;
  };
  SpeechRecognition?: {
    new (): ISpeechRecognition;
  };
}
// -------------------------------

// 침묵 감지 시간: 1.0초
const SILENCE_TIMEOUT_MS = 1000;

function normalizeText(text: string): string {
  if (!text) return "";
  return (
    text
      .toLowerCase()
      .replace(/[.,!?'"]/g, "")
      // cSpell:disable-next-line
      .replace(/\b(i|you|he|she|it|we|they)m\b/g, "$1 am")
      // cSpell:disable-next-line
      .replace(/\b(i|you|he|she|it|we|they)re\b/g, "$1 are")
      // cSpell:disable-next-line
      .replace(/\b(i|you|he|she|it|we|they)ve\b/g, "$1 have")
      // cSpell:disable-next-line
      .replace(/\b(i|you|he|she|it|we|they)ll\b/g, "$1 will")
      // cSpell:disable-next-line
      .replace(/\b(i|you|he|she|it|we|they)d\b/g, "$1 would")
      .replace(/\bcant\b/g, "cannot")
      .replace(/\bdont\b/g, "do not")
      .replace(/\bdoesnt\b/g, "does not")
      .replace(/\bdidnt\b/g, "did not")
      .replace(/\bwont\b/g, "will not")
      .replace(/\bisnt\b/g, "is not")
      .replace(/\barent\b/g, "are not")
      .replace(/\bwasnt\b/g, "was not")
      .replace(/\bwerent\b/g, "were not")
      .replace(/\blets\b/g, "let us")
      .replace(/\s+/g, " ")
      .trim()
  );
}

interface Props {
  prompt: string;
  onRecord: (audioBlob: Blob) => void;
  serverTranscript?: string | null; // [수정] 서버 인식 텍스트 (우선순위 높음)
}

const Speaking: React.FC<Props> = ({ prompt, onRecord, serverTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpokenRef = useRef(false);

  // Prompt 변경 시 상태 초기화
  useEffect(() => {
    setTranscript("");
    setIsRecording(false);
    hasSpokenRef.current = false;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore error
      }
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, [prompt]);

  const promptWords = useMemo(() => prompt.split(" "), [prompt]);

  // [핵심] serverTranscript가 있으면 그것을 정규화해서 비교 기준으로 사용
  const spokenWords = useMemo(() => {
    const sourceText = serverTranscript || transcript;
    const normalized = normalizeText(sourceText);
    return normalized.split(" ").filter((s) => s !== "");
  }, [transcript, serverTranscript]);

  const stopRecordingProcess = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore error
      }
    }
  }, []);

  const stopAndSubmit = useCallback(() => {
    stopRecordingProcess();
    setIsRecording(false);
  }, [stopRecordingProcess]);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    if (hasSpokenRef.current) {
      silenceTimerRef.current = setTimeout(() => {
        console.log("침묵 감지(1초): 녹음 자동 종료");
        stopAndSubmit();
      }, SILENCE_TIMEOUT_MS);
    }
  }, [stopAndSubmit]);

  useEffect(() => {
    return () => stopRecordingProcess();
  }, [stopRecordingProcess]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      const options = { mimeType };
      const recorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: mimeType });
        onRecord(fullBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();

      const currentWindow = window as unknown as IWindow;
      const SpeechRecognitionAPI =
        currentWindow.SpeechRecognition ||
        currentWindow.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
          hasSpokenRef.current = true;
          resetSilenceTimer();

          const resultsArray = Array.from(
            event.results
          ) as ISpeechRecognitionResult[];
          const currentTranscript = resultsArray
            .map((result) => result[0].transcript)
            .join("");
          setTranscript(currentTranscript);
        };

        recognition.onspeechend = () => {
          // 종료 감지
        };

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
          if (event.error === "no-speech") {
            return;
          }
          console.warn("Speech Recognition Error:", event.error);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        console.warn("Web Speech API not supported in this browser.");
      }

      setIsRecording(true);
      setTranscript("");
      hasSpokenRef.current = false;
    } catch (err) {
      console.error("Mic Error:", err);
      alert("마이크 권한이 필요하거나 지원하지 않는 브라우저입니다.");
    }
  }, [onRecord, resetSilenceTimer]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopAndSubmit();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopAndSubmit]);

  // 자동 완료 로직 (서버 결과가 없을 때만 작동)
  useEffect(() => {
    if (!isRecording || serverTranscript) return;

    let matchedCount = 0;
    for (const targetWord of promptWords) {
      const normTargetParts = normalizeText(targetWord).split(" ");
      const isMatched = normTargetParts.every((part) =>
        spokenWords.includes(part)
      );
      if (isMatched) matchedCount++;
    }

    if (matchedCount >= promptWords.length && promptWords.length > 0) {
      const timer = setTimeout(() => {
        if (isRecording) stopAndSubmit();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    transcript,
    isRecording,
    promptWords,
    spokenWords,
    stopAndSubmit,
    serverTranscript,
  ]);

  const playTTS = () => {
    const u = new SpeechSynthesisUtterance(prompt);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900">말하기 연습</h1>
        <p className="text-gray-500 mt-1">
          마이크를 켜고 문장을 읽으세요. 문장이 완성되거나 말이 멈추면
          제출됩니다.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[200px] relative">
        <button
          onClick={playTTS}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white border hover:text-rose-500 flex items-center justify-center"
        >
          <Volume2 className="w-5 h-5" />
        </button>

        <div className="text-center text-2xl sm:text-3xl font-semibold text-gray-800 leading-relaxed flex flex-wrap justify-center gap-x-2">
          {promptWords.map((word, i) => {
            const normTarget = normalizeText(word);
            const targetParts = normTarget.split(" ");

            // [수정] isSuccess 강제 처리를 제거하고,
            // serverTranscript 기반의 spokenWords와 정규화 매칭을 수행하여
            // '진짜' 인식된 단어만 하이라이트 처리
            const isMatched = targetParts.every((part) =>
              spokenWords.includes(part)
            );

            return (
              <span
                key={i}
                className={`transition-colors duration-500 ${
                  isMatched ? "text-green-600 scale-105" : "text-gray-400"
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>

        <div className="mt-6 text-sm font-medium text-gray-500 h-6 flex items-center gap-2 justify-center">
          {isRecording && <Loader2 className="w-3 h-3 animate-spin" />}
          {/* serverTranscript가 있으면(채점 완료) 그것을 보여주고, 아니면 실시간 transcript */}
          {serverTranscript ||
            transcript ||
            (isRecording ? "듣고 있습니다..." : "대기 중")}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          onClick={toggleRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isRecording
              ? "bg-red-500 text-white ring-4 ring-red-200 scale-110 animate-pulse"
              : "bg-rose-500 text-white hover:bg-rose-600 hover:scale-105"
          }`}
        >
          {isRecording ? (
            <Square className="w-10 h-10 fill-current" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Speaking;
