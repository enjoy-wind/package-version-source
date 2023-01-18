import path from 'path'
import process from 'node:process'

import {spawnSync} from 'child_process'
import crossSpawn from 'cross-spawn'


const SPACES_REGEXP = / +/g

// Handle `execaCommand()`
const parseCommand = (command) => {
    const tokens = []
    for (const token of command.trim().split(SPACES_REGEXP)) {
        // Allow spaces to be escaped by a backslash if not meant as a delimiter
        const previousToken = tokens[tokens.length - 1]
        if (previousToken && previousToken.endsWith('\\')) {
            // Merge previous token with current one
            tokens[tokens.length - 1] = `${previousToken.slice(0, -1)} ${token}`
        } else {
            tokens.push(token)
        }
    }
    const [file, ...args] = tokens
    return handleArguments(file, args)
}

const handleArguments = (file, args, options = {}) => {
    const parsed = crossSpawn._parse(file, args, options)
    file = parsed.command
    args = parsed.args
    options = parsed.options
    const DEFAULT_MAX_BUFFER = 1000 * 1000 * 100

    options = {
        maxBuffer: DEFAULT_MAX_BUFFER,
        buffer: true,
        extendEnv: true,
        preferLocal: false,
        localDir: options.cwd || process.cwd(),
        execPath: process.execPath,
        encoding: 'utf8',
        reject: true,
        cleanup: true,
        all: false,
        windowsHide: true,
        ...options,
    }

    options.stdio = normalizeStdio(options)

    if (process.platform === 'win32' && path.basename(file, '.exe') === 'cmd') {
        // #116
        args.unshift('/q')
    }

    return [file, args, options]
}
const normalizeStdio = (options) => {
    const aliases = ['stdin', 'stdout', 'stderr']

    const hasAlias = (options) =>
        aliases.some((alias) => options[alias] !== undefined)
    if (!options) {
        return
    }

    const {stdio} = options

    if (stdio === undefined) {
        return aliases.map((alias) => options[alias])
    }

    if (hasAlias(options)) {
        throw new Error(
            `It's not possible to provide \`stdio\` in combination with one of ${aliases
                .map((alias) => `\`${alias}\``)
                .join(', ')}`
        )
    }

    if (typeof stdio === 'string') {
        return stdio
    }

    if (!Array.isArray(stdio)) {
        throw new TypeError(
            `Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``
        )
    }

    const length = Math.max(stdio.length, aliases.length)
    return Array.from({length}, (value, index) => stdio[index])
}

function getGitHash() {
    const res = spawnSync(...parseCommand('git rev-parse --short HEAD'))
    return res.stdout
}

function getGitBranch() {
    const res = spawnSync(...parseCommand('git rev-parse --abbrev-ref HEAD'))
    return res.stdout
}

function getGitProjectName() {
    const res = spawnSync(...parseCommand('git rev-parse --absolute-git-dir'))
    const projectName = res.stdout.split(path.sep).at(-2)
    return projectName
}

/*
 * 此插件用于打包记录当前版本信息
 * */
export function getMetaRevised() {
    return `<meta name="revised" content="source:${getGitProjectName()}~${getGitBranch()}~${getGitHash()}" />`
}

export function getMetaRevisedObj() {
    return {
        revised: "source:${getGitProjectName()}~${getGitBranch()}~${getGitHash()}"
    }
}

