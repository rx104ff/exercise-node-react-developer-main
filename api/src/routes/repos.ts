import { Router, Request, Response } from 'express';
import local from '../../data/repos.json';
import { debug as createDebug } from 'debug';
import { Repo } from '../models/Repo';
import axios, { AxiosResponse } from 'axios';

export const repos = Router();

const debug = createDebug('api');

repos.get('/', async (_: Request, res: Response) => {

  const localRepos: Repo[] = local;

  let result: AxiosResponse = await axios.get(`https://api.github.com/users/silverorange/repos`);
  let remoteRepos: Repo[] = result.data;  
  
  res.setHeader('Content-Type', 'application/json');

  res.status(200);

  // TODO: See README.md Task (A). Return repo data here. You’ve got this!
  res.json(remoteRepos.concat(localRepos).filter((repo) => !repo.fork));
});
