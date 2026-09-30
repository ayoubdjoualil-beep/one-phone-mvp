import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Google GenAI on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Orders local backup storage file
const ORDERS_BACKUP_FILE = path.join(__dirname, '.orders_backup.json');

function readBackupOrders() {
  try {
    if (fs.existsSync(ORDERS_BACKUP_FILE)) {
      const data = fs.readFileSync(ORDERS_BACKUP_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading orders backup:', err);
  }
  return [];
}

function writeBackupOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_BACKUP_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing orders backup:', err);
  }
}

// 1. AI Product Description Generator
app.post('/api/ai/describe-product', async (req, res) => {
  try {
    const { title, brand, category, condition, specs, targetAudience } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        description: `جهاز ${title} الأصلي متوفر الآن بمحل ONE phone بوسط مدينة قسنطينة. حالة ممتازة مع ضمان المحل وإمكانية الفحص والتجريب قبل الاستلام. متوفر التوصيل السريع لـ 58 ولاية والدفع عند الاستلام (COD).`
      });
    }

    const prompt = `أنت خبير تسويق إلكتروني ومسؤول مبيعات أول في متجر "ONE phone" المتخصص في بيع الهواتف والحواسيب بقسنطينة، الجزائر.
قم بكتابة وصف تسويقي احترافي، جذاب ومقنع للمشتري الجزائري باللغة العربية (مع استخدام المصطلحات التقنية المعتادة في الجزائر مثل caba, sous emballage, garantie, état neuf).

معلومات المنتج:
- اسم الجهاز: ${title}
- الماركة: ${brand || ''}
- الفئة: ${category || 'هواتف / حواسيب'}
- الحالة: ${condition === 'new' ? 'جديد كرتونة مغلق (Sous emballage)' : 'كابا أصلي نقي جداً 10/10 بدون أي خدش'}
- المواصفات المتوفرة: ${JSON.stringify(specs || {})}
- الجمهور المستهدف: ${targetAudience || 'المستخدم اليومي، الطلبة، عشاق الألعاب والمحترفين'}

الشروط الإلزامية في الوصف:
1. عنوان فرعي ملفت.
2. فقرة تسويقية تبرز قوة الأداء ونقاء الجهاز وجودة البطارية.
3. نقاط قوة الجهاز بأسلوب مرتب ومقنع.
4. طمأنة الزبون: ضمان المحل (Garantie)، إمكانية المعاينة بالمحل في قسنطينة (شارع فرنسا)، والتوصيل السريع لـ 58 ولاية مع ميزة فحص الجهاز قبل الدفع عند الاستلام.
اجعل النص مهنياً وبدون مبالغة زائفة.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const description = response.text || '';
    return res.json({ description });
  } catch (error: any) {
    console.error('Gemini describe-product error:', error);
    return res.status(500).json({
      error: 'فشل توليد الوصف بالذكاء الاصطناعي',
      details: error.message
    });
  }
});

// 2. Multimodal AI Specs Extractor from Device Photo / Label
app.post('/api/ai/extract-specs', async (req, res) => {
  try {
    const { imageBase64, mimeType, deviceHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'الصورة مطلوبة لاستخراج المواصفات' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        title: deviceHint || 'جهاز إلكتروني (محل ONE phone)',
        brand: 'Apple / HP',
        category: 'phones',
        suggestedPriceDzd: 120000,
        condition: 'new',
        specs: {
          processor: 'معالج عالي الأداء',
          ram: '8GB / 16GB',
          storage: '256GB SSD/NVMe',
          battery: 'بطارية أصلية بحالة ممتازة',
          screen: 'شاشة عالية الدقة'
        },
        marketingSummary: 'تم فحص الجهاز بالمحل، متوفر للمعاينة بقسنطينة مع ضمان وتوصيل 58 ولاية.'
      });
    }

    // Clean base64 header if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `أنت خبير تقني ومتخصص في فحص الهواتف المحمولة وحواسيب اللابتوب في سوق الأجهزة الإلكترونية بالجزائر (محل ONE phone قسنطينة).
قم بتحليل صورة الجهاز أو ملصق العلبة / الشاشة أو الجهاز بدقة، واستخرج المواصفات التقنية الكاملة باللغة العربية والفرنسية (حسب المعتاد في الجزائر).

الملاحظات الإضافية المدخلة من المستخدم: "${deviceHint || 'فحص شامل للجهاز'}".

