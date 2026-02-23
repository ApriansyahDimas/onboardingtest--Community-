import { useState, type ChangeEvent } from 'react';
import { Trash2, GripVertical, ChevronDown } from 'lucide-react';
import type { Section, SectionType, ColorTheme } from '../../types';
import { RichTextEditor } from '../editor/RichTextEditor';
import {
  getYoutubeEmbedUrl,
  generateId,
  getSectionColorClass,
  readFileAsDataUrl,
} from '../../lib/utils';

interface SectionEditorProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

const SECTION_LABELS: Record<SectionType, string> = {
  TEXT_BOX: 'Text Box',
  IMAGE: 'Image',
  YOUTUBE: 'YouTube',
  MAPS: 'Maps',
  MULTIPLE_CHOICE: 'Multiple Choice',
  YES_NO: 'Yes / No',
  ESSAY: 'Essay Field',
  IMAGE_CHOICE: 'Image Choice',
  UPLOAD_FILE: 'Upload File',
};

const COLOR_OPTIONS: { label: string; value: ColorTheme }[] = [
  { label: 'Default', value: 'DEFAULT' },
  { label: 'Primary tint', value: 'PRIMARY_TINT' },
  { label: 'Accent tint', value: 'ACCENT_TINT' },
];

export function SectionEditor({
  section,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
}: SectionEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const updateData = (key: string, value: unknown) => {
    onUpdate({ data: { ...section.data, [key]: value } });
  };

  const colorClass = getSectionColorClass(section.colorTheme);

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border transition-all mb-4 ${colorClass} ${
        isSelected ? 'border-[#7f15a8] shadow-sm' : 'border-[#eeeeee]'
      }`}
      style={{ padding: '16px 16px 12px' }}
    >
      {/* Section header */}
      <div className="flex items-center mb-3">
        <GripVertical size={16} className="text-[#cccccc] mr-2 flex-shrink-0 cursor-grab" />
        <span className="text-xs text-[#666666] flex-1">{SECTION_LABELS[section.type]}</span>

        {/* Required toggle */}
        <label className="flex items-center gap-1 mr-3 cursor-pointer">
          <input
            type="checkbox"
            checked={section.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="rounded"
            style={{ accentColor: '#7f15a8' }}
          />
          <span className="text-xs text-[#666666]">Required</span>
        </label>

        {/* Color picker */}
        <div className="relative mr-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowColorPicker((v) => !v); }}
            className="flex items-center gap-1 text-xs text-[#666666] border border-[#eeeeee] rounded px-2 py-1 bg-white hover:bg-[#fafafa]"
          >
            <span
              className="inline-block rounded-full border border-[#eeeeee]"
              style={{
                width: 10,
                height: 10,
                backgroundColor:
                  section.colorTheme === 'PRIMARY_TINT'
                    ? '#7f15a8'
                    : section.colorTheme === 'ACCENT_TINT'
                    ? '#ffde55'
                    : '#ffffff',
              }}
            />
            Color
            <ChevronDown size={10} />
          </button>
          {showColorPicker && (
            <div
              className="absolute right-0 top-8 z-50 bg-white border border-[#eeeeee] rounded-xl shadow-lg p-2"
              style={{ minWidth: 140 }}
              onClick={(e) => e.stopPropagation()}
            >
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onUpdate({ colorTheme: opt.value });
                    setShowColorPicker(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-2 py-2 rounded-lg hover:bg-[#f5f5f5] text-sm text-[#111111]"
                >
                  <span
                    className="inline-block rounded-full border border-[#eeeeee]"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor:
                        opt.value === 'PRIMARY_TINT'
                          ? '#7f15a8'
                          : opt.value === 'ACCENT_TINT'
                          ? '#ffde55'
                          : '#ffffff',
                    }}
                  />
                  {opt.label}
                  {section.colorTheme === opt.value && (
                    <svg className="ml-auto" width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="#7f15a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded text-[#999999] hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Section-specific editor */}
      <SectionBody section={section} updateData={updateData} />
    </div>
  );
}

function SectionBody({
  section,
  updateData,
}: {
  section: Section;
  updateData: (key: string, value: unknown) => void;
}) {
  const d = section.data;
  const [imageUploadError, setImageUploadError] = useState('');

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploadError('');

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateData('url', dataUrl);
    } catch {
      setImageUploadError('Failed to read image file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleImageChoiceOptionUpload = async (
    optionIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploadError('');

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const imgOptions =
        (d.options as { id: string; imageUrl: string; label: string }[]) ?? [];
      const newOpts = imgOptions.map((o, j) =>
        j === optionIndex ? { ...o, imageUrl: dataUrl } : o
      );
      updateData('options', newOpts);
    } catch {
      setImageUploadError('Failed to read image file.');
    } finally {
      e.target.value = '';
    }
  };

  switch (section.type) {
    case 'TEXT_BOX':
      return (
        <RichTextEditor
          content={(d.content as string) ?? ''}
          onChange={(html) => updateData('content', html)}
        />
      );

    case 'IMAGE':
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-[#eeeeee] bg-white p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm text-white cursor-pointer"
                style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
              >
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              {d.url && (
                <button
                  type="button"
                  onClick={() => updateData('url', '')}
                  className="px-3 py-2 rounded-lg text-sm border border-[#eeeeee] text-[#666666] hover:bg-[#fafafa] transition-colors"
                >
                  Remove image
                </button>
              )}
              <span className="text-xs text-[#999999]">PNG, JPG, WebP</span>
            </div>
          </div>
          {imageUploadError && (
            <p className="text-xs text-red-500">{imageUploadError}</p>
          )}
          {d.url && (
            <img
              src={d.url as string}
              alt="preview"
              className="rounded-lg max-h-48 object-cover w-full"
            />
          )}
          <input
            type="text"
            placeholder="Caption (optional)"
            value={(d.caption as string) ?? ''}
            onChange={(e) => updateData('caption', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#7f15a8]"
          />
        </div>
      );

    case 'YOUTUBE': {
      const embedUrl = getYoutubeEmbedUrl((d.url as string) ?? '');
      return (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="YouTube URL"
            value={(d.url as string) ?? ''}
            onChange={(e) => updateData('url', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#7f15a8]"
          />
          {embedUrl && (
            <div className="rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube preview"
              />
            </div>
          )}
        </div>
      );
    }

    case 'MAPS':
      return (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Location name or Google Maps embed URL"
            value={(d.location as string) ?? ''}
            onChange={(e) => updateData('location', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#7f15a8]"
          />
          <input
            type="text"
            placeholder="Embed URL (iframe src)"
            value={(d.embedUrl as string) ?? ''}
            onChange={(e) => updateData('embedUrl', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#7f15a8]"
          />
          {d.embedUrl && (
            <div className="rounded-lg overflow-hidden" style={{ height: 200 }}>
              <iframe
                src={d.embedUrl as string}
                className="w-full h-full"
                allowFullScreen
                title="Map preview"
              />
            </div>
          )}
        </div>
      );

    case 'MULTIPLE_CHOICE': {
      const options = (d.options as { id: string; label: string }[]) ?? [];
      return (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Question"
            value={(d.question as string) ?? ''}
            onChange={(e) => updateData('question', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] font-medium outline-none focus:border-[#7f15a8]"
          />
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${section.id}`}
                  checked={d.correctOptionId === opt.id}
                  onChange={() => updateData('correctOptionId', opt.id)}
                  title="Mark as correct"
                  style={{ accentColor: '#7f15a8' }}
                />
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => {
                    const newOpts = options.map((o, j) =>
                      j === i ? { ...o, label: e.target.value } : o
                    );
                    updateData('options', newOpts);
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#7f15a8]"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateData('options', options.filter((_, j) => j !== i));
                  }}
                  className="text-[#cccccc] hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              updateData('options', [...options, { id: generateId(), label: '' }])
            }
            className="text-sm text-[#7f15a8] hover:underline"
          >
            + Add option
          </button>
          <p className="text-xs text-[#666666]">Select the radio button next to the correct answer.</p>
        </div>
      );
    }

    case 'YES_NO':
      return (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Question"
            value={(d.question as string) ?? ''}
            onChange={(e) => updateData('question', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] font-medium outline-none focus:border-[#7f15a8]"
          />
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#666666]">Correct answer:</span>
            {[true, false].map((val) => (
              <label key={String(val)} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name={`yesno-${section.id}`}
                  checked={d.correctAnswer === val}
                  onChange={() => updateData('correctAnswer', val)}
                  style={{ accentColor: '#7f15a8' }}
                />
                <span className="text-sm text-[#111111]">{val ? 'Yes' : 'No'}</span>
              </label>
            ))}
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name={`yesno-${section.id}`}
                checked={d.correctAnswer === null}
                onChange={() => updateData('correctAnswer', null)}
                style={{ accentColor: '#7f15a8' }}
              />
              <span className="text-sm text-[#666666]">None</span>
            </label>
          </div>
        </div>
      );

    case 'ESSAY':
      return (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Prompt / question"
            value={(d.prompt as string) ?? ''}
            onChange={(e) => updateData('prompt', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] font-medium outline-none focus:border-[#7f15a8]"
          />
          <input
            type="text"
            placeholder="Placeholder text (optional)"
            value={(d.placeholder as string) ?? ''}
            onChange={(e) => updateData('placeholder', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#666666] outline-none focus:border-[#7f15a8]"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#666666]">Max length:</span>
            <input
              type="number"
              placeholder="None"
              value={(d.maxLength as number) ?? ''}
              onChange={(e) =>
                updateData('maxLength', e.target.value ? Number(e.target.value) : null)
              }
              className="w-24 border border-[#eeeeee] rounded-lg px-3 py-1 text-sm text-[#111111] outline-none focus:border-[#7f15a8]"
            />
          </div>
          <textarea
            disabled
            placeholder={(d.placeholder as string) || 'Write your answer here...'}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#999999] resize-none bg-[#fafafa]"
            rows={3}
          />
        </div>
      );

    case 'IMAGE_CHOICE': {
      const imgOptions = (d.options as { id: string; imageUrl: string; label: string }[]) ?? [];
      return (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Question"
            value={(d.question as string) ?? ''}
            onChange={(e) => updateData('question', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] font-medium outline-none focus:border-[#7f15a8]"
          />
          <div className="grid grid-cols-2 gap-3">
            {imgOptions.map((opt, i) => (
              <div
                key={opt.id}
                className="border border-[#eeeeee] rounded-xl p-2 space-y-2"
              >
                <div className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={`img-correct-${section.id}`}
                    checked={d.correctOptionId === opt.id}
                    onChange={() => updateData('correctOptionId', opt.id)}
                    style={{ accentColor: '#7f15a8' }}
                    title="Mark correct"
                  />
                  <button
                    type="button"
                    onClick={() => updateData('options', imgOptions.filter((_, j) => j !== i))}
                    className="ml-auto text-[#cccccc] hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {opt.imageUrl ? (
                  <img
                    src={opt.imageUrl}
                    alt={opt.label}
                    className="w-full rounded-lg object-cover"
                    style={{ height: 80 }}
                  />
                ) : (
                  <div
                    className="w-full rounded-lg bg-[#f5f5f5] flex items-center justify-center text-xs text-[#999999]"
                    style={{ height: 80 }}
                  >
                    No image
                  </div>
                )}
                <div className="space-y-1">
                  <label
                    className="w-full inline-flex items-center justify-center px-2 py-1.5 rounded text-xs text-white cursor-pointer"
                    style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
                  >
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handleImageChoiceOptionUpload(i, e)}
                    />
                  </label>
                  {opt.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = imgOptions.map((o, j) =>
                          j === i ? { ...o, imageUrl: '' } : o
                        );
                        updateData('options', newOpts);
                      }}
                      className="w-full border border-[#eeeeee] rounded px-2 py-1 text-xs text-[#666666] hover:bg-[#fafafa]"
                    >
                      Remove image
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Label"
                  value={opt.label}
                  onChange={(e) => {
                    const newOpts = imgOptions.map((o, j) =>
                      j === i ? { ...o, label: e.target.value } : o
                    );
                    updateData('options', newOpts);
                  }}
                  className="w-full border border-[#eeeeee] rounded px-2 py-1 text-xs outline-none focus:border-[#7f15a8]"
                />
              </div>
            ))}
          </div>
          {imageUploadError && (
            <p className="text-xs text-red-500">{imageUploadError}</p>
          )}
          <button
            type="button"
            onClick={() =>
              updateData('options', [
                ...imgOptions,
                { id: generateId(), imageUrl: '', label: '' },
              ])
            }
            className="text-sm text-[#7f15a8] hover:underline"
          >
            + Add image option
          </button>
        </div>
      );
    }

    case 'UPLOAD_FILE':
      return (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Prompt / instructions"
            value={(d.prompt as string) ?? ''}
            onChange={(e) => updateData('prompt', e.target.value)}
            className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] font-medium outline-none focus:border-[#7f15a8]"
          />
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-[#666666]">Allowed types</label>
              <input
                type="text"
                placeholder="e.g. .pdf,.jpg (blank = any)"
                value={(d.allowedTypes as string) ?? ''}
                onChange={(e) => updateData('allowedTypes', e.target.value)}
                className="w-full border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#7f15a8]"
              />
            </div>
            <div>
              <label className="text-xs text-[#666666]">Max MB</label>
              <input
                type="number"
                placeholder="10"
                value={(d.maxSizeMB as number) ?? ''}
                onChange={(e) => updateData('maxSizeMB', Number(e.target.value))}
                className="w-20 border border-[#eeeeee] rounded-lg px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#7f15a8]"
              />
            </div>
          </div>
          <div className="border-2 border-dashed border-[#eeeeee] rounded-xl p-4 text-center text-sm text-[#999999]">
            File upload area preview
          </div>
        </div>
      );

    default:
      return null;
  }
}


