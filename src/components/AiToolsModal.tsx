import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Upload,
  Cpu,
  CheckCircle2,
  Send,
  Bot,
  MessageCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const AiToolsModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, openWhatsAppChat } = useCart();
  const [activeTab, setActiveTab] = useState<'scanner' | 'advisor'>('scanner');

  // Scanner state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [deviceHint, setDeviceHint] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedResult, setExtractedResult] = useState<any | null>(null);
  const [scannerError, setScannerError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advisor state
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [budget, setBudget] = useState('');
  const [usageType, setUsageType] = useState('ألعاب وهندسة (Gaming & Engineering)');
  const [isAdvising, setIsAdvising] = useState(false);
  const [advisorAnswer, setAdvisorAnswer] = useState<string | null>(null);

  if (!isAiModalOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setExtractedResult(null);
      setScannerError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRunScan = async () => {
    if (!imagePreview) {
      setScannerError('يرجى اختيار أو رفع صورة للجهاز أولاً.');
      return;
    }

    setIsScanning(true);
    setScannerError('');
    try {
      const res = await fetch('/api/ai/extract-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType,
          deviceHint: deviceHint.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setExtractedResult(data);
      } else {
        setScannerError(data.error || 'فشل استخراج المواصفات.');
      }
    } catch (err: any) {
      console.error(err);
      setScannerError('تعذر الاتصال بخدمة الذكاء الاصطناعي.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAskAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQuestion.trim()) return;

    setIsAdvising(true);
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: advisorQuestion.trim(),
          budget: budget.trim(),
          usageType
        })
      });
      const data = await res.json();
      setAdvisorAnswer(data.advice || 'عذراً، لم نتمكن من توليد النصيحة حالياً.');
    } catch (err) {
      console.error(err);
      setAdvisorAnswer('تفضل بالاتصال بنا على 0555123456 لنقدم لك الاستشارة المباشرة بمحل قسنطينة!');
    } finally {
      setIsAdvising(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base leading-none">
                مختبر الذكاء الاصطناعي • Google AI Studio
              </h2>
              <span className="text-[11px] text-white/80">
                استخراج المواصفات من صور الأجهزة + المستشار الذكي
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-1 rounded-full hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'scanner'
                ? 'bg-white text-indigo-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4 text-violet-600" />
            <span>ماسح مواصفات الأجهزة بالصور</span>
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'advisor'
                ? 'bg-white text-indigo-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-600" />
            <span>مستشار ONE phone الذكي</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'scanner' ? (
            <div className="space-y-4">
              <div className="bg-violet-50/70 border border-violet-100 rounded-2xl p-3 text-xs text-violet-950">
                <span className="font-bold block mb-0.5">📸 كيف تعمل الأداة؟</span>
                <span>
                  قم برفع صورة لهاتفك أو لابتوبك أو ملصق العلبة (Fiche technique)، وسيقوم نموذج{' '}
                  <strong className="text-violet-700">Gemini 3.8 Flash</strong> باستخراج المعالج، الرام، التخزين، البطارية، والسعر المقترح في السوق الجزائري!
                </span>
              </div>

              {/* Upload Dropzone */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={imagePreview} alt="Device to analyze" className="w-full h-full object-contain" />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setExtractedResult(null);
                    }}
                    className="absolute top-2 left-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-violet-500 rounded-2xl p-6 text-center cursor-pointer transition hover:bg-violet-50/30 space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-gray-800 block">
                      انقر لرفع صورة الجهاز أو ملصق الكرتونة
                    </span>
                    <span className="text-[11px] text-gray-500">
                      يدعم صور الهواتف واللابتوبات بجميع الصيغ (JPG, PNG, WebP)
                    </span>
                  </div>
                </div>
              )}

              {/* Optional Hint */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ملاحظة إضافية (اختياري، مثلاً: HP Victus 16 أو كابا نقي):
                </label>
                <input
                  type="text"
                  value={deviceHint}
                  onChange={(e) => setDeviceHint(e.target.value)}
                  placeholder="مثال: لابتوب تم شراؤه كابا من فرنسا، أو آيفون 13"
                  className="w-full bg-gray-50 text-xs rounded-xl px-3 py-2 border border-gray-200 outline-none focus:border-violet-500"
                />
              </div>

              {scannerError && (
                <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200">
                  {scannerError}
                </div>
              )}

              <button
                onClick={handleRunScan}
                disabled={!imagePreview || isScanning}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Gemini يحلل الصورة ويستخرج المواصفات...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 text-amber-300" />
                    <span>تحليل واستخراج المواصفات بالذكاء الاصطناعي</span>
                  </>
                )}
              </button>

              {/* Extracted Specifications Output */}
              {extractedResult && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{extractedResult.title}</span>
                    </div>
                    {extractedResult.suggestedPriceDzd && (
                      <span className="bg-amber-100 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full font-mono">
                        {Number(extractedResult.suggestedPriceDzd).toLocaleString()} دج
                      </span>
                    )}
                  </div>

                  {extractedResult.specs && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(extractedResult.specs).map(([key, val]) => (
                        <div key={key} className="bg-white p-2 rounded-xl border border-gray-100">
                          <span className="text-gray-400 block text-[10px] capitalize">{key}</span>
                          <span className="font-semibold text-gray-800 line-clamp-1">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {extractedResult.marketingSummary && (
                    <p className="text-xs text-gray-700 leading-relaxed bg-white p-2.5 rounded-xl border border-gray-100">
                      {extractedResult.marketingSummary}
                    </p>
                  )}

                  <button
                    onClick={() => openWhatsAppChat(
                      `سلام عليكم محل ONE phone قسنطينة 📱\nلدي جهاز وأريد الاستفسار عن توفره أو تقييمه:\n- الجهاز: ${extractedResult.title}\n- المواصفات المستخرجة: ${JSON.stringify(extractedResult.specs)}\nشكراً!`
                    )}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>إرسال المواصفات لمحل ONE phone عبر الواتساب</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Advisor Tab */
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950">
                <span className="font-bold block mb-0.5">💡 مستشارك التقني المباشر بقسنطينة</span>
                <span>
                  محتار بين جهازين؟ عندك ميزانية محددة (مثلاً 15 مليون) وتريد أفضل خيار لدراستك أو ألعابك؟ اسأل وسيجيبك مستشار ONE phone الذكي فوراً!
                </span>
              </div>

              <form onSubmit={handleAskAdvisor} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ما هو سؤالك أو الجهاز الذي تبحث عنه؟
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={advisorQuestion}
                    onChange={(e) => setAdvisorQuestion(e.target.value)}
                    placeholder="مثال: عندي ميزانية 18 مليون سنتيم، واش تنصحني لابتوب قوي لـ AutoCAD وألعاب مثل GTA و Warzone؟ وهل HP Victus 16 يفي بالغرض؟"
                    className="w-full bg-gray-50 text-xs rounded-xl p-3 border border-gray-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      الميزانية التقريبية:
                    </label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="مثال: 15 إلى 20 مليون دج"
                      className="w-full bg-gray-50 text-xs rounded-xl px-3 py-2 border border-gray-200 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      الاستخدام الأساسي:
                    </label>
                    <select
                      value={usageType}
                      onChange={(e) => setUsageType(e.target.value)}
                      className="w-full bg-gray-50 text-xs rounded-xl px-2 py-2 border border-gray-200 outline-none focus:border-amber-500 font-semibold"
                    >
                      <option value="ألعاب وهندسة (Gaming & Engineering)">ألعاب وهندسة وتصميم</option>
                      <option value="دراسة وجامعة وخفيف">دراسة وجامعة وعمل مكتبي</option>
                      <option value="صناعة محتوى وتصوير ومونتاج">صناعة محتوى وتصوير فوتوغرافي</option>
                      <option value="هاتف يومي بطارية ممتازة">هاتف يومي ببطارية ممتازة</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAdvising || !advisorQuestion.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {isAdvising ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>مستشار ONE phone يفكر ويقارن الأسعار...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 rtl:rotate-180" />
                      <span>الحصول على النصيحة الذكية فوراً</span>
                    </>
                  )}
                </button>
              </form>

              {advisorAnswer && (
                <div className="bg-amber-50/90 rounded-2xl p-4 border border-amber-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                    <Bot className="w-4 h-4 text-amber-700" />
                    <span>إجابة مستشار ONE phone:</span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                    {advisorAnswer}
                  </p>
                  <button
                    onClick={() => openWhatsAppChat(
                      `سلام عليكم محل ONE phone قسنطينة 📱\nلقد استشرت مساعدكم الذكي وأوصاني بالتالي:\n${advisorAnswer.slice(0, 200)}...\n\nهل يمكنني تأكيد الطلب وحجزه لديكم؟`
                    )}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تأكيد الاختيار وحجز الجهاز عبر الواتساب</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
