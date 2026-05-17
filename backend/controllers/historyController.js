import History from '../models/History.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const getAllHistory = catchAsync(async (req, res, next) => {
  const history = await History.find({ user: req.user }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: history.length,
    data: {
      history
    }
  });
});

export const createHistory = catchAsync(async (req, res, next) => {
  const { content, title } = req.body;

  if (!content) {
    return next(new AppError('Content is required', 400));
  }

  const newHistory = await History.create({
    user: req.user,
    content,
    title: title || 'Untitled Draft'
  });

  res.status(201).json({
    status: 'success',
    data: {
      history: newHistory
    }
  });
});

export const deleteHistory = catchAsync(async (req, res, next) => {
  const history = await History.findOneAndDelete({ _id: req.params.id, user: req.user });

  if (!history) {
    return next(new AppError('No history found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const updateHistory = catchAsync(async (req, res, next) => {
  const { content, title } = req.body;

  const history = await History.findOneAndUpdate(
    { _id: req.params.id, user: req.user },
    { content, title },
    { new: true, runValidators: true }
  );

  if (!history) {
    return next(new AppError('No history found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      history
    }
  });
});