أجب بتنسيق JSON حصرياً وصارم بدون أي كود ماركداون خارجي، يحتوي على الحقول التالية:
{
  "title": "الاسم الكامل للجهاز باللغة العربية والإنجليزية، مثل: HP Victus 16 Core i7 RTX 4060 أو iPhone 13 128GB Midnight",
  "brand": "اسم الماركة مثل Apple, HP, Asus, Lenovo, Samsung, Dell, Xiaomi",
  "category": "phones" أو "laptops" أو "watches" أو "accessories",
  "condition": "new" أو "caba_pristine",
  "suggestedPriceDzd": رقم السعر التقديري المتداول في السوق الجزائري بالدينار (DZD) كقيمة عددية مثلا 185000,
  "warrantyMonths": مدة الضمان المقترحة بالأشهر مثل 6 أو 12,
  "specs": {
    "processor": "نوع وسرعة المعالج",
    "ram": "حجم ونوع الرام مثل 16GB DDR5",
    "storage": "سعة القرص مثل 512GB SSD NVMe",
    "gpu": "كرت الشاشة المدمج أو المنفصل إن وجد",
    "screen": "حجم وتردد الشاشة مثل 15.6 بوصة 144Hz",
    "battery": "سعة أو صحة البطارية",
    "color": "لون الجهاز"
  },
  "marketingSummary": "فقرة موجزة تسويقية من سطرين تركز على ميزات الجهاز وضمان محل ONE phone بقسنطينة"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType || 'image/jpeg',
          },
        },
        {
          text: promptText,
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawJson = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(rawJson);
    } catch {
      // Fallback regex extraction if needed
      const match = rawJson.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      }
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Gemini extract-specs error:', error);
    return res.status(500).json({
      error: 'فشل استخراج المواصفات من الصورة',
      details: error.message
    });
  }
});

// 3. AI Smart Advisor & Product Recommender
app.post('/api/ai/advisor', async (req, res) => {
  try {
    const { question, budget, usageType, currentProductTitle } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        advice: 'مرحباً بك في ONE phone قسنطينة! بناءً على طلبك، ننصحك باختيار جهاز متوافق مع ميزانيتك، تفضل بزيارة محلنا بوسط المدينة أو تواصل معنا مباشرة عبر الواتساب لتزويدك بصور حية وفيديو للجهاز.'
      });
    }

    const prompt = `أنت "مستشار ONE phone الذكي"، خبير مبيعات ودود وخبير في الهواتف واللابتوبات بمحل ONE phone في قسنطينة، الجزائر.
تتحدث باللغة العربية بأسلوب راقٍ ومفهوم للجزائريين، مع استخدام الأرقام بالدينار الجزائري (دج / مليون سنتيم للتبسيط إذا ناسب).

سؤال أو طلب الزبون: "${question || 'أحتاج نصيحة لشراء جهاز مناسب'}"
الميزانية المقترحة: "${budget || 'غير محددة'}"
نوع الاستخدام: "${usageType || 'عام، دراسة، عمل، أو ألعاب'}"
الجهاز الذي يطالعه الزبون حالياً في المتجر: "${currentProductTitle || 'الرئيسية'}"

قواعد الإجابة:
1. قدم نصيحة موضوعية وتقنية دقيقة (مثال: لماذا كرت RTX 4060 أفضل من RTX 3050 للمهندسين، أو الفرق في الكاميرا والبطارية بين الآيفون والسامسونج).
2. اقترح عليه الأنسب بين تشكيلة المحل (HP Victus, Asus TUF, Lenovo Legion, MacBooks, iPhone 13/15 Pro Max, Galaxy S24 Ultra).
3. ذكره بأن جميع الأجهزة متوفرة في المحل بقسنطينة مع إمكانية التجريب والشحن السريع لـ 58 ولاية مع الدفع عند الاستلام.
4. أنهِ رسالتك بدعوة للتواصل عبر الواتساب للحصول على فيديو حي للجهاز أو حجز الطلب.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ advice: response.text || '' });
  } catch (error: any) {
    console.error('Gemini advisor error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. Local orders backup API
app.post('/api/orders/backup', (req, res) => {
  const order = req.body;
  if (!order || !order.customerName) {
    return res.status(400).json({ error: 'بيانات الطلب غير صالحة' });
  }
  const orders = readBackupOrders();
  orders.unshift({ ...order, backupSavedAt: new Date().toISOString() });
  writeBackupOrders(orders);
  return res.json({ success: true, count: orders.length });
});

app.get('/api/orders/backup', (req, res) => {
  const orders = readBackupOrders();
  return res.json(orders);
});

// Configure Vite middleware or static serving
async function setupServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ONE phone Constantine server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (process.env.VERCEL !== '1') {
  setupServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
