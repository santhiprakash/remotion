import {makeDragData} from './drag-data';
import type {StudioElementPayload} from './element-payload';
import {isUrl} from './validation';

export const setStudioDragData = ({
	dataTransfer,
	payload,
}: {
	readonly dataTransfer: DataTransfer;
	readonly payload: StudioElementPayload;
}): void => {
	const dragData = makeDragData({
		type: 'element',
		...payload.element,
		durationInFrames: payload.durationInFrames,
		origin:
			payload.origin ??
			(typeof window !== 'undefined' && isUrl(window.location.origin)
				? window.location.origin
				: undefined),
	});

	dataTransfer.effectAllowed = 'copy';
	dataTransfer.setData(dragData.mimeType, dragData.payload);
	dataTransfer.setData('text/plain', dragData.payload);
};
