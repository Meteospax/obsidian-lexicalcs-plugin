/*
 * Script was made by: @electron
 * Will not be refactored or touched, for more information, see their
 * GitHub page:
 * https://github.com/electron/electron
 *
 * Electron.js repository is licensed and distributed under
 * MIT License.
 *
 * Copyright (c) Electron contributors
 * Copyright (c) 2013-2020 GitHub Inc.
 */

/*
Usage:

$ node ./script/gn-check.js [--outDir=dirName]
*/

import { spawnSync } from 'node:child_process'
import { normalize, dirname, resolve, delimiter } from 'node:path'

import { getOutDir } from './lib/utils'
// This is "magic code"
// eslint-disable-next-line
const args = require('minimist')(process.argv.slice(2), { string: ['outDir'] })

const SOURCE_ROOT = normalize(dirname(__dirname))
const DEPOT_TOOLS = resolve(SOURCE_ROOT, '..', 'third_party', 'depot_tools')

const OUT_DIR = getOutDir({ outDir: args.outDir })
if (!OUT_DIR) {
  throw new Error('No viable out dir: one of Debug, Testing, or Release must exist.')
}

const env = {
  CHROMIUM_BUILDTOOLS_PATH: resolve(SOURCE_ROOT, '..', 'buildtools'),
  DEPOT_TOOLS_WIN_TOOLCHAIN: '0',
  ...process.env
}
// Users may not have depot_tools in PATH.
env.PATH = `${env.PATH}${delimiter}${DEPOT_TOOLS}`

const gnCheckDirs = [
  '//electron:electron_lib',
  '//electron:electron_app',
  '//electron/shell/common/api:mojo'
]

for (const dir of gnCheckDirs) {
  const args = ['check', `../out/${OUT_DIR}`, dir]
  const result = spawnSync('gn', args, { env, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status)
}

process.exit(0)
