import { THIRTY_DAYS } from '../constants/index.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUsersSession,
  sendResetToken,
  resetPassword,

} from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
}


export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);
try{
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
} catch (error) {
    console.error('Error in loginUserController:', error.message);
    res.status(500).json({
      message: 'InternalServerError',
      data: {
        message: error.message,
      },
    });
  }
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const refreshUsersSessionController = async (req, res) => {
  try{
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
}catch (error) {
    console.error('Error in refreshUserSessionController:', error.message);
    res.status(500).json({
      message: 'InternalServerError',
      data: {
        message: error.message,
      },
    });
  }
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const sendResetEmailController = async (req, res) => {
 
 try{
  await sendResetToken(req.body.email);
  res.json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
}catch (error) {
    console.error('121, Error in sendtResetEmailController:', error.message);
    res.status(500).json({
      message: 'InternalServerError',
      data: {
        message: 'Failed to send the email, please try again later.',
      },
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    await resetPassword(req.body);
    res.json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
      res.status(500).json({
        message: 'InternalServerError',
        data: {
          message: error.message,
        },
      });
    }
};