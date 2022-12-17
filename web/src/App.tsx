import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Repo } from './models/Repo';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import './App.css';
import { Commit } from './models/Commit';

function RepositoryList() {
  const [reposState, setReposState] = useState<Repo[]>([]);
  const [reposeDisplayState, setReposDisplayState] = useState<Repo[]>([]);
  const [languagesState, setLanguagesState] = useState<string[]>([]);

  const getRepos = async () => {
    const result: AxiosResponse = await axios.get(
      `https://api.github.com/users/silverorange/repos`
    );
    if (result.status === 200) {
      const repos: Repo[] = result.data;
      let languages: string[] = ['all'];
      languages = languages.concat(
        repos
          .map((repo) => repo.language)
          .filter(
            (language, index, arr) =>
              arr.findIndex(
                (current) => current != null && current === language
              ) === index
          )
      );

      repos.sort((a: Repo, b: Repo) => {
        return Date.parse(b.created_at) - Date.parse(a.created_at);
      });

      setReposState(repos);
      setLanguagesState(languages);
    }
  };

  const languageFilter = (language: string) => {
    if (language === 'all') {
      setReposDisplayState(reposState);
    } else {
      setReposDisplayState(
        reposState.filter((repo) => repo.language === language)
      );
    }
  };

  useEffect(() => {
    getRepos();
  }, []);

  useEffect(() => {
    setReposDisplayState(reposState);
  }, [reposState]);

  return (
    <div className="RepositoryList">
      <h1 className="center">Repository List</h1>
      <div className="container">
        {languagesState &&
          languagesState.map((language) => {
            return (
              <div className="filter" key={language}>
                <button onClick={() => languageFilter(language)}>
                  {language}
                </button>
              </div>
            );
          })}
      </div>
      <br />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Language</th>
            <th>Fork Count</th>
          </tr>
        </thead>
        <tbody>
          {reposeDisplayState &&
            reposeDisplayState.map((repo) => {
              return (
                <>
                  <tr key={repo.id}>
                    <td>
                      <Link state={{ pros: repo }} to={`/detail/${repo.name}`}>
                        {repo.name}
                      </Link>
                    </td>
                    <td>{repo.description}</td>
                    <td>{repo.language}</td>
                    <td>{repo.forks_count}</td>
                  </tr>
                </>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

function RepositoryDetail() {
  const { name } = useParams();

  const [commitState, setCommitState] = useState<Commit>();
  const [readmeState, setReadmeState] = useState<any>();

  const getRepoCommits = async () => {
    const result: AxiosResponse = await axios.get(
      `https://api.github.com/repos/silverorange/${name}/commits`
    );
    if (result.status === 200) {
      const commits: Commit[] = result.data;
      setCommitState(commits[0]);
    }
  };

  const getRepoReadme = async () => {
    const result: AxiosResponse = await axios.get(
      `https://raw.githubusercontent.com/silverorange/${name}/master/README.md`
    );
    if (result.status === 200) {
      setReadmeState(result.data);
    }
  };

  useEffect(() => {
    getRepoCommits();
    getRepoReadme();
  });

  return (
    <div className="RepositoryDetail">
      <h1 className="center">Repository Detail</h1>
      <Link to="/">Go Back</Link>
      <h3>Author: {commitState?.commit.author.name}</h3>
      <h3>Message: {commitState?.commit.message}</h3>
      <h3>Date: {commitState?.commit.author.date}</h3>
      <ReactMarkdown children={readmeState} />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RepositoryList />} />
        <Route path="/detail/:name" element={<RepositoryDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
