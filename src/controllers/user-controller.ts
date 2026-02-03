import type { Request, Response } from 'express';

export function getUsers(request: Request, response: Response) {
  response
    .status(500)
    .json({ status: 'error', message: 'Route is not defined!' });
}

export function getUser(request: Request, response: Response) {
  response
    .status(500)
    .json({ status: 'error', message: 'Route is not defined!' });
}

export function createUser(request: Request, response: Response) {
  response
    .status(500)
    .json({ status: 'error', message: 'Route is not defined!' });
}

export function updateUser(request: Request, response: Response) {
  response
    .status(500)
    .json({ status: 'error', message: 'Route is not defined!' });
}

export function deleteUser(request: Request, response: Response) {
  response
    .status(500)
    .json({ status: 'error', message: 'Route is not defined!' });
}
