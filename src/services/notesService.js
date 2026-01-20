import { Op, Sequelize } from 'sequelize';
import { Note, NoteVersion, sequelize } from '../models/index.js';

async function createNote({ userId, title, content }) {
  return sequelize.transaction(async (transaction) => {
    const note = await Note.create({ userId, title, content }, { transaction });
    await NoteVersion.create({
      noteId: note.id,
      version: note.version,
      title: note.title,
      content: note.content,
      createdBy: userId
    }, { transaction });
    return note;
  });
}

async function updateNote({ userId, noteId, title, content, version }) {
  return sequelize.transaction(async (transaction) => {
    const note = await Note.findOne({ where: { id: noteId, userId }, transaction });
    if (!note) {
      return { error: 'NOT_FOUND' };
    }

    if (note.version !== version) {
      return { error: 'CONFLICT', currentVersion: note.version };
    }

    if (title !== undefined) {
      note.title = title;
    }
    if (content !== undefined) {
      note.content = content;
    }

    try {
      await note.save({ transaction });
    } catch (err) {
      if (err.name === 'SequelizeOptimisticLockError') {
        return { error: 'CONFLICT', currentVersion: note.version };
      }
      throw err;
    }

    await NoteVersion.create({
      noteId: note.id,
      version: note.version,
      title: note.title,
      content: note.content,
      createdBy: userId
    }, { transaction });

    return { note };
  });
}

async function revertNote({ userId, noteId, versionId }) {
  return sequelize.transaction(async (transaction) => {
    const note = await Note.findOne({ where: { id: noteId, userId }, transaction });
    if (!note) {
      return { error: 'NOT_FOUND' };
    }

    const versionRecord = await NoteVersion.findOne({
      where: { id: versionId, noteId },
      transaction
    });

    if (!versionRecord) {
      return { error: 'VERSION_NOT_FOUND' };
    }

    note.title = versionRecord.title;
    note.content = versionRecord.content;

    try {
      await note.save({ transaction });
    } catch (err) {
      if (err.name === 'SequelizeOptimisticLockError') {
        return { error: 'CONFLICT', currentVersion: note.version };
      }
      throw err;
    }

    await NoteVersion.create({
      noteId: note.id,
      version: note.version,
      title: note.title,
      content: note.content,
      createdBy: userId
    }, { transaction });

    return { note };
  });
}

async function searchNotes({ userId, query }) {
  const matchLiteral = Sequelize.literal(
    `MATCH (title, content) AGAINST (${sequelize.escape(query)} IN BOOLEAN MODE)`
  );

  return Note.findAll({
    where: {
      [Op.and]: [
        { userId },
        matchLiteral
      ]
    },
    order: [['updatedAt', 'DESC']]
  });
}

export {
  createNote,
  updateNote,
  revertNote,
  searchNotes
};
