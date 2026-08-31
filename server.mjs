import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloudinary Configuration Helper
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName.trim().replace(/^["']|["']$/g, ''),
      api_key: apiKey.trim().replace(/^["']|["']$/g, ''),
      api_secret: apiSecret.trim().replace(/^["']|["']$/g, '')
    });
  }
};

const uploadDir = os.tmpdir();
const upload = multer({ dest: uploadDir, limits: { fileSize: 1024 * 1024 * 500 } });

// MongoDB Atlas Connection for Live Synchronization
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) return null;

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const dbName = mongoUri.includes('/')
      ? (mongoUri.split('/').pop()?.split('?')[0] || 'sahityotsav')
      : 'sahityotsav';
    cachedDb = client.db(dbName);
    console.log(`[Public API Server] Connected to MongoDB Atlas database: "${dbName}"`);
    return cachedDb;
  } catch (err) {
    console.error("[Public API Server] MongoDB Atlas connection error:", err.message);
    return null;
  }
}

// Helper to fetch live collection from MongoDB Atlas
async function getLiveCollection(colName, fallbackDefault = []) {
  try {
    const db = await connectToDatabase();
    if (db) {
      const docs = await db.collection(colName).find({}).toArray();
      if (docs && docs.length > 0) {
        return docs.map(d => {
          const docId = d.id || d._id;
          const { _id, ...rest } = d;
          return { id: docId, ...rest };
        });
      }
      // Check global_state in app_state collection
      const appState = await db.collection('app_state').findOne({ _id: 'global_state' });
      if (appState && Array.isArray(appState[colName]) && appState[colName].length > 0) {
        return appState[colName];
      }
    }
  } catch (e) {
    console.error(`Error fetching live collection ${colName}:`, e.message);
  }
  return fallbackDefault;
}

// Helper to fetch live settings from MongoDB Atlas
async function getLiveSettings(fallbackSettings) {
  try {
    const db = await connectToDatabase();
    if (db) {
      const settingDocs = await db.collection('settings').find({}).toArray();
      const settingsMap = {};
      settingDocs.forEach(doc => {
        if (doc._id) {
          const { _id, ...rest } = doc;
          settingsMap[doc._id] = rest;
        }
      });
      const appState = await db.collection('app_state').findOne({ _id: 'global_state' });
      const baseSettings = appState?.eventSettings || fallbackSettings;
      return {
        ...baseSettings,
        ...(settingsMap.eventSettings || {})
      };
    }
  } catch (e) {
    console.error("Error fetching live settings:", e.message);
  }
  return fallbackSettings;
}

