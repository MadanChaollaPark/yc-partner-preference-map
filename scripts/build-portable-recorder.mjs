import { copyFile, cp, mkdir, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const stage = join(tmpdir(), `vedawiki-recorder-${Date.now()}`)
const appDir = join(stage, 'Vedawiki-Recorder')
const recorderDir = join(appDir, 'recorder')
const docsDir = join(appDir, 'docs')
const output = join(root, 'public', 'downloads', 'VedawikiFieldRecorder.zip')

const recorderFiles = [
  '__init__.py',
  'export_csv.py',
  'import_logs.py',
  'recorder.py',
  'requirements.txt',
  'server.py',
  'sources.py',
]

async function main() {
  await rm(stage, { force: true, recursive: true })
  await mkdir(recorderDir, { recursive: true })
  await mkdir(join(appDir, 'sessions'), { recursive: true })
  await mkdir(docsDir, { recursive: true })

  await cp(join(root, 'portable-recorder', 'Vedawiki-Recorder'), appDir, {
    recursive: true,
    filter: (source) => !source.includes('.venv') && !source.includes('__pycache__'),
  })
  await mkdir(recorderDir, { recursive: true })
  await mkdir(docsDir, { recursive: true })

  for (const file of recorderFiles) {
    await copyFile(join(root, 'recorder', file), join(recorderDir, file))
  }
  await copyFile(join(root, 'docs', 'passive-recorder-plan.md'), join(docsDir, 'passive-recorder-plan.md'))

  const result = spawnSync('zip', ['-qr', output, 'Vedawiki-Recorder'], {
    cwd: stage,
    stdio: 'inherit',
  })
  await rm(stage, { force: true, recursive: true })
  if (result.status !== 0) {
    throw new Error('zip command failed')
  }
  console.log(`wrote ${output}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

