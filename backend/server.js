const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/cureai')
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.log('❌ MongoDB Connection Error:', err.message));

// Initialize Groq AI (FREE!)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Disease Schema
const diseaseSchema = new mongoose.Schema({
  name: String,
  symptoms: [String],
  prevention: String,
  vaccine: String,
  treatment: String
});

const Disease = mongoose.model('Disease', diseaseSchema);

// Vaccine Schema
const vaccineSchema = new mongoose.Schema({
  name: String,
  ageGroup: String,
  schedule: String,
  description: String
});

const Vaccine = mongoose.model('Vaccine', vaccineSchema);

// Alert Schema
const alertSchema = new mongoose.Schema({
  disease: String,
  location: String,
  severity: { type: String, enum: ['low', 'medium', 'high'] },
  message: String,
  date: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

const Alert = mongoose.model('Alert', alertSchema);

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

// ============= SEED DATABASE =============
app.post('/api/seed', async (req, res) => {
  try {
    await Disease.deleteMany({});
    await Vaccine.deleteMany({});
    await Alert.deleteMany({});
    await User.deleteMany({});
    
    const diseases = [
      {
        name: "dengue",
        symptoms: ["high fever (104°F)", "severe headache", "pain behind eyes", "joint and muscle pain", "rash", "nausea", "vomiting"],
        prevention: "Use mosquito repellent, wear long sleeves, remove standing water, use mosquito nets",
        vaccine: "Dengvaxia (for ages 9-45)",
        treatment: "Rest, hydration, acetaminophen for fever. Avoid aspirin/ibuprofen."
      },
      {
        name: "malaria",
        symptoms: ["fever", "chills", "sweating", "headache", "nausea", "vomiting", "muscle pain"],
        prevention: "Sleep under insecticide-treated nets, use repellents, take antimalarial drugs if traveling",
        vaccine: "RTS,S/AS01 (Mosquirix)",
        treatment: "Antimalarial medications like chloroquine or artemisinin-based combination therapy"
      },
      {
        name: "covid-19",
        symptoms: ["fever", "cough", "shortness of breath", "fatigue", "loss of taste or smell", "sore throat"],
        prevention: "Wear mask, social distancing, hand hygiene, vaccination",
        vaccine: "Covishield, Covaxin, Pfizer, Moderna",
        treatment: "Rest, isolation, symptomatic treatment, seek medical help if severe"
      }
    ];
    
    await Disease.insertMany(diseases);
    
    const vaccines = [
      {
        name: "BCG",
        ageGroup: "At birth",
        schedule: "Single dose",
        description: "Protects against tuberculosis"
      },
      {
        name: "Polio (OPV/IPV)",
        ageGroup: "Birth, 6, 10, 14 weeks",
        schedule: "4 doses",
        description: "Protects against poliomyelitis"
      },
      {
        name: "Pentavalent",
        ageGroup: "6, 10, 14 weeks",
        schedule: "3 doses",
        description: "Protects against diphtheria, tetanus, pertussis, hepatitis B, Hib"
      }
    ];
    
    await Vaccine.insertMany(vaccines);
    
    const alerts = [
      {
        disease: "Dengue",
        location: "Bhubaneswar",
        severity: "high",
        message: "Dengue outbreak reported in Bhubaneswar. 50+ cases in last week."
      },
      {
        disease: "Malaria",
        location: "Mayurbhanj",
        severity: "medium",
        message: "Increased malaria cases in rural areas. Use mosquito nets."
      }
    ];
    
    await Alert.insertMany(alerts);
    
    await User.create({
      username: "admin",
      password: "admin123",
      role: "admin"
    });
    
    res.json({ message: "✅ Database seeded successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET endpoint for easy browser seeding
app.get('/api/seed', async (req, res) => {
  try {
    await Disease.deleteMany({});
    await Vaccine.deleteMany({});
    await Alert.deleteMany({});
    await User.deleteMany({});
    
    const diseases = [
      {
        name: "dengue",
        symptoms: ["high fever (104°F)", "severe headache", "pain behind eyes", "joint and muscle pain", "rash", "nausea", "vomiting"],
        prevention: "Use mosquito repellent, wear long sleeves, remove standing water, use mosquito nets",
        vaccine: "Dengvaxia (for ages 9-45)",
        treatment: "Rest, hydration, acetaminophen for fever. Avoid aspirin/ibuprofen."
      },
      {
        name: "malaria",
        symptoms: ["fever", "chills", "sweating", "headache", "nausea", "vomiting", "muscle pain"],
        prevention: "Sleep under insecticide-treated nets, use repellents, take antimalarial drugs if traveling",
        vaccine: "RTS,S/AS01 (Mosquirix)",
        treatment: "Antimalarial medications like chloroquine or artemisinin-based combination therapy"
      },
      {
        name: "covid-19",
        symptoms: ["fever", "cough", "shortness of breath", "fatigue", "loss of taste or smell", "sore throat"],
        prevention: "Wear mask, social distancing, hand hygiene, vaccination",
        vaccine: "Covishield, Covaxin, Pfizer, Moderna",
        treatment: "Rest, isolation, symptomatic treatment, seek medical help if severe"
      }
    ];
    
    await Disease.insertMany(diseases);
    
    const vaccines = [
      {
        name: "BCG",
        ageGroup: "At birth",
        schedule: "Single dose",
        description: "Protects against tuberculosis"
      },
      {
        name: "Polio (OPV/IPV)",
        ageGroup: "Birth, 6, 10, 14 weeks",
        schedule: "4 doses",
        description: "Protects against poliomyelitis"
      },
      {
        name: "Pentavalent",
        ageGroup: "6, 10, 14 weeks",
        schedule: "3 doses",
        description: "Protects against diphtheria, tetanus, pertussis, hepatitis B, Hib"
      }
    ];
    
    await Vaccine.insertMany(vaccines);
    
    const alerts = [
      {
        disease: "Dengue",
        location: "Bhubaneswar",
        severity: "high",
        message: "Dengue outbreak reported in Bhubaneswar. 50+ cases in last week."
      },
      {
        disease: "Malaria",
        location: "Mayurbhanj",
        severity: "medium",
        message: "Increased malaria cases in rural areas. Use mosquito nets."
      }
    ];
    
    await Alert.insertMany(alerts);
    
    await User.create({
      username: "admin",
      password: "admin123",
      role: "admin"
    });
    
    res.json({ message: "✅ Database seeded successfully! You can now login with admin/admin123" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= GROQ AI-POWERED CHAT API (FREE!) =============
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'english' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📝 User question:', message);
    console.log('🌐 Language:', language);

    // Create system prompt based on language
    let systemPrompt = `You are Cure AI, a professional health assistant created by the Government of Odisha. 
Your role is to provide accurate, helpful health information to rural and semi-urban populations.

IMPORTANT RULES:
1. Always include a disclaimer: "⚠️ This information is for educational purposes only. Please consult a doctor for medical advice."
2. If someone has emergency symptoms (chest pain, difficulty breathing, severe bleeding), advise them to call emergency services immediately.
3. Be helpful, clear, and use simple language that everyone can understand.
4. For medication questions, always say "Consult your doctor before taking any medication."
5. Provide information in a structured, easy-to-read format.`;

    if (language === 'hindi') {
      systemPrompt = `आप Cure AI, एक पेशेवर स्वास्थ्य सहायक हैं जो ओडिशा सरकार द्वारा बनाया गया है।
आपकी भूमिका ग्रामीण और अर्ध-शहरी आबादी को सटीक, उपयोगी स्वास्थ्य जानकारी प्रदान करना है।

महत्वपूर्ण नियम:
1. हमेशा एक अस्वीकरण शामिल करें: "⚠️ यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। कृपया चिकित्सा सलाह के लिए डॉक्टर से परामर्श करें।"
2. अगर किसी को आपातकालीन लक्षण हैं (सीने में दर्द, सांस लेने में कठिनाई, गंभीर रक्तस्राव), तो उन्हें तुरंत आपातकालीन सेवाओं को कॉल करने की सलाह दें।
3. मददगार, स्पष्ट और सरल भाषा का उपयोग करें।
4. दवा के सवालों के लिए, हमेशा कहें "कोई भी दवा लेने से पहले अपने डॉक्टर से सलाह लें।"`;
    } else if (language === 'odia') {
      systemPrompt = `ଆପଣ Cure AI, ଓଡ଼ିଶା ସରକାରଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ଏକ ବୃତ୍ତିଗତ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ।
ଆପଣଙ୍କ ଭୂମିକା ଗ୍ରାମୀଣ ଏବଂ ଅର୍ଦ୍ଧ-ସହରୀ ଜନସଂଖ୍ୟାକୁ ସଠିକ, ଉପଯୋଗୀ ସ୍ୱାସ୍ଥ୍ୟ ସୂଚନା ପ୍ରଦାନ କରିବା।

ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ନିୟମ:
1. ସର୍ବଦା ଏକ ଅସ୍ୱୀକୃତି ଅନ୍ତର୍ଭୁକ୍ତ କରନ୍ତୁ: "⚠️ ଏହି ସୂଚନା କେବଳ ଶିକ୍ଷାଗତ ଉଦ୍ଦେଶ୍ୟ ପାଇଁ। ଦୟାକରି ଡାକ୍ତରୀ ପରାମର୍ଶ ପାଇଁ ଡାକ୍ତରଙ୍କ ସହ ପରାମର୍ଶ କରନ୍ତୁ।"
2. ଯଦି କାହାର ଜରୁରୀକାଳୀନ ଲକ୍ଷଣ ଥାଏ (ଛାତିରେ ଯନ୍ତ୍ରଣା, ଶ୍ୱାସକ୍ରିୟାରେ ଅସୁବିଧା, ଗୁରୁତର ରକ୍ତସ୍ରାବ), ତେବେ ସେମାନଙ୍କୁ ତୁରନ୍ତ ଜରୁରୀକାଳୀନ ସେବାକୁ କଲ୍ କରିବାକୁ ପରାମର୍ଶ ଦିଅନ୍ତୁ।
3. ସହାୟକ, ସ୍ପଷ୍ଟ ଏବଂ ସରଳ ଭାଷା ବ୍ୟବହାର କରନ୍ତୁ।`;
    }

    // Call Groq API with CURRENT working model
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.1-8b-instant", // UPDATED: Current working model
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    
    console.log('✅ Groq Response generated');

    res.json({
      reply,
      language,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Groq Error:', error);
    
    // Fallback response
    res.json({ 
      reply: "I'm having trouble connecting to AI right now. Please try again in a moment.",
      language: req.body.language || 'english',
      timestamp: new Date().toISOString()
    });
  }
});

// Get active alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find({ active: true }).sort({ severity: -1, date: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all diseases
app.get('/api/diseases', async (req, res) => {
  try {
    const diseases = await Disease.find();
    res.json(diseases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vaccine schedule
app.get('/api/vaccines', async (req, res) => {
  try {
    const vaccines = await Vaccine.find();
    res.json(vaccines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    
    if (user) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add new alert
app.post('/api/admin/alerts', async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to check Groq (FREE!)
app.get('/api/test-groq', async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say 'Groq AI is working!' in 4 words"
        }
      ],
      model: "llama-3.1-8b-instant" // UPDATED: Current working model
    });
    res.json({ success: true, reply: completion.choices[0].message.content });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Groq AI powered chatbot ready! (FREE!)`);
});