// Enable CORS & HTTP caching headers for optimized asset delivery
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'GET') {
    if (req.url.match(/\.(jpg|jpeg|png|webp|svg|gif|mp4|webm|woff2)$/i)) {
      res.header('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url.startsWith('/api/')) {
      res.header('Cache-Control', 'no-cache');
    }
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// SSF Ninthikal Master Dataset
const ssfDataset = {
  settings: {
    eventTitle: 'Rendezvous Silver Edition',
    sectorName: 'Imam Rabbani Festival',
    eventYear: '2026',
    cutoffDate: '2026-05-01',
    maxIndividualEvents: 3,
    maxGroupEvents: 2,
    registrationOpen: true,
    ssfLogoUrl: '',
    sahityotsavLogoUrl: '',
    primaryColor: '#002B1D',
    accentColor: '#00FF87',
    numJudges: 2,
    markDecimalPrecision: 2,
    autoRankingEnabled: true,
    maxMarksPerJudge: 100
  },
  categories: [
    { id: 'cat_senior', name: 'Senior', dobStart: '2005-01-01', dobEnd: '2008-12-31', active: true },
    { id: 'cat_junior', name: 'Junior', dobStart: '2009-01-01', dobEnd: '2011-12-31', active: true },
    { id: 'cat_subjunior', name: 'Sub-Junior', dobStart: '2012-01-01', dobEnd: '2015-12-31', active: true },
    { id: 'cat_general', name: 'General', dobStart: '2000-01-01', dobEnd: '2026-12-31', active: true }
  ],
  units: [
    { id: 'unit_nekkila', name: 'Nekkila', code: 'NEK', active: true },
    { id: 'unit_muchila', name: 'Muchila', code: 'MCH', active: true },
    { id: 'unit_ninthikal', name: 'Ninthikal', code: 'NIN', active: true },
    { id: 'unit_kamblabettu', name: 'Kamblabettu', code: 'KMB', active: true }
  ],
  competitions: [],
  participants: [],
  teams: [],
  results: [],
  users: [
    { id: 'usr_admin', fullName: 'Dr. Rashid Ahmad', username: 'admin', role: 'super_admin', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  auditLogs: []
};

// SSF Sector Endpoints
app.get('/api/dashboard-stats', async (req, res) => {
  const participants = await getLiveCollection('participants', ssfDataset.participants);
  const competitions = await getLiveCollection('competitions', ssfDataset.competitions);
  const results = await getLiveCollection('results', ssfDataset.results);
  const teams = await getLiveCollection('teams', ssfDataset.teams);
  const units = await getLiveCollection('units', ssfDataset.units);
  const categories = await getLiveCollection('categories', ssfDataset.categories);

  const totalParticipants = participants.length;
  const totalCompetitions = competitions.length;
  const resultsEntered = results.length;

  res.json({
    totalParticipants,
    totalCompetitions,
    individualRegistrations: totalParticipants,
    groupTeamsCount: teams.length,
    resultsEntered,
    resultsPending: Math.max(0, totalCompetitions - resultsEntered),
    leadingUnit: null,
    topIndividual: null,
    topIndividualOnStage: null,
    topIndividualOffStage: null,
    participantsByUnit: units.map(u => ({
      unitId: u.id,
      unitName: u.name,
      count: participants.filter(p => p.unitId === u.id).length
    })),
    participantsByCategory: categories.map(c => ({
      categoryId: c.id,
      categoryName: c.name,
      count: participants.filter(p => p.selectedCategoryId === c.id).length
    })),
    recentRegistrations: [],
    recentResults: results.slice(-5)
  });
});

app.get('/api/categories', async (req, res) => res.json(await getLiveCollection('categories', ssfDataset.categories)));
app.get('/api/units', async (req, res) => res.json(await getLiveCollection('units', ssfDataset.units)));
app.get('/api/competitions', async (req, res) => res.json(await getLiveCollection('competitions', ssfDataset.competitions)));
app.get('/api/participants', async (req, res) => res.json(await getLiveCollection('participants', ssfDataset.participants)));
app.get('/api/teams', async (req, res) => res.json(await getLiveCollection('teams', ssfDataset.teams)));
app.get('/api/results', async (req, res) => res.json(await getLiveCollection('results', ssfDataset.results)));
app.get('/api/settings', async (req, res) => res.json(await getLiveSettings(ssfDataset.settings)));
app.get('/api/users', async (req, res) => res.json(await getLiveCollection('users', ssfDataset.users)));
app.get('/api/audit-logs', async (req, res) => res.json(await getLiveCollection('auditLogs', ssfDataset.auditLogs)));
app.get('/api/registrations', async (req, res) => res.json(await getLiveCollection('registrations', [])));

// PUBLIC ALIAS ENDPOINTS
app.get('/api/public/results', async (req, res) => res.json(await getLiveCollection('results', ssfDataset.results)));
app.get('/api/public/settings', async (req, res) => res.json(await getLiveSettings(ssfDataset.settings)));
app.get('/api/public/categories', async (req, res) => res.json(await getLiveCollection('categories', ssfDataset.categories)));
app.get('/api/public/units', async (req, res) => res.json(await getLiveCollection('units', ssfDataset.units)));
app.get('/api/public/competitions', async (req, res) => res.json(await getLiveCollection('competitions', ssfDataset.competitions)));
app.get('/api/public/standings', async (req, res) => res.json(await getLiveCollection('scoreboard', [])));

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  res.json({
    message: 'Logged in successfully',
    token: `jwt-token-${Date.now()}`,
    user: {
      id: 'usr_admin',
      fullName: 'Dr. Rashid Ahmad',
      username: username || 'admin',
      role: 'super_admin'
    }
  });
});

app.get('/api/auth/session', (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: 'usr_admin',
      fullName: 'Dr. Rashid Ahmad',
      username: 'admin',
      role: 'super_admin'
    }
  });
});

// REST API v1 ROUTES FOR OTHER WORKSPACE MODULES
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ONLINE', version: '2.5.0-Enterprise', timestamp: new Date().toISOString() });
});

app.get('/api/v1/participants', async (req, res) => {
  const participants = await getLiveCollection('participants', ssfDataset.participants);
  res.json({ success: true, count: participants.length, data: participants });
});

app.get('/api/v1/programs', async (req, res) => {
  const competitions = await getLiveCollection('competitions', ssfDataset.competitions);
  res.json({ success: true, count: competitions.length, data: competitions });
});

app.get('/api/v1/results', async (req, res) => {
  const results = await getLiveCollection('results', ssfDataset.results);
  res.json({ success: true, count: results.length, data: results });
});

// CLOUDINARY MEDIA UPLOAD ENDPOINTS
app.post('/api/gallery/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image file provided' });
    configureCloudinary();
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'image',
      folder: 'sahityotsav_gallery'
    });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(201).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary gallery upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message || String(err) });
  }
});

app.post('/api/highlights/upload', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No video file provided' });
    configureCloudinary();
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'sahityotsav_videos'
    });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(201).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary video upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message || String(err) });
  }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file provided' });
    configureCloudinary();
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'sahityotsav_uploads'
    });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(201).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message || String(err) });
  }
});

// Start Express Backend Server
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`  HASHLAY FESTIVAL BACKEND ENGINE RUNNING ON PORT ${PORT}`);
    console.log(`=================================================`);
  });
}

export default app;
