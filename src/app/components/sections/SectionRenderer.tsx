import { useState } from 'react';
import type { Section } from '../../types';
import { getYoutubeEmbedUrl, getSectionColorClass } from '../../lib/utils';

interface SectionRendererProps {
  section: Section;
  answer: unknown;
  onAnswer: (value: unknown) => void;
}

export function SectionRenderer({ section, answer, onAnswer }: SectionRendererProps) {
  const colorClass = getSectionColorClass(section.colorTheme);

  return (
    <div
      className={`rounded-xl border border-[#eeeeee] mb-4 ${colorClass}`}
      style={{ padding: '16px' }}
    >
      <SectionContent section={section} answer={answer} onAnswer={onAnswer} />
    </div>
  );
}

function SectionContent({
  section,
  answer,
  onAnswer,
}: SectionRendererProps) {
  const d = section.data;

  switch (section.type) {
    case 'TEXT_BOX':
      return (
        <div
          className="prose max-w-none text-[#111111]"
          dangerouslySetInnerHTML={{ __html: (d.content as string) ?? '' }}
          style={{ lineHeight: 1.7 }}
        />
      );

    case 'IMAGE':
      return (
        <div className="space-y-2">
          {d.url && (
            <img
              src={d.url as string}
              alt={(d.caption as string) || ''}
              className="rounded-xl w-full object-cover"
            />
          )}
          {d.caption && (
            <p className="text-sm text-[#666666] text-center">{d.caption as string}</p>
          )}
        </div>
      );

    case 'YOUTUBE': {
      const embedUrl = getYoutubeEmbedUrl((d.url as string) ?? '');
      if (!embedUrl) return <p className="text-[#999999] text-sm">No video URL provided.</p>;
      return (
        <div className="rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video"
          />
        </div>
      );
    }

    case 'MAPS': {
      if (d.embedUrl) {
        return (
          <div className="rounded-xl overflow-hidden" style={{ height: 220 }}>
            <iframe
              src={d.embedUrl as string}
              className="w-full h-full"
              allowFullScreen
              title="Map"
            />
          </div>
        );
      }
      return (
        <div className="bg-[#f5f5f5] rounded-xl p-4 text-center text-sm text-[#666666]">
          {(d.location as string) || 'Location not specified'}
        </div>
      );
    }

    case 'MULTIPLE_CHOICE': {
      const options = (d.options as { id: string; label: string }[]) ?? [];
      const selected = answer as string | undefined;
      return (
        <div className="space-y-3">
          <p className="text-[#111111]" style={{ fontWeight: 600 }}>
            {d.question as string}
            {section.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onAnswer(selected === opt.id ? undefined : opt.id)}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors"
                style={{
                  borderColor: selected === opt.id ? '#6365b9' : '#eeeeee',
                  background: selected === opt.id ? 'var(--brand-gradient-soft)' : '#ffffff',
                }}
              >
                <span
                  className="flex-shrink-0 rounded-full border-2 flex items-center justify-center"
                  style={{
                    width: 20,
                    height: 20,
                    borderColor: selected === opt.id ? '#6365b9' : '#cccccc',
                  }}
                >
                  {selected === opt.id && (
                    <span
                      className="rounded-full block"
                      style={{ width: 10, height: 10, background: 'var(--brand-gradient)' }}
                    />
                  )}
                </span>
                <span className="text-sm text-[#111111]">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    case 'YES_NO': {
      const ans = answer as boolean | undefined;
      return (
        <div className="space-y-3">
          <p className="text-[#111111]" style={{ fontWeight: 600 }}>
            {d.question as string}
            {section.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <div className="flex gap-3">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => onAnswer(ans === val ? undefined : val)}
                className="flex-1 py-3 rounded-xl border text-sm transition-colors"
                style={{
                  fontWeight: 600,
                  borderColor: ans === val ? '#6365b9' : '#eeeeee',
                  background: ans === val ? 'var(--brand-gradient)' : '#ffffff',
                  color: ans === val ? '#ffffff' : '#111111',
                }}
              >
                {val ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>
      );
    }

    case 'ESSAY': {
      const text = (answer as string) ?? '';
      const maxLen = d.maxLength as number | null;
      return (
        <div className="space-y-2">
          <p className="text-[#111111]" style={{ fontWeight: 600 }}>
            {d.prompt as string}
            {section.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <textarea
            value={text}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={(d.placeholder as string) ?? 'Write your answer here...'}
            maxLength={maxLen ?? undefined}
            rows={4}
            className="w-full border border-[#eeeeee] rounded-xl px-3 py-3 text-sm text-[#111111] outline-none resize-none focus:border-[#6365b9] bg-white"
          />
          {maxLen && (
            <p className="text-xs text-[#666666] text-right">
              {text.length} / {maxLen}
            </p>
          )}
        </div>
      );
    }

    case 'IMAGE_CHOICE': {
      const imgOptions = (d.options as { id: string; imageUrl: string; label: string }[]) ?? [];
      const selected = answer as string | undefined;
      return (
        <div className="space-y-3">
          <p className="text-[#111111]" style={{ fontWeight: 600 }}>
            {d.question as string}
            {section.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {imgOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onAnswer(selected === opt.id ? undefined : opt.id)}
                className="rounded-xl border overflow-hidden transition-all text-left"
                style={{
                  borderColor: selected === opt.id ? '#6365b9' : '#eeeeee',
                  boxShadow: selected === opt.id ? '0 0 0 2px #6365b9' : 'none',
                }}
              >
                {opt.imageUrl ? (
                  <img
                    src={opt.imageUrl}
                    alt={opt.label}
                    className="w-full object-cover"
                    style={{ height: 90 }}
                  />
                ) : (
                  <div
                    className="w-full bg-[#f5f5f5] flex items-center justify-center text-xs text-[#999999]"
                    style={{ height: 90 }}
                  >
                    No image
                  </div>
                )}
                <div
                  className="px-2 py-2 text-xs text-[#111111]"
                  style={{
                    background: selected === opt.id ? 'var(--brand-gradient-soft)' : '#ffffff',
                    fontWeight: selected === opt.id ? 600 : 400,
                  }}
                >
                  {opt.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    case 'UPLOAD_FILE':
      return <UploadFileSection section={section} answer={answer} onAnswer={onAnswer} />;

    default:
      return null;
  }
}

function UploadFileSection({
  section,
  answer,
  onAnswer,
}: SectionRendererProps) {
  const d = section.data;
  const [isDragging, setIsDragging] = useState(false);
  const fileAnswer = answer as { name: string; size: number; type: string; url: string } | undefined;

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      onAnswer({
        name: file.name,
        size: file.size,
        type: file.type,
        url: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <p className="text-[#111111]" style={{ fontWeight: 600 }}>
        {(d.prompt as string) || 'Upload a file'}
        {section.required && <span className="text-red-500 ml-1">*</span>}
      </p>
      {fileAnswer ? (
        <div className="flex items-center gap-3 p-3 border border-[#eeeeee] rounded-xl bg-white">
          <div
            className="flex items-center justify-center rounded-lg brand-gradient-bg-soft text-[#6365b9] flex-shrink-0"
            style={{ width: 40, height: 40 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#111111] truncate" style={{ fontWeight: 500 }}>
              {fileAnswer.name}
            </p>
            <p className="text-xs text-[#666666]">
              {(fileAnswer.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAnswer(undefined)}
            className="text-xs text-[#999999] hover:text-red-500"
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors"
          style={{
            borderColor: isDragging ? '#6365b9' : '#eeeeee',
            background: isDragging ? 'var(--brand-gradient-soft-08)' : '#fafafa',
            padding: '24px',
          }}
        >
          <input
            type="file"
            accept={(d.allowedTypes as string) || undefined}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <svg className="mb-2 text-[#cccccc]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-sm text-[#666666]">Click to upload or drag and drop</p>
          {d.allowedTypes && (
            <p className="text-xs text-[#999999] mt-1">{d.allowedTypes as string}</p>
          )}
          {d.maxSizeMB && (
            <p className="text-xs text-[#999999]">Max {d.maxSizeMB as number}MB</p>
          )}
        </label>
      )}
    </div>
  );
}





