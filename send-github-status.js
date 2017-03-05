#!/usr/bin/env node
'use strict';

const request = require('request');

const githubUser = process.env.GITHUB_STATUS_USER;
const githubPassword = process.env.GITHUB_STATUS_PASSWORD;
const buildUrl = process.env.CIRCLE_BUILD_URL;

const projectUserName = process.env.CIRCLE_PROJECT_USERNAME;
const projectRepoName = process.env.CIRCLE_PROJECT_REPONAME;
const buildSha = process.env.CIRCLE_SHA1;

const statusContext = process.argv[2]
const statusDescription = process.argv[3]
const statusValue = process.argv[4]

request({
  headers: {
    'User-Agent': 'CI Build Status Setter'
  },
  auth: {
    user: githubUser,
    pass: githubPassword
  },
  method: 'POST',
  url: `https://api.github.com/repos/${projectUserName}/${projectRepoName}/statuses/${buildSha}`,
  json: {
    "state": statusValue,
    "target_url": buildUrl,
    "description": statusDescription,
    "context": statusContext
  }
}, function (error, response, body) {
  if (error) {
    return console.error(error);
  }
  console.log(`Attached test status to commit as ${statusContext}`);
});
