import express from 'express';
import { body, param, query } from 'express-validator';
import * as notesController from '../controllers/notesController.js';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  body('title').isString().isLength({ min: 1, max: 255 }),
  body('content').isString().isLength({ min: 1 }),
  validate,
  notesController.createNote
);

router.get('/', notesController.getNotes);

router.get(
  '/search',
  query('q').isString().isLength({ min: 1 }),
  validate,
  notesController.searchNotes
);

router.get('/:id', param('id').isInt({ min: 1 }), validate, notesController.getNote);

router.put(
  '/:id',
  param('id').isInt({ min: 1 }),
  body('version').isInt({ min: 0 }),
  body('title').optional().isString().isLength({ min: 1, max: 255 }),
  body('content').optional().isString().isLength({ min: 1 }),
  validate,
  notesController.updateNote
);

router.delete('/:id', param('id').isInt({ min: 1 }), validate, notesController.deleteNote);

router.get('/:id/versions', param('id').isInt({ min: 1 }), validate, notesController.listVersions);

router.post(
  '/:id/versions/:versionId/revert',
  param('id').isInt({ min: 1 }),
  param('versionId').isInt({ min: 1 }),
  validate,
  notesController.revertVersion
);

export default router;
