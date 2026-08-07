import {expect, spyOn, test} from 'bun:test';
import * as childProcess from 'node:child_process';
import {EventEmitter} from 'node:events';

type SpawnCall = [
	string,
	readonly string[] | undefined,
	childProcess.SpawnOptions | undefined,
];

const getSkillsSpawnCalls = async (expectedCommand: 'npx' | 'npx.cmd') => {
	const calls: SpawnCall[] = [];

	const mock = spyOn(childProcess, 'spawn').mockImplementation(
		(
			spawnedCommand: string,
			spawnedArgs: readonly string[] | undefined,
			spawnedOptions: childProcess.SpawnOptions | undefined,
		) => {
			calls.push([spawnedCommand, spawnedArgs, spawnedOptions]);
			const fakeChild = new EventEmitter() as childProcess.ChildProcess;
			setTimeout(() => fakeChild.emit('exit', 0), 0);
			return fakeChild;
		},
	);

	const {skillsCommand} = await import('../skills');
	await skillsCommand(['add'], 'info', {cwd: '/', environment: {}});
	mock.mockRestore();

	expect(calls.length).toBe(1);
	const [actualCommand, , actualOptions] = calls[0];
	expect(actualCommand).toBe(expectedCommand);
	return actualOptions;
};

test('spawns npx with the correct shell option on the current platform', async () => {
	const expectedCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
	const options = await getSkillsSpawnCalls(expectedCommand);
	expect(options?.shell).toBe(process.platform === 'win32');
});

test('spawns npx.cmd with shell: true when process.platform is win32', async () => {
	const originalPlatform = process.platform;
	process.platform = 'win32';
	try {
		const options = await getSkillsSpawnCalls('npx.cmd');
		expect(options?.shell).toBe(true);
	} finally {
		process.platform = originalPlatform;
	}
});
