import {afterEach, expect, spyOn, test} from 'bun:test';
import * as childProcess from 'node:child_process';
import type {ChildProcess, SpawnOptions} from 'node:child_process';
import {EventEmitter} from 'node:events';
import {skillsCommand} from '../skills';

type SpawnCall = [
	command: string,
	args: readonly string[] | undefined,
	options: SpawnOptions | undefined,
];

type SpawnFn = (
	command: string,
	args: readonly string[] | undefined,
	options: SpawnOptions | undefined,
) => ChildProcess;

const originalPlatform = process.platform;

const setPlatform = (platform: string) => {
	Object.defineProperty(process, 'platform', {value: platform});
};

const restorePlatform = () => {
	Object.defineProperty(process, 'platform', {value: originalPlatform});
};

afterEach(restorePlatform);

const getSkillsSpawnCalls = async (expectedCommand: 'npx' | 'npx.cmd') => {
	const calls: SpawnCall[] = [];

	const childProcessModule = childProcess as unknown as {spawn: SpawnFn};
	const mock = spyOn(childProcessModule, 'spawn').mockImplementation(
		(command, args, options) => {
			calls.push([command, args, options]);
			const fakeChild = new EventEmitter() as unknown as ChildProcess;
			setTimeout(() => {
				fakeChild.emit('exit', 0);
			}, 0);
			return fakeChild;
		},
	);

	await skillsCommand(['add'], 'info', {cwd: '/', environment: {}});
	mock.mockRestore();

	expect(calls.length).toBe(1);
	const [actualCommand, , actualOptions] = calls[0] as SpawnCall;
	expect(actualCommand).toBe(expectedCommand);
	return actualOptions;
};

test('spawns npx with the correct shell option on the current platform', async () => {
	const expectedCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
	const options = await getSkillsSpawnCalls(expectedCommand);
	expect(options?.shell).toBe(process.platform === 'win32');
});

test('spawns npx.cmd with shell: true when process.platform is win32', async () => {
	setPlatform('win32');
	const options = await getSkillsSpawnCalls('npx.cmd');
	expect(options?.shell).toBe(true);
});
