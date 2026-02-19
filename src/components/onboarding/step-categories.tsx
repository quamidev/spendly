"use client";

import { Loader2, Mic, MicOff, Sparkles, Square, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type SuggestedCategory,
  suggestCategoriesFromDescription,
  transcribeAudio,
} from "@/lib/actions/ai";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

interface CategoryWithKeywords {
  name: string;
  keywords: string[];
  reason?: string;
}

interface StepCategoriesProps {
  onNext: () => void;
}

export function StepCategories({ onNext }: StepCategoriesProps) {
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [customKeywords, setCustomKeywords] = useState("");
  const [customCategories, setCustomCategories] = useState<
    CategoryWithKeywords[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Load existing categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const categories = await getCategories();
        setExistingCategories(categories);
      } catch {
        // Silently fail - user just won't see existing categories
      }
      setLoadingExisting(false);
    }
    loadCategories();
  }, []);

  const handleDeleteExisting = async (id: string, name: string) => {
    const result = await deleteCategory(id);
    if (result.success) {
      setExistingCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(`${name} eliminada`);
    } else {
      toast.error(result.error);
    }
  };

  // AI suggestion state
  const [aiDescription, setAiDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCategories, setAiCategories] = useState<SuggestedCategory[]>([]);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const allCategories: CategoryWithKeywords[] = [
    ...aiCategories,
    ...customCategories,
  ];

  const toggleCategory = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) {
      return;
    }

    // Check against existing categories
    const existsInExisting = existingCategories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existsInExisting) {
      toast.error("Esta categoría ya existe");
      return;
    }

    // Check against custom categories and AI suggestions
    const existsInNew =
      customCategories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      ) ||
      aiCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existsInNew) {
      toast.error("Esta categoría ya fue agregada");
      return;
    }

    // Parse keywords from comma-separated string
    const keywords = customKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    setCustomCategories([...customCategories, { name: trimmed, keywords }]);
    setSelected([...selected, trimmed]);
    setCustomCategory("");
    setCustomKeywords("");
  };

  // Voice recording functions
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) {
      return Promise.resolve(null);
    }

    return new Promise<Blob | null>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        for (const track of mediaRecorder.stream.getTracks()) {
          track.stop();
        }
        resolve(audioBlob);
      };

      mediaRecorder.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    });
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      toast.error("No se pudo acceder al micrófono");
    }
  }, [stopRecording]);

  const handleStopAndTranscribe = async () => {
    const audioBlob = await stopRecording();
    if (!audioBlob) {
      return;
    }

    setIsTranscribing(true);

    // Convert to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    const result = await transcribeAudio(base64, "audio/webm");

    setIsTranscribing(false);

    if (result.success && result.data) {
      setAiDescription(result.data.text);
      toast.success("Audio transcrito");
    } else {
      toast.error(result.error ?? "Error al transcribir");
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      for (const track of mediaRecorderRef.current.stream.getTracks()) {
        track.stop();
      }
      mediaRecorderRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const secs = seconds % 60;
    return `0:${secs.toString().padStart(2, "0")}`;
  };

  const handleAiSuggest = async () => {
    if (!aiDescription.trim()) {
      toast.error("Describe cómo usarás la app");
      return;
    }

    setAiLoading(true);
    const result = await suggestCategoriesFromDescription(aiDescription);
    setAiLoading(false);

    if (result.success && result.data) {
      setAiCategories(result.data);
      // Auto-select new AI suggestions
      const newNames = result.data.map((c) => c.name);
      setSelected((prev) => [...new Set([...prev, ...newNames])]);
      toast.success(`${result.data.length} categorías sugeridas`);
    } else {
      toast.error(result.error ?? "Error al generar sugerencias");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const categoriesToCreate = allCategories.filter((c) =>
      selected.includes(c.name)
    );

    for (const category of categoriesToCreate) {
      const result = await createCategory({
        name: category.name,
        keywords: category.keywords,
      });
      if ("error" in result) {
        toast.error(`Error al crear ${category.name}`);
      }
    }

    setLoading(false);
    toast.success("Categorías creadas");
    onNext();
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Categorías de gastos</h2>
        <p className="text-muted-foreground text-sm">
          {existingCategories.length > 0
            ? "Estas son tus categorías actuales. Puedes eliminarlas o agregar más."
            : "Selecciona las categorías que usarás para organizar tus gastos."}
        </p>
      </div>

      {/* Existing Categories */}
      {loadingExisting && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-muted-foreground text-sm">Cargando...</span>
        </div>
      )}
      {!loadingExisting && existingCategories.length > 0 && (
        <div className="space-y-2">
          <Label>Categorías creadas</Label>
          <div className="flex flex-wrap gap-2">
            {existingCategories.map((cat) => (
              <div
                className="flex items-center gap-1 rounded-lg border bg-muted/50 py-1 pr-1 pl-3"
                key={cat.id}
              >
                <span className="text-sm">{cat.name}</span>
                <Button
                  className="size-7"
                  onClick={() => handleDeleteExisting(cat.id, cat.name)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestion Section */}
      <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <Label className="font-medium">Sugerencias con IA</Label>
        </div>
        <p className="text-muted-foreground text-sm">
          Describe cómo usarás la app y te sugeriremos categorías
          personalizadas.
        </p>

        {/* Voice recording UI */}
        {isRecording && (
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border bg-background p-3 sm:gap-4 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
                <div className="relative flex size-8 items-center justify-center rounded-full bg-red-500 sm:size-10">
                  <MicOff className="size-4 text-white sm:size-5" />
                </div>
              </div>
              <span className="font-mono text-base sm:text-lg">
                {formatTime(recordingTime)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleStopAndTranscribe}
                size="sm"
                type="button"
                variant="default"
              >
                <Square className="mr-1 size-3" />
                Detener
              </Button>
              <Button
                onClick={cancelRecording}
                size="sm"
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
        {!isRecording && isTranscribing && (
          <div className="flex items-center justify-center gap-2 rounded-lg border bg-background p-4">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="text-sm">Transcribiendo...</span>
          </div>
        )}
        {!(isRecording || isTranscribing) && (
          <div className="relative">
            <Textarea
              className="min-h-[100px] resize-none bg-background pr-24"
              disabled={aiLoading}
              onChange={(e) => setAiDescription(e.target.value)}
              placeholder="Ej: Soy freelancer de diseño y quiero controlar mis gastos de oficina, software, y proyectos con clientes..."
              value={aiDescription}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button
                className="size-9"
                disabled={aiLoading || isRecording}
                onClick={startRecording}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Mic className="size-4" />
              </Button>
              <Button
                className="size-9"
                disabled={aiLoading || !aiDescription.trim()}
                onClick={handleAiSuggest}
                size="icon"
                type="button"
                variant="ghost"
              >
                {aiLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AI Suggested Categories */}
      {aiCategories.length > 0 && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Sparkles className="size-3 text-primary" />
            Sugerencias personalizadas
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {aiCategories.map((category) => (
              <button
                className="flex cursor-pointer flex-col gap-1 rounded-lg border border-primary/30 p-3 text-left transition-colors hover:bg-muted/50"
                key={category.name}
                onClick={() => toggleCategory(category.name)}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selected.includes(category.name)}
                    onCheckedChange={() => toggleCategory(category.name)}
                  />
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                {category.reason && (
                  <span className="pl-6 text-muted-foreground text-xs">
                    {category.reason}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {customCategories.length > 0 && (
        <div className="space-y-2">
          <Label>Categorías personalizadas</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {customCategories.map((category) => (
              <button
                className="flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                key={category.name}
                onClick={() => toggleCategory(category.name)}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selected.includes(category.name)}
                    onCheckedChange={() => toggleCategory(category.name)}
                  />
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                {category.keywords.length > 0 && (
                  <span className="pl-6 text-muted-foreground text-xs">
                    {category.keywords.join(", ")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            onChange={(e) => setCustomCategory(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && addCustomCategory()
            }
            placeholder="Nombre de la categoría..."
            value={customCategory}
          />
          <Button onClick={addCustomCategory} type="button" variant="outline">
            Agregar
          </Button>
        </div>
        <Input
          onChange={(e) => setCustomKeywords(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && addCustomCategory()
          }
          placeholder="Ej: uber, rappi, starbucks (opcional)"
          value={customKeywords}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={handleSkip} variant="ghost">
          Omitir por ahora
        </Button>
        <Button disabled={loading} onClick={handleSubmit}>
          {loading ? "Creando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
