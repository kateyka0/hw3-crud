import createHttpError from 'http-errors';
import { createContact, deleteContact, getAllContacts, getContactById, updateContact } from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getAllContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const { _id: userId } = req.user;

    const contacts = await getAllContacts({ page, perPage, sortBy, sortOrder, userId });
    res.status(200).json({ status: 200, message: 'Successfully found contacts!', data: contacts });
  } catch (error) {
    next(error);
  }
};

export const getContactByIdController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: userId } = req.user;
    const contact = await getContactById(contactId, userId);

    if (!contact) {
      throw createHttpError(404, 'Contact not found');
    }
    res.status(200).json({ status: 200, message: `Successfully found contact with id ${contactId}!`, data: contact });
  } catch (error) {
    next(error);
  }
};

export const createContactController = async (req, res, next) => {
  try {
    const photo = req.file;
    let photoUrl;

    if (photo) {
      try {
        photoUrl = await saveFileToCloudinary(photo);
      } catch  {
        return next(createHttpError(500, 'Failed to upload photo to Cloudinary'));
      }
    }

    const payload = { ...req.body, userId: req.user._id, photo: photoUrl };
    const contact = await createContact(payload);

    res.status(201).json({ status: 201, message: 'Successfully created a contact!', data: contact });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const patchContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: userId } = req.user;
    const photo = req.file;
    let photoUrl;

    if (photo) {
      try {
        photoUrl = await saveFileToCloudinary(photo);
      } catch {
        return next(createHttpError(500, 'Failed to upload photo to Cloudinary'));
      }
    }

    const result = await updateContact(contactId, userId, { ...req.body, photo: photoUrl });
    if (!result) {
      throw createHttpError(404, 'Contact not found');
    }

    res.json({ status: 200, message: 'Successfully patched a contact!', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: userId } = req.user;
    const contact = await deleteContact(contactId, userId);

    if (!contact) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
