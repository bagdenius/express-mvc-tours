import type { Request, Response } from 'express';

export const getOverview = (request: Request, response: Response) => {
  response.status(200).render('overview', { title: 'All tours' });
};

export const getTour = (request: Request, response: Response) => {
  response.status(200).render('tour', { title: 'Tour name placeholder' });
};
