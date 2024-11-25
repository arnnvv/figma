import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Attributes, CustomFabricObject, ModifyShape } from "../../types";
import { fabric } from "fabric";
import { defaultNavElement } from "./constants";
import { v4 } from "uuid";

export const handleImageUpload = ({
	file,
	canvas,
	shapeRef,
	syncShapeInStorage,
}: {
	file: File;
	canvas: MutableRefObject<fabric.Canvas>;
	shapeRef: MutableRefObject<fabric.Object | null>;
	syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
	const reader = new FileReader();

	reader.onload = () => {
		fabric.Image.fromURL(reader.result as string, (img: fabric.Image) => {
			img.scaleToWidth(200);
			img.scaleToHeight(200);

			canvas.current.add(img);
			//@ts-expect-error: W T F
			img.objectId = v4();

			shapeRef.current = img;

			syncShapeInStorage(img);
			canvas.current.requestRenderAll();
		});
	};

	reader.readAsDataURL(file);
};

export const handleDelete = (
	canvas: fabric.Canvas,
	deleteShapeFromStorage: (id: string) => void,
) => {
	const activeObjects = canvas.getActiveObjects();
	if (!activeObjects || activeObjects.length === 0) return;

	if (activeObjects.length > 0)
		activeObjects.forEach((obj: CustomFabricObject<any>) => {
			if (!obj.objectId) return;
			canvas.remove(obj);
			deleteShapeFromStorage(obj.objectId);
		});

	canvas.discardActiveObject();
	canvas.requestRenderAll();
};

export const modifyShape = ({
	canvas,
	property,
	value,
	activeObjectRef,
	syncShapeInStorage,
}: ModifyShape) => {
	const selectedElement = canvas.getActiveObject();

	if (!selectedElement || selectedElement?.type === "activeSelection") return;

	if (property === "width") {
		selectedElement.set("scaleX", 1);
		selectedElement.set("width", value);
	} else if (property === "height") {
		selectedElement.set("scaleY", 1);
		selectedElement.set("height", value);
	} else {
		if (selectedElement[property as keyof object] === value) return;
		selectedElement.set(property as keyof object, value);
	}

	activeObjectRef.current = selectedElement;

	syncShapeInStorage(selectedElement);
};

export const createRectangle = (pointer: PointerEvent): fabric.Rect =>
	new fabric.Rect({
		left: pointer.x,
		top: pointer.y,
		width: 100,
		height: 100,
		fill: "#aabbcc",
		objectId: v4(),
	} as CustomFabricObject<fabric.Rect>);

export const createTriangle = (pointer: PointerEvent): fabric.Triangle =>
	new fabric.Triangle({
		left: pointer.x,
		top: pointer.y,
		width: 100,
		height: 100,
		fill: "#aabbcc",
		objectId: v4(),
	} as CustomFabricObject<fabric.Triangle>);

export const createCircle = (pointer: PointerEvent): fabric.Circle =>
	new fabric.Circle({
		left: pointer.x,
		top: pointer.y,
		radius: 100,
		fill: "#aabbcc",
		objectId: v4(),
	} as any);

export const createLine = (pointer: PointerEvent): fabric.Line =>
	new fabric.Line([pointer.x, pointer.y, pointer.x + 100, pointer.y + 100], {
		stroke: "#aabbcc",
		strokeWidth: 2,
		objectId: v4(),
	} as CustomFabricObject<fabric.Line>);

export const createText = (pointer: PointerEvent, text: string): fabric.IText =>
	new fabric.IText(text, {
		left: pointer.x,
		top: pointer.y,
		fill: "#aabbcc",
		fontFamily: "Helvetica",
		fontSize: 36,
		fontWeight: "400",
		objectId: v4(),
	} as fabric.ITextOptions);

export const createSpecificShape = (
	shapeType: string,
	pointer: PointerEvent,
):
	| fabric.Rect
	| fabric.Triangle
	| fabric.Circle
	| fabric.Line
	| fabric.IText
	| null => {
	switch (shapeType) {
		case "rectangle":
			return createRectangle(pointer);

		case "triangle":
			return createTriangle(pointer);

		case "circle":
			return createCircle(pointer);

		case "line":
			return createLine(pointer);

		case "text":
			return createText(pointer, "Tap to Type");

		default:
			return null;
	}
};

export const initializeFabric = ({
	fabricRef,
	canvasRef,
}: {
	fabricRef: MutableRefObject<fabric.Canvas | null>;
	canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}): fabric.Canvas => {
	const canvasElement = document.getElementById("canvas");
	const canvas = new fabric.Canvas(canvasRef.current, {
		width: canvasElement?.clientWidth,
		height: canvasElement?.clientHeight,
	});
	fabricRef.current = canvas;
	return canvas;
};

export const handleCanvasMouseDown = ({
	options,
	canvas,
	selectedShapeRef,
	isDrawing,
	shapeRef,
}: {
	options: fabric.IEvent;
	canvas: fabric.Canvas;
	selectedShapeRef: any;
	isDrawing: MutableRefObject<boolean>;
	shapeRef: MutableRefObject<fabric.Object | null>;
}) => {
	const pointer = canvas.getPointer(options.e);
	const target = canvas.findTarget(options.e, false);
	canvas.isDrawingMode = false;
	if (selectedShapeRef.current === "freeform") {
		isDrawing.current = true;
		canvas.isDrawingMode = true;
		canvas.freeDrawingBrush.width = 5;
		return;
	}
	canvas.isDrawingMode = false;
	if (
		target &&
		(target.type === selectedShapeRef.current ||
			target.type === "activeSelection")
	) {
		isDrawing.current = false;
		canvas.setActiveObject(target);
		target.setCoords();
	} else {
		isDrawing.current = true;
		shapeRef.current = createSpecificShape(
			selectedShapeRef.current,
			pointer as any,
		);
		if (shapeRef.current) canvas.add(shapeRef.current);
	}
};

export const handleCanvasMouseMove = ({
	options,
	canvas,
	isDrawing,
	selectedShapeRef,
	shapeRef,
	syncShapeInStorage,
}: {
	options: fabric.IEvent;
	canvas: fabric.Canvas;
	isDrawing: MutableRefObject<boolean>;
	selectedShapeRef: any;
	shapeRef: any;
	syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
	if (!isDrawing.current) return;
	if (selectedShapeRef.current === "freeform") return;
	canvas.isDrawingMode = false;
	const pointer = canvas.getPointer(options.e);
	switch (selectedShapeRef?.current) {
		case "rectangle":
			shapeRef.current?.set({
				width: pointer.x - (shapeRef.current?.left || 0),
				height: pointer.y - (shapeRef.current?.top || 0),
			});
			break;

		case "circle":
			shapeRef.current.set({
				radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
			});
			break;

		case "triangle":
			shapeRef.current?.set({
				width: pointer.x - (shapeRef.current?.left || 0),
				height: pointer.y - (shapeRef.current?.top || 0),
			});
			break;

		case "line":
			shapeRef.current?.set({
				x2: pointer.x,
				y2: pointer.y,
			});
			break;

		case "image":
			shapeRef.current?.set({
				width: pointer.x - (shapeRef.current?.left || 0),
				height: pointer.y - (shapeRef.current?.top || 0),
			});
		default:
			break;
	}
	canvas.renderAll();
	if (shapeRef.current?.objectId) syncShapeInStorage(shapeRef.current);
};

export const handleCanvasMouseUp = ({
	canvas,
	isDrawing,
	shapeRef,
	activeObjectRef,
	selectedShapeRef,
	syncShapeInStorage,
	setActiveElement,
}: {
	canvas: fabric.Canvas;
	isDrawing: MutableRefObject<boolean>;
	shapeRef: any;
	activeObjectRef: MutableRefObject<fabric.Object | null>;
	selectedShapeRef: any;
	syncShapeInStorage: (shape: fabric.Object) => void;
	setActiveElement: any;
}) => {
	isDrawing.current = false;
	if (selectedShapeRef.current === "freeform") return;
	syncShapeInStorage(shapeRef.current);
	shapeRef.current = null;
	activeObjectRef.current = null;
	selectedShapeRef.current = null;
	if (!canvas.isDrawingMode) {
		setTimeout(() => {
			setActiveElement(defaultNavElement);
		}, 700);
	}
};

export const handleCanvasObjectModified = ({
	options,
	syncShapeInStorage,
}: {
	options: fabric.IEvent;
	syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
	const target = options.target;
	if (!target) return;
	if (target?.type == "activeSelection") {
		// fix this
	} else syncShapeInStorage(target);
};

export const handlePathCreated = ({
	options,
	syncShapeInStorage,
}: {
	options: (fabric.IEvent & { path: CustomFabricObject<fabric.Path> }) | any;
	syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
	const path = options.path;
	if (!path) return;
	path.set({
		objectId: v4(),
	});
	syncShapeInStorage(path);
};

export const handleCanvasObjectMoving = ({
	options,
}: {
	options: fabric.IEvent;
}) => {
	const target = options.target as fabric.Object;
	const canvas = target.canvas as fabric.Canvas;
	target.setCoords();
	if (target && target.left) {
		target.left = Math.max(
			0,
			Math.min(
				target.left,
				(canvas.width || 0) - (target.getScaledWidth() || target.width || 0),
			),
		);
	}

	if (target && target.top) {
		target.top = Math.max(
			0,
			Math.min(
				target.top,
				(canvas.height || 0) - (target.getScaledHeight() || target.height || 0),
			),
		);
	}
};

export const handleCanvasSelectionCreated = ({
	options,
	isEditingRef,
	setElementAttributes,
}: {
	options: fabric.IEvent;
	isEditingRef: MutableRefObject<boolean>;
	setElementAttributes: Dispatch<SetStateAction<Attributes>>;
}) => {
	if (isEditingRef.current) return;
	if (!options?.selected) return;
	const selectedElement = options?.selected[0] as fabric.Object;
	if (selectedElement && options.selected.length === 1) {
		const scaledWidth = selectedElement?.scaleX
			? selectedElement.width! * selectedElement?.scaleX
			: selectedElement?.width;

		const scaledHeight = selectedElement?.scaleY
			? selectedElement.height! * selectedElement?.scaleY
			: selectedElement?.height;

		setElementAttributes({
			width: scaledWidth?.toFixed(0).toString() || "",
			height: scaledHeight?.toFixed(0).toString() || "",
			fill: selectedElement?.fill?.toString() || "",
			stroke: selectedElement?.stroke || "",
			// @ts-expect-error: W T F
			fontSize: selectedElement?.fontSize || "",
			// @ts-expect-error: W T F
			fontFamily: selectedElement?.fontFamily || "",
			// @ts-expect-error: W T F
			fontWeight: selectedElement?.fontWeight || "",
		});
	}
};

export const handleCanvasObjectScaling = ({
	options,
	setElementAttributes,
}: {
	options: fabric.IEvent;
	setElementAttributes: Dispatch<SetStateAction<Attributes>>;
}) => {
	const selectedElement = options.target;
	const scaledWidth = selectedElement?.scaleX
		? selectedElement.width! * selectedElement?.scaleX
		: selectedElement?.width;

	const scaledHeight = selectedElement?.scaleY
		? selectedElement.height! * selectedElement?.scaleY
		: selectedElement?.height;

	setElementAttributes(
		(
			prev: Attributes,
		): {
			width: string;
			height: string;
			fontSize: string;
			fontFamily: string;
			fontWeight: string;
			fill: string;
			stroke: string;
		} => ({
			...prev,
			width: scaledWidth?.toFixed(0).toString() || "",
			height: scaledHeight?.toFixed(0).toString() || "",
		}),
	);
};

export const renderCanvas = ({
	fabricRef,
	canvasObjects,
	activeObjectRef,
}: {
	fabricRef: MutableRefObject<fabric.Canvas | null>;
	canvasObjects: any;
	activeObjectRef: any;
}) => {
	fabricRef.current?.clear();
	Array.from(canvasObjects, ([objectId, objectData]) => {
		fabric.util.enlivenObjects(
			[objectData],
			(enlivenedObjects: fabric.Object[]) => {
				enlivenedObjects.forEach((enlivenedObj: fabric.Object) => {
					if (activeObjectRef.current?.objectId === objectId)
						fabricRef.current?.setActiveObject(enlivenedObj);

					fabricRef.current?.add(enlivenedObj);
				});
			},
			"fabric",
		);
	});

	fabricRef.current?.renderAll();
};

export const handleResize = ({ canvas }: { canvas: fabric.Canvas | null }) => {
	const canvasElement = document.getElementById("canvas");
	if (!canvasElement) return;
	if (!canvas || canvas === undefined) return;
	canvas.setDimensions({
		width: canvasElement.clientWidth,
		height: canvasElement.clientHeight,
	});
};

export const handleCanvasZoom = ({
	options,
	canvas,
}: {
	options: fabric.IEvent & { e: WheelEvent };
	canvas: fabric.Canvas;
}) => {
	const delta = options.e?.deltaY;
	let zoom = canvas.getZoom();
	const minZoom = 0.2;
	const maxZoom = 1;
	const zoomStep = 0.001;

	zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep), maxZoom);

	canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);

	options.e.preventDefault();
	options.e.stopPropagation();
};

export const createShape = (
	canvas: fabric.Canvas,
	pointer: PointerEvent,
	shapeType: string,
):
	| fabric.Rect
	| fabric.Triangle
	| fabric.Circle
	| fabric.Line
	| fabric.IText
	| null => {
	if (shapeType === "freeform") {
		canvas.isDrawingMode = true;
		return null;
	}
	return createSpecificShape(shapeType, pointer);
};

export const bringElement = ({
	canvas,
	direction,
	syncShapeInStorage,
}: {
	canvas: fabric.Canvas;
	direction: string;
	syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
	if (!canvas) return;

	const selectedElement = canvas.getActiveObject();

	if (!selectedElement || selectedElement?.type === "activeSelection") return;

	if (direction === "front") canvas.bringToFront(selectedElement);
	else if (direction === "back") canvas.sendToBack(selectedElement);

	syncShapeInStorage(selectedElement);
};

export const handleCopy = (canvas: fabric.Canvas): fabric.Object[] => {
	const activeObjects = canvas.getActiveObjects();
	if (activeObjects.length > 0) {
		// Serialize the selected objects
		const serializedObjects = activeObjects.map((obj: fabric.Object) =>
			obj.toObject(),
		);
		// Store the serialized objects in the clipboard
		localStorage.setItem("clipboard", JSON.stringify(serializedObjects));
	}

	return activeObjects;
};

export const handlePaste = ({
	canvas,
	syncShapeInStorage,
}: {
	canvas: fabric.Canvas;
	syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
	if (!canvas || !(canvas instanceof fabric.Canvas)) {
		console.error("Invalid canvas object. Aborting paste operation.");
		return;
	}

	const clipboardData = localStorage.getItem("clipboard");

	if (clipboardData) {
		try {
			const parsedObjects = JSON.parse(clipboardData);
			parsedObjects.forEach((objData: fabric.Object) => {
				// convert the plain javascript objects retrieved from localStorage into fabricjs objects (deserialization)
				fabric.util.enlivenObjects(
					[objData],
					(enlivenedObjects: fabric.Object[]) => {
						enlivenedObjects.forEach((enlivenedObj: fabric.Object) => {
							// Offset the pasted objects to avoid overlap with existing objects
							enlivenedObj.set({
								left: enlivenedObj.left || 0 + 20,
								top: enlivenedObj.top || 0 + 20,
								objectId: v4(),
								fill: "#aabbcc",
							} as CustomFabricObject<any>);

							canvas.add(enlivenedObj);
							syncShapeInStorage(enlivenedObj);
						});
						canvas.renderAll();
					},
					"fabric",
				);
			});
		} catch (error) {
			console.error("Error parsing clipboard data:", error);
		}
	}
};

export const handleKeyDown = ({
	e,
	canvas,
	undo,
	redo,
	syncShapeInStorage,
	deleteStorageShape,
}: {
	e: KeyboardEvent;
	canvas: fabric.Canvas | any;
	undo: () => void;
	redo: () => void;
	syncShapeInStorage: (shape: fabric.Object) => void;
	deleteStorageShape: (id: string) => void;
}) => {
	if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 67) handleCopy(canvas);

	// ctrl/cmd + v (paste)
	if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 86)
		handlePaste({ canvas, syncShapeInStorage });

	// ctrl/cmd + x (cut)
	if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 88) {
		handleCopy(canvas);
		handleDelete(canvas, deleteStorageShape);
	}

	// ctrl/cmd + z (undo)
	if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 90) undo();

	// ctrl/cmd + y (redo)
	if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 89) redo();

	if (e.keyCode === 191 && !e.shiftKey) e.preventDefault();
};
