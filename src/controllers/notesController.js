import { Note, NoteVersion } from '../models/index.js';
import * as notesService from '../services/notesService.js';
import cacheService from '../services/cacheService.js';

function noteCacheKey(userId, noteId) {
  return `note:${userId}:${noteId}`;
}

function notesListCacheKey(userId) {
  return `notes:${userId}`;
}

async function createNote(req, res) {
  const { title, content } = req.body;
  const note = await notesService.createNote({
    userId: req.user.id,
    title,
    content
  });

  await cacheService.del([notesListCacheKey(req.user.id)]);

  return res.status(201).json(note);
}

async function getNotes(req, res) {
  const cacheKey = notesListCacheKey(req.user.id);
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.json({ data: cached, cached: true });
  }

  const notes = await Note.findAll({
    where: { userId: req.user.id },
    order: [['updatedAt', 'DESC']]
  });

  await cacheService.set(cacheKey, notes);
  return res.json({ data: notes, cached: false });
}

async function getNote(req, res) {
  const noteId = Number(req.params.id);
  const cacheKey = noteCacheKey(req.user.id, noteId);
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.json({ data: cached, cached: true });
  }

  const note = await Note.findOne({ where: { id: noteId, userId: req.user.id } });
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  await cacheService.set(cacheKey, note);
  return res.json({ data: note, cached: false });
}

async function searchNotes(req, res) {
  const { q } = req.query;
  const notes = await notesService.searchNotes({
    userId: req.user.id,
    query: q
  });
  return res.json({ data: notes });
}

async function updateNote(req, res) {
  const noteId = Number(req.params.id);
  const { title, content, version } = req.body;

  const result = await notesService.updateNote({
    userId: req.user.id,
    noteId,
    title,
    content,
    version
  });

  if (result.error === 'NOT_FOUND') {
    return res.status(404).json({ message: 'Note not found' });
  }

  if (result.error === 'CONFLICT') {
    return res.status(409).json({
      message: 'Version conflict. Fetch the latest note before updating.',
      currentVersion: result.currentVersion
    });
  }

  await cacheService.del([notesListCacheKey(req.user.id), noteCacheKey(req.user.id, noteId)]);
  return res.json(result.note);
}

async function deleteNote(req, res) {
  const noteId = Number(req.params.id);
  const note = await Note.findOne({ where: { id: noteId, userId: req.user.id } });
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  await note.destroy();
  await cacheService.del([notesListCacheKey(req.user.id), noteCacheKey(req.user.id, noteId)]);
  return res.status(204).send();
}

async function listVersions(req, res) {
  const noteId = Number(req.params.id);
  const note = await Note.findOne({ where: { id: noteId, userId: req.user.id } });
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  const versions = await NoteVersion.findAll({
    where: { noteId },
    order: [['createdAt', 'DESC']]
  });

  return res.json({ data: versions });
}

async function revertVersion(req, res) {
  const noteId = Number(req.params.id);
  const versionId = Number(req.params.versionId);

  const result = await notesService.revertNote({
    userId: req.user.id,
    noteId,
    versionId
  });

  if (result.error === 'NOT_FOUND') {
    return res.status(404).json({ message: 'Note not found' });
  }

  if (result.error === 'VERSION_NOT_FOUND') {
    return res.status(404).json({ message: 'Version not found' });
  }

  if (result.error === 'CONFLICT') {
    return res.status(409).json({
      message: 'Version conflict. Fetch the latest note before updating.',
      currentVersion: result.currentVersion
    });
  }

  await cacheService.del([notesListCacheKey(req.user.id), noteCacheKey(req.user.id, noteId)]);
  return res.json(result.note);
}

export {
  createNote,
  getNotes,
  getNote,
  searchNotes,
  updateNote,
  deleteNote,
  listVersions,
  revertVersion
};
